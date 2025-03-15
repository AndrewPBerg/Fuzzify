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

# Enable Debugging for Logs
DEBUG = True
logging.basicConfig(level=logging.DEBUG if DEBUG else logging.INFO)
logger = logging.getLogger(__name__)

if DEBUG:
    logger.debug("Starting application in DEBUG mode")

# Load environment variables
load_dotenv()

# Initialize Flask App
app = Flask(__name__)
CORS(app)

# Database Connection
DATABASE_URL = os.getenv("DB_URL", "mysql://user:password@db:3306/mydatabase")
if DEBUG:
    logger.debug(f"Connecting to database at: {DATABASE_URL}")

engine = create_engine(DATABASE_URL)

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

# # ------------------------- Pub/Sub Configuration -------------------------

# os.environ["PUBSUB_EMULATOR_HOST"] = os.getenv("PUBSUB_EMULATOR_HOST", "localhost:8085")
# os.environ["GOOGLE_CLOUD_PROJECT"] = os.getenv("GOOGLE_CLOUD_PROJECT", "our-project")

# # Pub/Sub Clients
# publisher = pubsub_v1.PublisherClient()
# subscriber = pubsub_v1.SubscriberClient()

# # Topic and Subscription Names
# project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
# topic_name = "frontend-to-backend"
# subscription_name = "backend-sub"

# # Topic & Subscription Paths
# topic_path = publisher.topic_path(project_id, topic_name)
# subscription_path = subscriber.subscription_path(project_id, subscription_name)

# # Ensure Pub/Sub Topic Exists
# def ensure_topic():
#     try:
#         topics = [t.name for t in publisher.list_topics(request={"project": f"projects/{project_id}"})]
#         if topic_path not in topics:
#             publisher.create_topic(request={"name": topic_path})
#             logger.info(f"✅ Topic {topic_name} created.")
#         else:
#             logger.info(f"⚠️ Topic {topic_name} already exists.")
#     except Exception as e:
#         logger.error(f"❌ Error creating topic: {e}")

# # Ensure Pub/Sub Subscription Exists
# def ensure_subscription():
#     try:
#         subscriptions = [s.name for s in subscriber.list_subscriptions(request={"project": f"projects/{project_id}"})]
#         if subscription_path not in subscriptions:
#             subscriber.create_subscription(request={"name": subscription_path, "topic": topic_path})
#             logger.info(f"✅ Subscription {subscription_name} created.")
#         else:
#             logger.info(f"⚠️ Subscription {subscription_name} already exists.")
#     except Exception as e:
#         logger.error(f"❌ Error creating subscription: {e}")

# @app.route('/publish-message', methods=['POST'])
# def publish_message():
#     """Publishes a message from frontend to backend via Pub/Sub."""
#     data = request.json
#     if not data or "message" not in data:
#         return jsonify({"error": "Message field is required"}), 400

#     message_data = data["message"].encode("utf-8")

#     try:
#         future = publisher.publish(topic_path, message_data)
#         msg_id = future.result()
#         logger.info(f"Published message: {msg_id}")
#         return jsonify({"message": "Message published", "msg_id": msg_id})
#     except Exception as e:
#         logger.error(f"Error publishing message: {e}")
#         return jsonify({"error": str(e)}), 500

# def callback(message):
#     try:
#         message_data = message.data.decode("utf-8")
#         logger.info(f"📩 Received message: {message_data}")
#         message.ack()
#     except Exception as e:
#         logger.error(f"Error processing message: {e}")

# def start_subscriber():
#     def run():
#         while True:
#             try:
#                 streaming_pull_future = subscriber.subscribe(subscription_path, callback=callback)
#                 logger.info("🔄 Listening for messages on subscription...")
#                 streaming_pull_future.result()
#             except Exception as e:
#                 logger.error(f"Subscriber error: {e}")
#                 time.sleep(5)

#     thread = threading.Thread(target=run, daemon=True)
#     thread.start()

# ------------------------- API Endpoints -------------------------

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

# Create a new user
@app.route('/api/user', methods=['POST'])
def create_user():
    """API endpoint to create a new user and return the user_id."""
    if DEBUG:
        logger.debug("Received request to create a new user.")

    data = request.json
    user_name = data.get("user_name")

    if not user_name:
        return jsonify({"error": "Missing required field 'user_name'"}), 400

    with Session(engine) as session:
        existing_user = session.exec(select(User).where(User.user_name == user_name)).first()
        
        if existing_user:
            return jsonify({"message": "User already exists", "user_name": existing_user.user_name}), 200
        
        new_user = User(user_name=user_name)
        session.add(new_user)
        session.commit()
        session.refresh(new_user)

    return jsonify({"message": "User created successfully", "user_name": new_user.user_name}), 201

@app.route('/api/<user_name>/domain', methods=['POST'])
def add_domain(user_name):
    """API endpoint to insert a domain for a user."""
    if DEBUG:
        logger.debug(f"Received request to add domain for user: {user_name}")

    data = request.json
    domain_name = data.get("domain_name")

    if not domain_name:
        return jsonify({"error": "domain_name is required"}), 400

    with Session(engine) as session:
        user = session.exec(select(User).where(User.user_name == user_name)).first()

        if not user:
            return jsonify({"error": "User not found. Please create a user first."}), 404

        new_domain = Domain(domain_name=domain_name, user_name=user_name, total_scans=0)
        session.add(new_domain)
        session.commit()
        session.refresh(new_domain)

    return jsonify({"message": "Domain added successfully", "domain_name": domain_name}), 201

@app.route('/api/<user_name>/<domain_name>/permutations', methods=['POST', 'GET'])
def handle_permutations(user_name, domain_name):
    """Generates permutations using dnstwist and stores them in MySQL or fetches stored permutations for a given domain."""
    if request.method == 'POST':
        if DEBUG:
            logger.debug(f"Received request to add permutations for user {user_name}, domain {domain_name}.")

        with Session(engine) as session:
            user = session.exec(select(User).where(User.user_name == user_name)).first()
            if not user:
                return jsonify({"error": "Invalid user_name. User does not exist."}), 400

            # Assuming permutations are generated here (code omitted for brevity)
            generated_permutations = []  # Replace with actual permutation generation logic

            for perm_name in generated_permutations:
                # Extract optional features from the request
                optional_features = request.json.get("optional_features", {})
                new_permutation = Permutation(
                    permutation_name=perm_name,
                    domain_name=domain_name,
                    **optional_features  # (@AndrewPBerg: this is my favorit syntax ever)
                )
                session.add(new_permutation)

            session.commit()

        return jsonify({"message": "Permutations generated and added to database"}), 201

    elif request.method == 'GET':
        if DEBUG:
            logger.debug(f"Received request to fetch permutations for {domain_name}.")

        with Session(engine) as session:
            permutations = session.exec(select(Permutation).where(Permutation.domain_name == domain_name)).all()

        if not permutations:
            return jsonify({"message": "No permutations found for this domain."}), 404

        return jsonify([perm.model_dump() for perm in permutations])

# ------------------------- Startup Sequence -------------------------

if __name__ == '__main__':
    time.sleep(1)
    try:
        drop_all_tables()  # Drop all tables to recreate schema
    except Exception as e:
        logger.error(f"Error dropping tables: {e}")
    
    create_db_and_tables()
    # ensure_topic()
    # ensure_subscription()
    # start_subscriber()
    app.run(host='0.0.0.0', port=8000, debug=True)