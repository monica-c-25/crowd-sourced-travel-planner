import os
from flask import Flask, jsonify, redirect, request, render_template, send_file
from flask_cors import CORS, cross_origin
from authlib.integrations.flask_client import OAuth
from pymongo import MongoClient
from dotenv import load_dotenv, find_dotenv
from google.cloud import storage, datastore
import io
import datetime

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
photo_db = client["Photo"]
photo_collection = db["Photo"]

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


# ------------------- Image Storage -------------------
datastore_client = datastore.Client()
PHOTO_BUCKET = 'cs467-crowd-sourced-travel-planner-images'


def _get_next_photo_id():
    # Find the highest current photo ID in the collection
    last_photo = photo_collection.find().sort("_id", -1).limit(1)
    if last_photo.count() > 0:
        # Increment the highest ID found
        return last_photo[0]["_id"] + 1
    else:
        # If no photos exist, start with 1
        return 1


@app.route('/images', methods=['GET', 'POST'])
def upload_image():
    if request.method == 'GET':
        # Render the file upload form when visiting /images
        return render_template('file_upload.html')

    if request.method == 'POST':
        # Any files in the request will be available in request.files object
        # Check if there is an entry in request.files with the key 'file'
        if 'file' not in request.files:
            return ('No file sent in request', 400)
        # Set file_obj to the file sent in the request
        file_obj = request.files['file']
        # Create a storage client
        storage_client = storage.Client()
        # Get a handle on the bucket
        bucket = storage_client.get_bucket(PHOTO_BUCKET)
        # Create a blob object for the bucket with the name of the file
        blob = bucket.blob(file_obj.filename)
        # Position the file_obj to its beginning
        file_obj.seek(0)
        try:
            photo_id = _get_next_photo_id()
            # Upload the file into Cloud Storage
            blob.upload_from_file(file_obj)
            image_url = blob.public_url

            # Insert photo metadata into Photo collection
            photo_payload = {
                "_id": photo_id,
                "file_name": file_obj.filename,
                "url": image_url,
                "uploaded_at": datetime.datetime.utcnow()
            }
            photo_collection.insert_one(photo_payload)

            return jsonify({'photo_id': photo_id, 'image_url': blob.public_url, 'file_name': file_obj.filename, 'uploaded_at': datetime.datetime.utcnow()}), 201

        except Exception as e:
            # Handle exceptions during file upload
            return jsonify({'error': str(e)}), 500


@app.route('/images/<file_name>', methods=['GET'])
def get_image(file_name):
    storage_client = storage.Client()
    bucket = storage_client.get_bucket(PHOTO_BUCKET)
    # Create a blob with the given file name
    blob = bucket.blob(file_name)
    # Handle empty or missing files
    if not blob.exists():
        return jsonify({'error': "File not found"}), 404
    # Create a file object in memory using Python io package
    file_obj = io.BytesIO()
    # Download the file from Cloud Storage to the file_obj variable
    blob.download_to_file(file_obj)
    # Position the file_obj to its beginning
    file_obj.seek(0)
    # Send the object as a file in the response with the correct MIME type and file name
    image_url = blob.public_url
    return jsonify({'image_url': image_url})
    # return send_file(file_obj, mimetype=None, download_name=file_name)
    # return image_url  #Returns the url of the image instead of download


@app.route('/images/<file_name>', methods=['DELETE'])
def delete_image(file_name):
    storage_client = storage.Client()
    bucket = storage_client.get_bucket(PHOTO_BUCKET)
    blob = bucket.blob(file_name)
    # Check if file exists in Cloud Storage
    if not blob.exists():
        return jsonify({'error': "File not found"}), 404
    # Delete the file from Cloud Storage
    blob.delete()
    # Delete corresponding photo metadata from MongoDB
    result = photo_collection.delete_one({"file_name": file_name})
    # Check if photo exists in MongoDB to begin with.
    if result.deleted_count == 0:
        return jsonify({'error': "Photo did not exist in MongoDB"}), 404
    return jsonify({"message": "Image successfully deleted."}), 204

@app.route('/images/experience/<experience_id>', methods=['GET'])
def get_images_by_experience_id(experience_id):
    photos = photo_collection.find({"experience_id": experience_id})
    # Check if any photos exist under experience_id
    if photos.count() == 0:
        return jsonify({'error': "No images found for this experience ID"}), 404
    
    #Compiles a list of photo urls that fall under experience_id
    image_urls = [photo['url'] for photo in photos]
    return jsonify({'experience_id': experience_id, 'image_urls': image_urls}), 200


@app.route('/images/experience/download/<experience_id>', methods=['GET'])
def download_images_by_experience(experience_id):
    photos = photo_collection.find({"experience_id": experience_id})
    if photos.count() == 0:
        return jsonify({'error': "No images found for this experience ID"}), 404
    
    images = []
    storage_client = storage.Client()
    bucket = storage_client.get_bucket(PHOTO_BUCKET)

    # Iterate over each image to download it from Google Cloud Storage
    for photo in photos:
        # Get the file name and create a blob
        file_name = photo['file_name']
        blob = bucket.blob(file_name)
        
        # Ensure the file exists in Cloud Storage
        if blob.exists():
            file_obj = io.BytesIO()  # Create an in-memory file object
            blob.download_to_file(file_obj)  # Download the image into the in-memory object
            file_obj.seek(0)  # Reset the file object position to the beginning
            
            # Append the image to the list
            images.append({'file_name': file_name, 'file_obj': file_obj})
        else:
            return jsonify({'error': f"File {file_name} not found in storage"}), 404
        # Returns first image only
        return send_file(images[0]['file_obj'], mimetype='image/jpeg', download_name=images[0]['file_name'])

if __name__ == '__main__':
    app.run(port=46725, debug=True)
