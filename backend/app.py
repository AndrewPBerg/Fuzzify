from flask import Flask, jsonify
from sqlmodel import SQLModel, create_engine
from flask_cors import CORS
import os
from dotenv import load_dotenv  # Load environment variables
from google.cloud import pubsub_v1  #  Import Pub/Sub
# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database connection
DATABASE_URL = f"mysql+mysqlconnector://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"
engine = create_engine(DATABASE_URL)

# Create tables if they don't exist
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

@app.route('/')
def home():
    return jsonify({"message": "Flask Backend is Running Securely!"})

@app.route('/db-test')
def db_test():
    try:
        with engine.connect() as connection:
            result = connection.execute("SHOW TABLES;")
            tables = [row[0] for row in result]
        return jsonify({"tables": tables})
    except Exception as e:
        return jsonify({"error": str(e)})

# ✅ Setup Google Cloud Pub/Sub Client
PUBSUB_EMULATOR_HOST = os.getenv("PUBSUB_EMULATOR_HOST", "localhost:8085")
publisher = pubsub_v1.PublisherClient()
topic_path = f"projects/test-project/topics/test-topic"

@app.route('/test-pubsub')
def test_pubsub():
    try:
        future = publisher.publish(topic_path, b"Hello, Pub/Sub!")
        return jsonify({"message": "Published to Pub/Sub", "msg_id": future.result()})
    except Exception as e:
        return jsonify({"error": str(e)})

# Run the app
if __name__ == '__main__':
    create_db_and_tables()
    app.run(host='0.0.0.0', port=5000, debug=True)