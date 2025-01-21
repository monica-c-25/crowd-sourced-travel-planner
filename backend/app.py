from flask import Flask, g
from flask_cors import CORS
from routes.experience import exp_bp
import mysql.connector
from config import Config
import os

app = Flask(__name__)
app.config.from_object(Config)
# Handling corss-origin request between React frontend and Flask backend.
# (Allow React app on localhost:3000)
CORS(app, origins=["http://localhost:3000"])

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
def close_db():
    db = g.pop('db', None)
    if db is not None:
        db.close()


app.register_blueprint(exp_bp, url_prefix='/experience')


@app.route('/')
def index():
    return "This is the flask backend!"


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 46725))
    app.run(port=port, debug=True)
