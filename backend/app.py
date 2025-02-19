from flask import Flask, jsonify
from sqlmodel import SQLModel, create_engine
from flask_cors import CORS
import os
from dotenv import load_dotenv  # ✅ Load environment variables
from google.cloud import pubsub_v1  # ✅ Import Pub/Sub
import logging
import time
from tenacity import retry, stop_after_attempt, wait_exponential

DEBUG = True

# Configure logging
logging.basicConfig(level=logging.DEBUG if DEBUG else logging.INFO)
logger = logging.getLogger(__name__)

if DEBUG:
    logger.debug("Starting application in DEBUG mode")

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database connection
DATABASE_URL = f"mysql+mysqlconnector://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:5010/{os.getenv('DB_NAME')}"
if DEBUG:
    logger.debug(f"Connecting to database at: {os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}")
engine = create_engine(DATABASE_URL)

# Create tables if they don't exist
def create_db_and_tables():
    if DEBUG:
        logger.debug("Creating database tables...")
    SQLModel.metadata.create_all(engine)
    if DEBUG:
        logger.debug("Database tables created successfully")

@app.route('/')
def home():
    return jsonify({"message": "Flask Backend is Running Securely!"})

@app.route('/db-test')
def db_test():
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
        if DEBUG:
            logger.error(f"Database error: {str(e)}")
        return jsonify({"error": str(e)})

# Modified database connection with retry
@retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=4, max=10))
def init_db_connection():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            logger.debug("Database connection successful")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise

# Modified PubSub initialization with retry
@retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=4, max=10))
def init_pubsub_client():
    try:
        publisher = pubsub_v1.PublisherClient()
        subscriber = pubsub_v1.SubscriberClient()
        # Test connection
        project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "test-project")
        topic_path = publisher.topic_path(project_id, "test-topic")
        try:
            publisher.create_topic(request={"name": topic_path})
        except Exception as e:
            if "ALREADY_EXISTS" not in str(e):
                raise
        logger.debug("PubSub connection successful")
        return publisher, subscriber
    except Exception as e:
        logger.error(f"PubSub initialization failed: {e}")
        raise

@app.route('/test-pubsub')
def test_pubsub():
    if DEBUG:
        logger.debug(f"Attempting to publish message to topic: {topic_path}")
    try:
        future = publisher.publish(topic_path, b"Hello, Pub/Sub!")
        msg_id = future.result()
        if DEBUG:
            logger.debug(f"Successfully published message with ID: {msg_id}")
        return jsonify({"message": "Published to Pub/Sub", "msg_id": msg_id})
    except Exception as e:
        if DEBUG:
            logger.error(f"Pub/Sub error: {str(e)}")
        return jsonify({"error": str(e)})

# Modified startup sequence
if __name__ == '__main__':
    # Wait for services to be ready
    time.sleep(5)
    
    try:
        init_db_connection()
        publisher, subscriber = init_pubsub_client()
        create_db_and_tables()
        app.run(host='0.0.0.0', port=8000, debug=True)
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        exit(1)