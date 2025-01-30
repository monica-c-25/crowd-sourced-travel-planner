from flask import (
    Flask, g, session, jsonify, redirect, url_for, render_template
)
from flask_cors import CORS
from routes import register_blueprints
from authlib.integrations.flask_client import OAuth
import mysql.connector
from config import Config
import os
from dotenv import load_dotenv, find_dotenv

# Load environment variables
ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

# Initialize Flask app
app = Flask(__name__)
# Set the secret key for session management
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "your-default-secret-key")
app.config.from_object(Config)

# Initialize CORS (Cross-Origin Resource Sharing) for React frontend
CORS(app, origins=["http://localhost:3000"])

# Initialize OAuth for Auth0
oauth = OAuth(app)
oauth.register(
    "auth0",
    client_id=os.environ.get("AUTH0_CLIENT_ID"),
    client_secret=os.environ.get("AUTH0_CLIENT_SECRET"),
    client_kwargs={
        "scope": "openid profile email",
    },
    server_metadata_url=(
        f"https://{os.environ.get('AUTH0_DOMAIN')}/.well-known/"
        "openid-configuration"
    ),
)


# Function to create and return the database connection
def get_db():
    """Returns a database connection if one doesn't exist."""
    if 'db' not in g:
        g.db = mysql.connector.connect(
            host=Config.DB_HOST,
            database=Config.DB_NAME,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD
        )
    return g.db


# Teardown function to close the connection after each request
@app.teardown_appcontext
def close_db(exc=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()


register_blueprints(app)


# Routes
@app.route('/')
def index():
    return "This is the flask backend!"


@app.route("/user", methods=["GET"])
def user():
    """Returns the current logged-in user."""
    if "user" in session:
        return jsonify({"user": session["user"]})
    return jsonify({"user": None})


@app.route("/login")
def login():
    """Redirects the user to Auth0's login page."""
    return oauth.auth0.authorize_redirect(
        redirect_uri=url_for("callback", _external=True)
    )


@app.route("/callback")
def callback():
    """Handles Auth0's callback after login."""
    token = oauth.auth0.authorize_access_token()
    nonce = session.get('nonce')
    user = oauth.auth0.parse_id_token(token, nonce=nonce)
    session["user"] = user
    return redirect(url_for("home"))


@app.route("/logout")
def logout():
    """Logs out the user and clears session."""
    session.clear()  # Clear the session
    return redirect(
        f"https://{os.environ.get('AUTH0_DOMAIN')}/v2/logout?client_id="
        "{os.environ.get('AUTH0_CLIENT_ID')}&returnTo="
        "{url_for('home', _external=True)}"
    )


@app.route("/home")
def home():
    """Renders the home page with the logged-in user."""
    # Access user information directly
    user_info = session.get("user")

    # Redirect to login if no user info in session
    if not user_info:
        return redirect(url_for("login"))

    return render_template("home.html", user=user_info)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 46725))
    app.run(port=port, debug=True)
