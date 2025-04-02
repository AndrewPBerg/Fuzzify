import subprocess
import json
from flask import Flask, jsonify, request
from sqlmodel import SQLModel, create_engine, Session, select, text
from flask_cors import CORS
import os
from dotenv import load_dotenv
from google.cloud import pubsub_v1
import logging
import time
from models import User, Domain, Permutation
import threading
from uuid import uuid4
from test_perm import generate_and_store_permutations

# Enable Debugging for Logs
DEBUG = True
DROP_TABLES = False 

logging.basicConfig(level=logging.DEBUG if DEBUG else logging.INFO)
logger = logging.getLogger(__name__)
logging.getLogger('google.cloud.pubsub_v1.subscriber._protocol.leaser').setLevel(logging.WARNING)
logging.getLogger('google.cloud.pubsub_v1.subscriber._protocol.heartbeater').setLevel(logging.WARNING)

if DEBUG:
    logger.debug("Starting application in DEBUG mode")

# Load environment variables
# load_dotenv() # NOTE: this is not needed when using docker compose env variables

# Initialize Flask App  
app = Flask(__name__)
CORS(app)

# Database Connection
DATABASE_URL = os.getenv("DB_URL", "mysql+mysqlconnector://user:password@db:3306/dnstwist_db")
if DEBUG:
    logger.debug(f"Connecting to database at: {DATABASE_URL}")

# Add connection retry
max_retries = 5
retry_delay = 5  # seconds
retries = 0

while retries < max_retries:
    try:
        logger.info(f"Attempt {retries + 1}/{max_retries} to connect to database...")
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        # Test connection
        with engine.connect() as conn:
            logger.info("Database connection successful!")
            break
    except Exception as e:
        retries += 1
        logger.error(f"Database connection failed: {e}")
        if retries < max_retries:
            logger.info(f"Retrying in {retry_delay} seconds...")
            time.sleep(retry_delay)
        else:
            logger.error("Max retries reached. Could not connect to database.")
            # Continue execution and let app fail later if needed
            engine = create_engine(DATABASE_URL)
            break

# Ensure Database Schema Exists
def create_db_and_tables():
    """Ensures that the database schema matches our models."""
    try:
        if DEBUG:
            logger.debug("Initializing database schema...")
        with engine.begin() as conn:
            SQLModel.metadata.create_all(conn)
        if DEBUG:
            logger.debug("Database schema initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing database schema: {e}")
        raise

# Add this before create_db_and_tables() call
def drop_all_tables():
    """Drops all tables to recreate schema."""
    try:
        if DEBUG:
            logger.debug("Dropping all tables...")
        with engine.begin() as conn:
            SQLModel.metadata.drop_all(conn)
        if DEBUG:
            logger.debug("All tables dropped successfully.")
    except Exception as e:
        logger.error(f"Error dropping tables: {e}")
        raise



# ------------------------- Pub/Sub Configuration -------------------------

os.environ["PUBSUB_EMULATOR_HOST"] = os.getenv("PUBSUB_EMULATOR_HOST", "localhost:8085")
os.environ["GOOGLE_CLOUD_PROJECT"] = os.getenv("PUBSUB_PROJECT_ID", "your-project-id")

# Initialize Pub/Sub clients
publisher = pubsub_v1.PublisherClient()
subscriber = pubsub_v1.SubscriberClient()

# Topic and Subscription Names
project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
topic_name = "frontend-to-backend"
subscription_name = "backend-sub"

# Topic & Subscription Paths
topic_path = publisher.topic_path(project_id, topic_name)
subscription_path = subscriber.subscription_path(project_id, subscription_name)

# Ensure Pub/Sub Topic Exists
def ensure_topic():
    try:
        topics = [t.name for t in publisher.list_topics(request={"project": f"projects/{project_id}"})]
        if topic_path not in topics:
            publisher.create_topic(request={"name": topic_path})
            logger.info(f"✅ Topic {topic_name} created.")
        else:
            logger.info(f"⚠️ Topic {topic_name} already exists.")
    except Exception as e:
        logger.error(f"❌ Error creating topic: {e}")

# Ensure Pub/Sub Subscription Exists
def ensure_subscription():
    try:
        subscriptions = [s.name for s in subscriber.list_subscriptions(request={"project": f"projects/{project_id}"})]
        if subscription_path not in subscriptions:
            subscriber.create_subscription(request={"name": subscription_path, "topic": topic_path})
            logger.info(f"✅ Subscription {subscription_name} created.")
        else:
            logger.info(f"⚠️ Subscription {subscription_name} already exists.")
    except Exception as e:
        logger.error(f"❌ Error creating subscription: {e}")

