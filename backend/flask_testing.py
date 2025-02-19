"""
Author: Andrew Berg
Init: 2/15/2025
Desc: Demo Flask Backed to connect w/ React Frontend
"""

from flask import Flask, jsonify
from flask_cors import CORS  # Add this import
print("Hello World!")
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route("/api/data", methods=["GET"])
def get_data():
    
    sample_data = [
        {"id": 1, "name": "Alice"},
        {"id": 2, "name": "Bob"},
        {"id": 3, "name": "Charlie"}
    ]
    return jsonify(sample_data)



def main():
    # Use host='0.0.0.0' to allow external connections
    app.run(host='0.0.0.0', port=8000, debug=True)
    
if __name__ == "__main__":
    main()