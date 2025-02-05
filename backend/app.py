import os
from flask import Flask, jsonify, redirect, request
from flask_cors import CORS, cross_origin
from authlib.integrations.flask_client import OAuth
from pymongo import MongoClient
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
auth0_domain = os.environ.get("AUTH0_DOMAIN")
oauth = OAuth(app)
oauth.register(
    "auth0",
    client_id=os.environ.get("AUTH0_CLIENT_ID"),
    client_secret=os.environ.get("AUTH0_CLIENT_SECRET"),
    client_kwargs={"scope": "openid profile email"},
    server_metadata_url=(
        f"https://{auth0_domain}/.well-known/openid-configuration"
    ),
)

# Connect to MongoDB
mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client["User"]
users_collection = db["User"]

# ------------------- AUTH0 LOGIN -------------------


@app.route("/callback", methods=["GET"])  # Make sure this is a GET request
def callback():
    """Handles Auth0 login callback."""
    token = oauth.auth0.authorize_access_token()

    # Get user information
    user_info = oauth.auth0.parse_id_token(token)

    # Check if the user exists in the MongoDB
    existing_user = users_collection.find_one({"auth0_id": user_info["sub"]})

    if not existing_user:
        # If user doesn't exist, insert them into the database
        new_user = {
            "auth0_id": user_info["sub"],
            "email": user_info.get("email", ""),
            "name": user_info.get("name", ""),
            "picture": user_info.get("picture", ""),
        }
        users_collection.insert_one(new_user)
        print("New user inserted into MongoDB:", new_user)

    return redirect("http://localhost:3000")


# New API route to sync user data (POST)
@app.route("/api/sync-user", methods=["POST"])
@cross_origin(origins="http://localhost:3000", supports_credentials=True)
def sync_user():
    """Syncs user data from frontend to MongoDB."""
    data = request.json
    auth0_id = data.get("auth0_id")
    email = data.get("email")
    name = data.get("name")
    picture = data.get("picture")

    # Check if the user already exists
    existing_user = users_collection.find_one({"auth0_id": auth0_id})

    if not existing_user:
        # If the user doesn't exist, insert them into the database
        new_user = {
            "auth0_id": auth0_id,
            "email": email,
            "name": name,
            "picture": picture,
        }
        users_collection.insert_one(new_user)

    return jsonify({"message": "User synced successfully"}), 200


if __name__ == '__main__':
    app.run(port=46725, debug=True)