@app.route('/publish-message', methods=['POST'])
def publish_message():
    """Publishes a message from frontend to backend via Pub/Sub."""
    data = request.json
    if not data or "message" not in data:
        return jsonify({"error": "Message field is required"}), 400

    message_data = data["message"].encode("utf-8")

    try:
        future = publisher.publish(topic_path, message_data)
        msg_id = future.result()
        logger.info(f"Published message: {msg_id}")
        return jsonify({"message": "Message published", "msg_id": msg_id})
    except Exception as e:
        logger.error(f"Error publishing message: {e}")
        return jsonify({"error": str(e)}), 500

def callback(message):
    try:
        message_data = message.data.decode("utf-8")
        logger.info(f"📩 Received message: {message_data}")
        message.ack()
    except Exception as e:
        logger.error(f"Error processing message: {e}")

def start_subscriber():
    def run():
        while True:
            try:
                streaming_pull_future = subscriber.subscribe(subscription_path, callback=callback)
                logger.info("🔄 Listening for messages on subscription...")
                streaming_pull_future.result()
            except Exception as e:
                logger.error(f"Subscriber error: {e}")
                time.sleep(5)

    thread = threading.Thread(target=run, daemon=True)
    thread.start()

# ------------------------- API Endpoints -------------------------


@app.route("/")
def health():
    return "OK", 200
# Health check endpoint
@app.route('/api', methods=['HEAD', 'GET'])
def health_check():
    """API endpoint to check if the API is up."""
    if request.method == 'GET':
        response = jsonify({"status": "API is up and running, use HEAD for faster response"})
        response.status_code = 200
        return response
    else: # HEAD request
        return '', 204  # No Content for HEAD requests

# Describe the user table schema
@app.route('/api/describe', methods=['GET'])
def describe_user_table():
    """API endpoint to describe the user table structure."""
    try:
        with Session(engine) as session:  # Use Session from sqlmodel
            result = session.exec(text("SHOW COLUMNS FROM user"))  # Execute the raw SQL command
            columns = [{"Field": row[0], "Type": row[1], "Null": row[2], "Key": row[3], "Default": row[4], "Extra": row[5]} for row in result]
            # TODO: Add all domains schema to the response
        return jsonify(columns), 200
        
    except Exception as e:
        logger.error(f"Error describing user table: {e}")
        return jsonify({"error": "Failed to describe user table"}), 500

