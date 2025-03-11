import subprocess
import json
from flask import Flask, jsonify, request
from sqlmodel import SQLModel, create_engine, Session, select
from flask_cors import CORS
import os
from dotenv import load_dotenv
from google.cloud import pubsub_v1
import logging
import time
from models import User, Domain, Permutation
import threading

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

# Import models inside function (prevents crashes)
def create_db_and_tables():
    """Ensures that the database schema matches our models."""
    try:
        from models import User, Domain, Permutation  # Import models inside function
        if DEBUG:
            logger.debug("Initializing database schema...")
        with engine.begin() as conn:  # Ensures schema is committed properly
            SQLModel.metadata.create_all(conn)
        if DEBUG:
            logger.debug("Database schema initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing database schema: {e}")
        raise

@app.route('/')
def home():
    return jsonify({"message": "Flask Backend is Running Securely!"})

@app.route('/db-test')
def db_test():
    """Checks if database tables exist."""
    if DEBUG:
        logger.debug("Testing database connection...")
    try:
        with engine.connect() as connection:
            result = connection.execute("SHOW TABLES;")
            tables = [row[0] for row in result]
            if DEBUG:
                logger.debug(f"Found tables: {tables}")
        return jsonify({"tables": tables})
    except Exception as e:
        logger.error(f"Database error: {str(e)}")
        return jsonify({"error": str(e)})
    
#  Setup Google Cloud Pub/Sub Client

# Load Environment Variables
os.environ["PUBSUB_EMULATOR_HOST"] = os.getenv("PUBSUB_EMULATOR_HOST", "localhost:8085")
os.environ["GOOGLE_CLOUD_PROJECT"] = os.getenv("GOOGLE_CLOUD_PROJECT", "our-project")

# Pub/Sub Clients
publisher = pubsub_v1.PublisherClient()
subscriber = pubsub_v1.SubscriberClient()

# Topic and Subscription Names
project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
topic_name = "frontend-to-backend"
subscription_name = "backend-sub"

# Topic & Subscription Paths
topic_path = publisher.topic_path(project_id, topic_name)
subscription_path = subscriber.subscription_path(project_id, subscription_name)

# Ensure Topic Exists
def ensure_topic():
    """Ensure Pub/Sub topic exists."""
    try:
        topics = [t.name for t in publisher.list_topics(request={"project": f"projects/{project_id}"})]
        if topic_path not in topics:
            publisher.create_topic(request={"name": topic_path})
            logger.info(f"✅ Topic {topic_name} created.")
        else:
            logger.info(f"⚠️ Topic {topic_name} already exists.")
    except Exception as e:
        logger.error(f"❌ Error creating topic: {e}")

# Ensure Subscription Exists
def ensure_subscription():
    """Ensure Pub/Sub subscription exists."""
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
    """Process received messages from Pub/Sub."""
    try:
        message_data = message.data.decode("utf-8")
        logger.info(f"📩 Received message: {message_data}")
        message.ack()
    except Exception as e:
        logger.error(f" Error processing message: {e}")

def start_subscriber():
    """Start Pub/Sub subscriber in a background thread."""
    def run():
        while True:
            try:
                streaming_pull_future = subscriber.subscribe(subscription_path, callback=callback)
                logger.info("🔄 Listening for messages on subscription...")
                streaming_pull_future.result()
            except Exception as e:
                logger.error(f"Subscriber error: {e}")
                time.sleep(5)  # Retry after a short delay

    thread = threading.Thread(target=run, daemon=True)
    thread.start()

'''#  Setup Google Cloud Pub/Sub Client

#  Google Cloud Pub/Sub Integration
PUBSUB_EMULATOR_HOST = os.getenv("PUBSUB_EMULATOR_HOST", "localhost:8085")
publisher = pubsub_v1.PublisherClient()
topic_path = f"projects/test-project/topics/test-topic"

@app.route('/test-pubsub')
def test_pubsub():
    """Publishes test message to Pub/Sub."""
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "test-project")
    topic_path = publisher.topic_path(project_id, "test-topic")
    if DEBUG:
        logger.debug(f"Attempting to publish message to topic: {topic_path}")
    try:
        future = publisher.publish(topic_path, b"Hello, Pub/Sub!")
        msg_id = future.result()
        if DEBUG:
            logger.debug(f"Successfully published message with ID: {msg_id}")
        return jsonify({"message": "Published to Pub/Sub", "msg_id": msg_id})
    except Exception as e:
        logger.error(f"Pub/Sub error: {str(e)}")
        return jsonify({"error": str(e)})'''

