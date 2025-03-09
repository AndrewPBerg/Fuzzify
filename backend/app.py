from flask import Flask, jsonify, request  # Add request to imports
from sqlmodel import SQLModel, create_engine, Session
from flask_cors import CORS
import os
from dotenv import load_dotenv
from google.cloud import pubsub_v1
import logging
import time
import dnstwist  # For running DNSTwist
from models import User, Domain, Permutation  # Import your models

# Enable Debugging for Logs
DEBUG = True
logging.basicConfig(level=logging.DEBUG if DEBUG else logging.INFO)
logger = logging.getLogger(__name__)

if DEBUG:
    logger.debug("Starting application in DEBUG mode")

#  Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

#  Correct Database Connection
DATABASE_URL = os.getenv("DB_URL", "mysql://user:password@db:3306/mydatabase")
if DEBUG:
    logger.debug(f"Connecting to database at: {DATABASE_URL}")

engine = create_engine(DATABASE_URL)

# Import models inside function (prevents crashes)
def create_db_and_tables():
    """Ensures that the database schema matches our models."""
    try:
        from models import User, Domain, Permutation  #  Import models *inside* the function
        if DEBUG:
            logger.debug("Initializing database schema...")
        with engine.begin() as conn:  # Ensures schema is committed properly
            SQLModel.metadata.create_all(conn)
        if DEBUG:
            logger.debug(" Database schema initialized successfully.")
    except Exception as e:
        logger.error(f" Error initializing database schema: {e}")
        raise  #  see errors in logs

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
                logger.debug(f" Found tables: {tables}")
        return jsonify({"tables": tables})
    except Exception as e:
        logger.error(f" Database error: {str(e)}")
        return jsonify({"error": str(e)})

# ✅ Setup Google Cloud Pub/Sub Client
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
            logger.debug(f" Successfully published message with ID: {msg_id}")
        return jsonify({"message": "Published to Pub/Sub", "msg_id": msg_id})
    except Exception as e:
        logger.error(f" Pub/Sub error: {str(e)}")
        return jsonify({"error": str(e)})

# Route to add a new domain
@app.route('/add-domain', methods=['POST'])
def add_domain():
    """Adds a new domain to the database and runs DNSTwist."""
    try:
        # Get JSON data from the request
        data = request.json
        domain_name = data.get("domain_name")
        user_id = data.get("user_id")

        # Validate input
        if not domain_name or not user_id:
            return jsonify({"error": "Both domain_name and user_id are required"}), 400

        # Check if the user exists
        with Session(engine) as session:
            user = session.get(User, user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404

            # Check if the domain already exists
            existing_domain = session.query(Domain).filter(Domain.domain_name == domain_name).first()
            if existing_domain:
                return jsonify({"error": "Domain already exists"}), 400

            # Create a new domain instance
            new_domain = Domain(domain_name=domain_name, user_id=user_id)

            # Add to the database
            session.add(new_domain)
            session.commit()

        if DEBUG:
            logger.debug(f"Added new domain: {domain_name}")

        # Run DNSTwist and insert permutations
        permutations = run_dnstwist(domain_name)
        if permutations:
            insert_permutations(domain_name, permutations)

        return jsonify({"message": "Domain added successfully", "domain": domain_name}), 201

    except Exception as e:
        logger.error(f"Error adding domain: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Helper functions for DNSTwist
def run_dnstwist(domain_name):
    """Runs DNSTwist on the domain and returns the results."""
    try:
        # Run DNSTwist
        results = dnstwist.run(domain_name)
        return results
    except Exception as e:
        logger.error(f"Error running DNSTwist: {str(e)}")
        return None

def insert_permutations(domain_name, permutations):
    """Inserts DNSTwist results into the Permutation table."""
    try:
        with Session(engine) as session:
            for permutation in permutations:
                # Create a new Permutation instance
                new_permutation = Permutation(
                    permutation_name=permutation["domain-name"],
                    domain_name=domain_name,
                    ip_address=permutation.get("ip-address"),
                    server=permutation.get("http-server"),
                    mail_server=permutation.get("mail-server"),
                    risk=permutation.get("risk", False)  # Default to False if not provided
                )
                # Add to the database
                session.add(new_permutation)
            session.commit()

        if DEBUG:
            logger.debug(f"Inserted {len(permutations)} permutations for domain: {domain_name}")

    except Exception as e:
        logger.error(f"Error inserting permutations: {str(e)}")
        raise

#  Startup Sequence
if __name__ == '__main__':
    time.sleep(5)  # Allow database & services to start
    create_db_and_tables()  # Initialize database
    app.run(host='0.0.0.0', port=8000, debug=True)  # Ensure it matches Docker Compose port mapping