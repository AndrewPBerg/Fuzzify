from flask import Flask, jsonify
from sqlmodel import SQLModel, create_engine
from flask_cors import CORS
import os
from dotenv import load_dotenv  # ✅ Load environment variables
from google.cloud import pubsub_v1  # ✅ Import Pub/Sub

DEBUG = True

if DEBUG:
    print("Starting application in DEBUG mode")

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database connection
DATABASE_URL = f"mysql+mysqlconnector://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"
if DEBUG:
    print(f"Connecting to database at: {os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}")
engine = create_engine(DATABASE_URL)

# Create tables if they don't exist
def create_db_and_tables():
    if DEBUG:
        print("Creating database tables...")
    SQLModel.metadata.create_all(engine)
    if DEBUG:
        print("Database tables created successfully")

@app.route('/')
def home():
    return jsonify({"message": "Flask Backend is Running Securely!"})

@app.route('/db-test')
def db_test():
    if DEBUG:
        print("Testing database connection...")
    try:
        with engine.connect() as connection:
            result = connection.execute("SHOW TABLES;")
            tables = [row[0] for row in result]
            if DEBUG:
                print(f"Found tables: {tables}")
        return jsonify({"tables": tables})
    except Exception as e:
        if DEBUG:
            print(f"Database error: {str(e)}")
        return jsonify({"error": str(e)})

# ✅ Setup Google Cloud Pub/Sub Client
if DEBUG:
    print(f"Initializing Pub/Sub client with emulator at: {os.getenv('PUBSUB_EMULATOR_HOST')}")
publisher_options = {
    "client_options": {
        "api_endpoint": os.getenv("PUBSUB_EMULATOR_HOST")
    }
}
publisher = pubsub_v1.PublisherClient(**publisher_options)

# Create the topic if it doesn't exist
project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "test-project")
topic_path = publisher.topic_path(project_id, "test-topic")
try:
    publisher.create_topic(request={"name": topic_path})
except Exception as e:
    print(f"Topic already exists: {e}")

@app.route('/test-pubsub')
def test_pubsub():
    if DEBUG:
        print(f"Attempting to publish message to topic: {topic_path}")
    try:
        future = publisher.publish(topic_path, b"Hello, Pub/Sub!")
        msg_id = future.result()
        if DEBUG:
            print(f"Successfully published message with ID: {msg_id}")
        return jsonify({"message": "Published to Pub/Sub", "msg_id": msg_id})
    except Exception as e:
        if DEBUG:
            print(f"Pub/Sub error: {str(e)}")
        return jsonify({"error": str(e)})

# Run the app
if __name__ == '__main__':
    create_db_and_tables()
    app.run(host='0.0.0.0', port=5000, debug=True)