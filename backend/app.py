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
        from models import User, Domain, Permutation
        if DEBUG:
            logger.debug("Initializing database schema...")
        with engine.begin() as conn:
            SQLModel.metadata.create_all(conn)
        if DEBUG:
            logger.debug("Database schema initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing database schema: {e}")
        raise

# ------------------------- Pub/Sub Configuration -------------------------

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

@app.route('/api/user', methods=['POST'])
def create_user():
    """API endpoint to create a new user and return the user_id."""
    if DEBUG:
        logger.debug("Received request to create a new user.")

    data = request.json
    domain_name = data.get("domain_name")

    if not domain_name:
        return jsonify({"error": "Missing required field 'domain_name'"}), 400

    with Session(engine) as session:
        existing_user = session.exec(select(User).where(User.domain_name == domain_name)).first()
        
        if existing_user:
            return jsonify({"message": "User already exists", "user_id": existing_user.user_id}), 200
        
        new_user = User(user_id=str(uuid4()), domain_name=domain_name)
        session.add(new_user)
        session.commit()
        session.refresh(new_user)

    return jsonify({"message": "User created successfully", "user_id": new_user.user_id}), 201

@app.route('/api/<user_id>/domain', methods=['POST'])
def add_domain(user_id):
    """API endpoint to insert a domain for a user."""
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

        new_domain = Domain(domain_name=domain_name, user_id=user_id, total_scans=0)
        session.add(new_domain)
        session.commit()
        session.refresh(new_domain)

    return jsonify({"message": "Domain added successfully", "domain_name": domain_name}), 201

@app.route('/api/<user_id>/<domain_name>/permutations', methods=['POST'])
def add_permutations(user_id, domain_name):
    """Generates permutations using dnstwist and stores them in MySQL."""
    if DEBUG:
        logger.debug(f"Received request to add permutations for user {user_id}, domain {domain_name}.")

    with Session(engine) as session:
        user = session.exec(select(User).where(User.user_id == user_id)).first()
        if not user:
            return jsonify({"error": "Invalid user_id. User does not exist."}), 400

    # Insert permutations (code omitted for brevity)

    return jsonify({"message": "Permutations generated and added to database"}), 201

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

# ------------------------- Startup Sequence -------------------------

if __name__ == '__main__':
    time.sleep(5)
    create_db_and_tables()
    ensure_topic()
    ensure_subscription()
    start_subscriber()
    app.run(host='0.0.0.0', port=8000, debug=True)