# Test the connection to the database
@app.route('/api/test-connection', methods=['GET'])
def test_connection():
    try:
        with engine.connect() as conn:
            return jsonify({"message": "Connection successful"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/<user_id>', methods=['DELETE', 'PATCH', 'GET'])
def specific_user_route(user_id):
    """API endpoint to delete, update, or get a user."""
    if request.method == 'GET':
        if DEBUG:
            logger.debug(f"Received request to get user: {user_id}")
            
        with Session(engine) as session:
            user = session.exec(select(User).where(User.user_id == user_id)).first()
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            return jsonify({
                "user_id": user.user_id,
                "username": user.username,
                "horizontal_sidebar": user.horizontal_sidebar,
                "theme": user.theme
            }), 200
    
    elif request.method == 'DELETE':
        if DEBUG:
            logger.debug(f"Received request to delete user: {user_id}")
            
        with Session(engine) as session:
            user = session.exec(select(User).where(User.user_id == user_id)).first()
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            session.delete(user)
            session.commit()
        
        return jsonify({"message": "User deleted successfully", "user_id": user_id}), 200
    
    elif request.method == 'PATCH':
        if DEBUG:
            logger.debug(f"Received request to update user: {user_id}")
        
        data = request.json
        if not data:
            return jsonify({"error": "Missing data in request body"}), 400
        
        # Check if at least one field to update is provided
        if not any(key in data for key in ['username', 'horizontal_sidebar', 'theme']):
            return jsonify({"error": "At least one of username, horizontal_sidebar, or theme must be provided"}), 400
        
        with Session(engine) as session:
            user = session.exec(select(User).where(User.user_id == user_id)).first()
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            # Handle username update if provided
            if 'username' in data:
                new_username = data.get("username")
                
                # Check if the new username already exists for another user
                existing_user = session.exec(
                    select(User).where(
                        (User.username == new_username) & 
                        (User.user_id != user_id)
                    )
                ).first()
                
                if existing_user:
                    return jsonify({"error": "Username already taken by another user"}), 409
                
                # Update username
                user.username = new_username
            
            # Update horizontal_sidebar if provided
            if 'horizontal_sidebar' in data:
                user.horizontal_sidebar = data.get("horizontal_sidebar")
            
            # Update theme if provided
            if 'theme' in data:
                user.theme = data.get("theme")
                
            session.add(user)
            session.commit()
            session.refresh(user)
            
            return jsonify({
                "message": "User updated successfully",
                "user_id": user_id,
                "username": user.username,
                "horizontal_sidebar": user.horizontal_sidebar,
                "theme": user.theme
            }), 200

# Create a new user
@app.route('/api/user', methods=['POST', 'GET'])
def user_route():
    """API endpoint to create a new user and return the user_id or view all users."""
    if request.method == 'GET':
        if DEBUG:
            logger.debug("Received request to view all users.")
        
        with Session(engine) as session:
            users = session.exec(select(User)).all()
            user_list = [{"user_id": user.user_id, "username": user.username} for user in users]
            
        return jsonify({"users": user_list}), 200
    
    # POST method - create a new user
    if DEBUG:
        logger.debug("Received request to create a new user.")

    data = request.json
    username = data.get("username")

    if not username:
        return jsonify({"error": "Missing required field 'username'"}), 400

    with Session(engine) as session:
        existing_user = session.exec(select(User).where(User.username == username)).first()
        
        if existing_user:
            return jsonify({
                "message": "User already exists", 
                "username": existing_user.username,
                "user_id": existing_user.user_id
            }), 200
        
        new_user = User(username=username)
        session.add(new_user)
        session.commit()
        session.refresh(new_user)

    return jsonify({
        "message": "User created successfully", 
        "username": new_user.username,
        "user_id": new_user.user_id
    }), 201

@app.route('/api/<user_id>/domain', methods=['POST', 'GET', 'DELETE'])
def domain_route(user_id):
    """API endpoint to insert a domain for a user or view all domains for a user."""
    if request.method == 'GET':
        if DEBUG:
            logger.debug(f"Received request to view domains for user: {user_id}")
        
        with Session(engine) as session:
            user = session.exec(select(User).where(User.user_id == user_id)).first()
            
            if not user:
                return jsonify({"error": "User not found"}), 404
                
            domains = session.exec(select(Domain).where(Domain.user_id == user_id)).all()
            domain_list = [{"domain_name": domain.domain_name, "total_scans": domain.total_scans} for domain in domains]
            
        return jsonify({"domains": domain_list}), 200
    
    elif request.method == 'DELETE':
        if DEBUG:
            logger.debug(f"Received request to delete domain for user: {user_id}")
        
        # Get the domain name from request body
        try:
            data = request.json
            if not data or 'domain_name' not in data:
                return jsonify({"error": "Missing domain_name in request body"}), 400
                
            domain_name = data.get("domain_name")
            logger.debug(f"Attempting to delete domain: {domain_name} for user: {user_id}")
        except Exception as e:
            logger.error(f"Error parsing DELETE request: {e}")
            return jsonify({"error": "Invalid JSON in request body"}), 400
            
        with Session(engine) as session:
            # Check if user exists
            user = session.exec(select(User).where(User.user_id == user_id)).first()
            if not user:
                return jsonify({"error": "User not found"}), 404
                
            # Find the domain to delete
            domain_to_delete = session.exec(
                select(Domain).where(
                    (Domain.domain_name == domain_name) & 
                    (Domain.user_id == user_id)
                )
            ).first()
            
            if not domain_to_delete:
                return jsonify({"error": f"Domain '{domain_name}' not found for user {user_id}"}), 404
                
            # Delete the domain
            try:
                session.delete(domain_to_delete)
                session.commit()
                logger.debug(f"Successfully deleted domain: {domain_name} for user: {user_id}")
                return jsonify({
                    "message": "Domain deleted successfully", 
                    "domain_name": domain_name
                }), 200
            except Exception as e:
                logger.error(f"Error deleting domain: {e}")
                session.rollback()
                return jsonify({"error": f"Failed to delete domain: {str(e)}"}), 500
    
    # POST method - add a new domain
    if DEBUG:
        logger.debug(f"Received request to add domain for user: {user_id}")

    data = request.json
    domain_name = data.get("domain_name")

    if not domain_name:
        return jsonify({"error": "domain_name is required"}), 400

    with Session(engine) as session:
        user = session.exec(select(User).where(User.user_id == user_id)).first()

        if not user:
            return jsonify({"error": "User not found. Please create a user first."}), 404
        # Check if domain already exists for this user
        existing_domain = session.exec(
            select(Domain).where(
                (Domain.domain_name == domain_name) & 
                (Domain.user_id == user_id)
            )
        ).first()
        
        if existing_domain:
            return jsonify({"message": "Domain already exists", "domain_name": domain_name}), 200

        new_domain = Domain(domain_name=domain_name, user_id=user_id, total_scans=0)
        session.add(new_domain)
        session.commit()
        session.refresh(new_domain)

        return jsonify({"message": "Domain added successfully", "domain_name": domain_name}), 201

@app.route('/api/<user_id>/<domain_name>/permutations', methods=['POST', 'GET'])
def permutations_route(user_id, domain_name):
    if request.method == 'POST':
        if DEBUG:
            logger.debug(f"Received request to add permutations for user {user_id}, domain {domain_name}.")

        with Session(engine) as session:
            user = session.exec(select(User).where(User.user_id == user_id)).first()
            if not user:
                return jsonify({"error": "Invalid user_id. User does not exist."}), 400

            domain_obj = session.get(Domain, domain_name)
            if not domain_obj:
                domain_obj = Domain(domain_name=domain_name, user_id=user.user_id)
                session.add(domain_obj)
                session.commit()
                logger.debug(f"Added new domain: {domain_name}")

            # Run dnstwist scan
            try:
                result = subprocess.run(
                    ["python", "-m", "dnstwist", "--format", "json", domain_name],
                    capture_output=True, text=True, check=True
                )
                generated_permutations = json.loads(result.stdout)
            except Exception as e:
                logger.error(f" Error running dnstwist: {e}")
                return jsonify({"error": "Failed to generate permutations."}), 500

            # Save permutations to DB
            stored_permutations = []
            for entry in generated_permutations:
                perm = Permutation(
                    permutation_name=entry['domain'],
                    domain_name=domain_name,
                    server=entry.get('http'),
                    mail_server=entry.get('mx'),
                    risk=None,
                    ip_address=', '.join(entry.get('dns_a', [])) if isinstance(entry.get('dns_a'), list) else entry.get('dns_a')
                )
                session.add(perm)
                stored_permutations.append(entry['domain'])

            session.commit()

            #  **NEW:** Publish results to Pub/Sub for further processing
            try:
                message_payload = json.dumps({
                    "user_id": user_id,
                    "domain_name": domain_name,
                    "permutations": stored_permutations
                })
                future = publisher.publish(topic_path, message_payload.encode('utf-8'))
                msg_id = future.result()
                logger.info(f"Published scan results to Pub/Sub with message ID: {msg_id}")
            except Exception as e:
                logger.error(f"Failed to publish results to Pub/Sub: {e}")

        return jsonify({"message": "Permutations generated and added to database"}), 201

@app.route('/api/schedule', methods=['POST'])
def schedule_domain():
    """API endpoint to schedule a domain for a user."""
    data = request.json(silent=True)

    # Validate request data
    required_fields = ["user_id", "domain_name", "schedule_date"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    user_id = data["user_id"]
    domain_name = data["domain_name"]
    schedule_date = data["schedule_date"]

    with Session(engine) as session:
        #Check if user exists
        user = session.exec(select(User).where(User.user_id == user_id)).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        #Check if domain exists and belongs to the user
        domain = session.exec(
            select(Domain).where(
                (Domain.domain_name == domain_name) & (Domain.user_id == user_id)
            )
        ).first()
        if not domain:
            return jsonify({"error": "Domain not found or does not belong to this user"}), 404
    
        #Check if this domain is already scheduled
        existing_schedule = session.exec(
            select(Permutation).where(
                (Permutation.domain_name == domain_name) & (Permutation.user_id == user_id)
            )
        ).first()
        if existing_schedule:
            return jsonify({
                "message": "Domain is already scheduled",
                "schedule_id": existing_schedule.id,
                "schedule_date": existing_schedule.schedule_date
            }), 200

        #Insert new schedule entry
        new_schedule = Permutation(user_id=user_id, domain_name=domain_name, schedule_date=schedule_date)
        session.add(new_schedule)
        session.commit()
        session.refresh(new_schedule)

    return jsonify({
        "message": "Domain scheduled successfully",
        "schedule_id": new_schedule.id,
        "user_id": user_id,
        "domain_name": domain_name,
        "schedule_date": schedule_date
    }), 201


# ------------------------- Startup Sequence -------------------------

if __name__ == '__main__':
    time.sleep(1)
    # Drop all tables to recreate schema
    if DROP_TABLES:
        try:
            drop_all_tables()  # Drop all tables to recreate schema
        except Exception as e:
            logger.error(f"Error dropping tables: {e}")
    
    create_db_and_tables()
    ensure_topic()
    ensure_subscription()
    start_subscriber()
    app.run(host='0.0.0.0', port=8000, debug=True)
