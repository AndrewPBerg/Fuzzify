from flask import Flask, jsonify
from sqlmodel import SQLModel, Session, create_engine, select
from flask_cors import CORS
import os
from models import User, Domain, ScanResult

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

@app.route('/users')
def get_users():
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        return jsonify({"users": [user.dict() for user in users]})

@app.route('/domains')
def get_domains():
    with Session(engine) as session:
        domains = session.exec(select(Domain)).all()
        return jsonify({"domains": [domain.dict() for domain in domains]})

# Run the app
if __name__ == '__main__':
    create_db_and_tables()
    app.run(host='0.0.0.0', port=5000, debug=True)
