from flask import Flask, jsonify
import mysql.connector
from flask_cors import CORS
import os
from dotenv import load_dotenv  # ✅ Import dotenv to load .env variables

# ✅ Load environment variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# ✅ Secure MySQL connection settings using environment variables
db_config = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME")
}

@app.route('/')
def home():
    return jsonify({"message": "Flask Backend is Running Securely!"})

@app.route('/db-test')
def db_test():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SHOW TABLES;")
        tables = cursor.fetchall()
        conn.close()
        return jsonify({"tables": tables})
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route('/users')
def get_users():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM users;")
        users = cursor.fetchall()

        conn.close()

        return jsonify({"users": users})
    
    except Exception as e:
        return jsonify({"error": str(e)})

# ✅ This must be at the bottom of the file:
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

