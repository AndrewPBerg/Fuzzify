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

# ------------------------- User API -------------------------

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

# ------------------------- Domain API -------------------------

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

# ------------------------- Permutations API -------------------------

@app.route('/api/<user_id>/<domain_name>/permutations', methods=['POST'])
def add_permutations(user_id, domain_name):
    """Generates permutations using dnstwist and stores them in MySQL."""
    if DEBUG:
        logger.debug(f"Received request to add permutations for user {user_id}, domain {domain_name}.")

    with Session(engine) as session:
        user = session.exec(select(User).where(User.user_id == user_id)).first()
        if not user:
            return jsonify({"error": "Invalid user_id. User does not exist."}), 400

    try:
        dnstwist_cmd = ["dnstwist", "--json", domain_name]
        result = subprocess.run(dnstwist_cmd, capture_output=True, text=True)

        if result.returncode != 0:
            logger.error(f"dnstwist execution failed: {result.stderr}")
            return jsonify({"error": "dnstwist execution failed"}), 500

        permutations_data = json.loads(result.stdout)
        if DEBUG:
            logger.debug(f"dnstwist results: {permutations_data}")

    except Exception as e:
        logger.error(f"Error running dnstwist: {e}")
        return jsonify({"error": "Failed to execute dnstwist"}), 500

    with Session(engine) as session:
        domain = session.exec(select(Domain).where(Domain.domain_name == domain_name)).first()

        if not domain:
            new_domain = Domain(domain_name=domain_name, user_id=user_id, total_scans=0)
            session.add(new_domain)
            session.commit()
            session.refresh(new_domain)

        for perm in permutations_data:
            existing_perm = session.exec(
                select(Permutation).where(Permutation.permutation_name == perm["domain"])
            ).first()
            
            if existing_perm:
                logger.warning(f"Skipping duplicate permutation: {perm['domain']}")
                continue 
            
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
    time.sleep(5)  # Allow database & services to start
    create_db_and_tables()  # Initialize database
    app.run(host='0.0.0.0', port=8000, debug=True)  # Ensure it matches Docker Compose port mapping
