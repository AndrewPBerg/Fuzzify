"""
Author: Andrew Berg
Init: 2/15/2025
Desc: Demo Flask Backed to connect w/ React Frontend
"""

from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": False
    }
})

@app.route("/api/data", methods=["GET"])
def get_data():
    
    sample_data = [
        {"id": 1, "name": "Alice"},
        {"id": 2, "name": "Bob"},
        {"id": 3, "name": "Charlie"}
    ]
    return jsonify(sample_data)



def main():
    app.run(debug=True, port=5000)
    
if __name__ == "__main__":
    main()