from flask import Flask, jsonify, request
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
from pymongo import MongoClient
import os
from dotenv import load_dotenv, find_dotenv

# Load environment variables
ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "your-default-secret-key")
app.config.from_object("config.Config")

# Initialize CORS for React frontend
CORS(app, origins="http://localhost:3000", supports_credentials=True)

# Initialize OAuth for Auth0
oauth = OAuth(app)
oauth.register(
    "auth0",
    client_id=os.environ.get("AUTH0_CLIENT_ID"),
    client_secret=os.environ.get("AUTH0_CLIENT_SECRET"),
    client_kwargs={"scope": "openid profile email"},
    server_metadata_url=(
        f"https://{os.environ.get('AUTH0_DOMAIN')}/.well-known/openid-configuration"
    ),
)

# Connect to MongoDB
MONGO_URI = "mongodb://localhost:27017"
client = MongoClient(MONGO_URI)
db = client["User"]
user_collection = db["User"]


# Route to store user info in MongoDB upon login
@app.route("/api/store-user", methods=["POST"])
def store_user():
    user_data = request.get_json()

    if not user_data or "email" not in user_data:
        return jsonify({"message": "Invalid data"}), 400

    existing_user = user_collection.find_one({"email": user_data["email"]})

    if not existing_user:
        # Insert new user
        user_collection.insert_one(user_data)
        return jsonify({"message": "User stored successfully"}), 201

    return jsonify({"message": "User already exists"}), 200


# Protected API route
@app.route("/api/protected", methods=["GET"])
def protected():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"message": "Authorization token is missing"}), 401

    user_info = validate_jwt(token)
    if not user_info:
        return jsonify({"message": "Invalid token"}), 401

    return jsonify({"message": "Access granted", "user": user_info})


def validate_jwt(token):
    return True  # Replace with actual JWT validation logic


if __name__ == '__main__':
    app.run(port=46725, debug=True)