#  API for Handling Permutations Using dnstwist
@app.route('/api/<user_id>/<domain_name>/permutations', methods=['POST'])
def add_permutations(user_id, domain_name):
    """Generates permutations using dnstwist and stores them in MySQL."""
    if DEBUG:
        logger.debug(f"Received request to add permutations for user {user_id}, domain {domain_name}.")

    # Validate user exists
    with Session(engine) as session:
        user = session.exec(select(User).where(User.user_id == user_id)).first()
        if not user:
            return jsonify({"error": "Invalid user_id. User does not exist."}), 400

    # Run dnstwist to generate permutations
    try:
        dnstwist_cmd = ["dnstwist", "--json", domain_name]
        result = subprocess.run(dnstwist_cmd, capture_output=True, text=True)

        if result.returncode != 0:
            logger.error(f"dnstwist execution failed: {result.stderr}")
            return jsonify({"error": "dnstwist execution failed"}), 500

        # Parse dnstwist output
        permutations_data = json.loads(result.stdout)
        if DEBUG:
            logger.debug(f"dnstwist results: {permutations_data}")

    except Exception as e:
        logger.error(f"Error running dnstwist: {e}")
        return jsonify({"error": "Failed to execute dnstwist"}), 500

    # Insert domain and permutations into MySQL
    with Session(engine) as session:
        # Check if domain exists
        domain = session.exec(select(Domain).where(Domain.domain_name == domain_name)).first()

        if not domain:
            new_domain = Domain(domain_name=domain_name, user_id=user_id, total_scans=0)
            session.add(new_domain)
            session.commit()
            session.refresh(new_domain)

        # Insert permutations if they don't already exist
        for perm in permutations_data:
            existing_perm = session.exec(
                select(Permutation).where(Permutation.permutation_name == perm["domain"])
            ).first()
            
            if existing_perm:
                logger.warning(f"Skipping duplicate permutation: {perm['domain']}")
                continue  # Skip duplicates
            
            new_perm = Permutation(
                permutation_name=perm["domain"],
                domain_name=domain_name,
                server=perm.get("dns_a", [""])[0] if "dns_a" in perm else None,
                mail_server=perm.get("dns_mx", [""])[0] if "dns_mx" in perm else None,
                risk=perm.get("fuzzer") == "homoglyph",
                ip_address=perm.get("dns_a", [""])[0] if "dns_a" in perm else None
            )
            session.add(new_perm)

        session.commit()

    if DEBUG:
        logger.debug("Successfully inserted permutations into database.")

    return jsonify({"message": "Permutations generated and added to database"}), 201

# GET Endpoint to Fetch Permutations
@app.route('/api/<user_id>/<domain_name>/permutations', methods=['GET'])
def get_permutations(user_id, domain_name):
    """API endpoint to fetch stored permutations for a given domain."""
    if DEBUG:
        logger.debug(f"Received request to fetch permutations for {domain_name}.")

    with Session(engine) as session:
        permutations = session.exec(select(Permutation).where(Permutation.domain_name == domain_name)).all()

    if not permutations:
        return jsonify({"message": "No permutations found for this domain."}), 404

    return jsonify([perm.dict() for perm in permutations])

#  API for Adding Domains
@app.route('/api/<user_id>/domain', methods=['POST'])
def add_domain(user_id):
    """API endpoint to add a new domain."""
    data = request.json
    domain_name = data.get("domain_name")

    if not domain_name:
        return jsonify({"error": "Domain name is required"}), 400

    with Session(engine) as session:
        existing_domain = session.exec(select(Domain).where(Domain.domain_name == domain_name)).first()
        
        if existing_domain:
            return jsonify({"message": "Domain already exists."}), 409  # Conflict

        new_domain = Domain(domain_name=domain_name, user_id=user_id, total_scans=0)
        session.add(new_domain)
        session.commit()

    return jsonify({"message": f"Domain {domain_name} added successfully."}), 201

# Startup Sequence
if __name__ == '__main__':
    time.sleep(5)  # Allow database & services to start
    create_db_and_tables()  # Initialize database
    ensure_topic()  # Ensure Pub/Sub topic exists
    ensure_subscription()  # Ensure Pub/Sub subscription exists
    start_subscriber()  # Start message subscriber
    app.run(host='0.0.0.0', port=8000, debug=True)  # Ensure it matches Docker Compose port mapping
