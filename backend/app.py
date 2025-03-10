from flask import Flask, jsonify, request
from sqlmodel import SQLModel, create_engine, Session, select
from flask_cors import CORS
import os
from dotenv import load_dotenv
from google.cloud import pubsub_v1
import logging
import time
from models import User, Domain, Permutation

# Enable Debugging for Logs
DEBUG = True
logging.basicConfig(level=logging.DEBUG if DEBUG else logging.INFO)
logger = logging.getLogger(__name__)

if DEBUG:
    logger.debug("Starting application in DEBUG mode")

# Load environment variables
load_dotenv()

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
        return jsonify({"error": str(e)})

@app.route('/api/permutations', methods=['POST'])
def add_permutations():
    """API endpoint to insert permutations, ensuring domain exists and duplicates are prevented."""
    if DEBUG:
        logger.debug("Received request to add permutations.")

    data = request.json  # Get JSON from the request
    if DEBUG:
        logger.debug(f"Data received: {data}")

    # Check required fields
    if not data or 'domain_name' not in data or 'permutations' not in data:
        logger.error("Missing 'domain_name' or 'permutations' in request.")
        return jsonify({"error": "domain_name and permutations fields are required"}), 400

    domain_name = data['domain_name']
    permutations_data = data['permutations']

    with Session(engine) as session:
        #  Check if domain exists
        domain = session.exec(select(Domain).where(Domain.domain_name == domain_name)).first()

        #  If domain doesn't exist create it
        if not domain:
            new_domain = Domain(domain_name=domain_name, user_id="auto_user", total_scans=0)
            session.add(new_domain)
            session.commit()
            session.refresh(new_domain)  # Ensure it's saved

        #  Insert permutations if they don't already exist
        for perm in permutations_data:
            existing_perm = session.exec(select(Permutation).where(Permutation.permutation_name == perm["permutation_name"])).first()
            if existing_perm:
                logger.warning(f"Skipping duplicate permutation: {perm['permutation_name']}")
                continue  # Skip adding duplicate

            new_perm = Permutation(
                permutation_name=perm["permutation_name"],
                domain_name=domain_name,
                server=perm.get("server"),
                mail_server=perm.get("mail_server"),
                risk=perm.get("risk"),
                ip_address=perm.get("ip_address")
            )
            session.add(new_perm)

        session.commit()

    if DEBUG:
        logger.debug("Successfully inserted new permutations into database.")

    return jsonify({"message": "Permutations successfully added (duplicates skipped)"}), 201

# Startup Sequence
if __name__ == '__main__':
    time.sleep(5)  # Allow database & services to start
    create_db_and_tables()  # Initialize database
    app.run(host='0.0.0.0', port=8000, debug=True)  # Ensure it matches Docker Compose port mapping
