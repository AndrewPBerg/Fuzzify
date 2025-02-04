from flask import Flask, jsonify
import mysql.connector
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# MySQL connection settings
db_config = {
    "host": os.getenv("DB_HOST", "mysql"),
    "user": os.getenv("DB_USER", "user"),
    "password": os.getenv("DB_PASSWORD", "password"),
    "database": os.getenv("DB_NAME", "soteria_db")
}

@app.route('/')
def home():
    return jsonify({"message": "Flask Backend is Running!"})

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)


