import os
from flask import Flask, jsonify, redirect, request, session
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

users_db = client["User"]
experiences_db = client["Experience"]

users_collection = users_db["User"]
experiences_collection = experiences_db["Experience"]

# ------------------- AUTH0 LOGIN -------------------


@app.route("/callback", methods=["GET"])  # Make sure this is a GET request
def callback():
    """Handles Auth0 login callback."""
    token = oauth.auth0.authorize_access_token()

    # Get user information
    user_info = oauth.auth0.parse_id_token(token)

    session["user_info"] = user_info

    return redirect("http://localhost:3000")


# New API route to sync user data (POST)
@app.route("/api/sync-user", methods=["POST"])
@cross_origin(origins="http://localhost:3000", supports_credentials=True)
def sync_user():
    # Get the user data from the request
    data = request.json
    auth0_id = data.get("auth0_id")
    email = data.get("email")
    name = data.get("name")
    picture = data.get("picture")

    # Check if the user already exists in the database
    existing_user = users_collection.find_one({"auth0_id": auth0_id})

    if existing_user:
        # If user exists, check if any fields need to be updated
        updates = {}

        # Update name if it has changed
        if existing_user.get("name") != name:
            updates["name"] = name

        # Update email if it has changed (this may rarely change)
        if existing_user.get("email") != email:
            updates["email"] = email

        # Update picture if it has changed
        if existing_user.get("picture") != picture:
            updates["picture"] = picture

        # If there are any updates, apply them
        if updates:
            users_collection.update_one(
                {"auth0_id": auth0_id},
                {"$set": updates}
            )
            return jsonify({"message": "User data updated successfully"}), 200
        else:
            return jsonify({"message": "No changes to update"}), 200

    else:
        # If the user does not exist, create a new user
        new_user = {
            "auth0_id": auth0_id,
            "email": email,
            "name": name,
            "picture": picture
        }
        users_collection.insert_one(new_user)
        return jsonify({"message": "New user created successfully"}), 201


# ------------------- FILTER EXPERIENCES -------------------

@app.route("/api/filter-experiences", methods=["GET"])
def filter_experiences():
    """Filter experiences by creation date."""

    try:
        # Get date parameters from query string (e.g., from frontend)
        start_date_str = request.args.get("start_date", None)
        end_date_str = request.args.get("end_date", None)

        # Prepare date filters
        date_filter = {}

        # Check if the start_date and end_date are provided
        if start_date_str:
            date_filter["creationDate"] = {"$gte": start_date_str}
        if end_date_str:
            date_filter["creationDate"] = date_filter.get("creationDate", {})
            date_filter["creationDate"]["$lte"] = end_date_str

        # Query the database based on whether the filter exists
        if date_filter:
            experiences = experiences_collection.find(date_filter)
        else:
            experiences = experiences_collection.find()

        # Sort by creationDate in descending order (newest first)
        experiences = experiences.sort("creationDate", -1)

        # Serialize the results
        experiences_list = []
        for experience in experiences:
            experience["_id"] = str(experience["_id"])
            experiences_list.append(experience)

        return jsonify(experiences_list)

    except Exception as e:
        # Print the exception to the server log for debugging
        print(f"Error occurred: {e}")
        return jsonify({"error": "An error occurred."}), 500


if __name__ == '__main__':
    app.run(port=46725, debug=True)
