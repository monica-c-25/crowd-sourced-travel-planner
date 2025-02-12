from flask import Flask, request, jsonify
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from os import getenv
from dotenv import load_dotenv
from HTTP_funcs import _get, _put, _post, _delete, _set_payload
from flask_cors import CORS
from google.cloud import storage, datastore
from bson import ObjectId

load_dotenv()
app = Flask(__name__)
CORS(app)
USER = getenv('USER')
PASSWORD = getenv('PASSWORD')
uri = (
    f"mongodb+srv://{USER}:{PASSWORD}@capstone.fw3b6.mongodb.net/?"
    "retryWrites=true&w=majority&appName=Capstone"
)
client = MongoClient(uri, server_api=ServerApi('1'))


@app.route('/api/experience-data', methods=['POST', 'GET', 'DELETE', 'PUT'])
def experience_request_handler():

    db = client["Experience"]
    collection = db["Experience"]

    if request.method == 'POST':
        # Add Data
        try:
            print(request.get_json())
            response = {
                "Message": "Success",
                "ID": _post(collection, request.get_json())
            }
        except Exception as exception:
            response = {
                'Message': f"Failed: {exception} raised"
            }
        return jsonify(response)

    if request.method == 'GET':
        # Get Data
        try:
            response = _get(request.get_json(), collection)
            response = {
                "Message": "Success",
                "data": response
            }
        except Exception as exception:
            response = {
                'Message': f"Failed: {exception} raised"
            }
        return jsonify(response)

    if request.method == 'DELETE':
        # Update Data
        try:
            query_name = request.get_json()['Query']
            _delete(collection, query_name)
            response = {
                "Message": "Success"
            }
        except Exception as exception:
            response = {
                'Message': f"Failed: {exception} raised"
            }
        return jsonify(response)

    if request.method == 'PUT':
        data = request.get_json()
        update_payload = dict()

        if "Previous_Title" in data:
            query_name = data["Previous_Title"]
            del data["Previous_Title"]
        else:
            query_name = data["Experience"]

        _set_payload(data, update_payload)

        try:
            _put(collection, "Experience", update_payload,
                 query_name)
            response = {
                "Message": "Success"
            }

        except Exception as exception:
            response = {
                "Message": f"Failed: {exception} occured"
            }

        return jsonify(response)


@app.route('/api/user-data', methods=['GET'])
def user_request_handler():

    # Grabs collection DB
    db = client["User"]
    collection = db["User"]

    if request.method == 'GET':
        # Get Data
        try:
            data = _get(request.get_json(), collection)
            response = {
                "Message": "Success",
                "data": data
            }
        except Exception as exception:
            response = {
                'Message': f"Failed: {exception} raised"
            }
        return jsonify(response)

    if request.method == 'POST':
        try:
            response = {
                "Message": "Success",
                "ID": _post(collection, request.get_json())
            }
        except Exception as exception:
            response = {
                'Message': f"Failed: {exception} raised"
            }
        return jsonify(response)


# ------------------- Photo Storage -------------------
datastore_client = datastore.Client()
PHOTO_BUCKET = 'cs467-crowd-sourced-travel-planner-images'

# def _get_next_photo_id():
#     db = client["Photo"]
#     collection = db["Photo"]
#     # Find the highest current photo ID in the collection
#     last_photo = collection.find().sort("_id", -1).limit(1)
#     if last_photo.count() > 0:
#         # Increment the highest ID found
#         return last_photo[0]["_id"] + 1
#     else:
#         # If no photos exist, start with 1
#         return 1


@app.route('/api/photos', methods=['POST', 'GET', 'DELETE', 'PUT'])
def photo_request_handler():
    db = client["Experience"]
    collection = db["Experience"]

    if request.method == 'POST':
        # Add Photo
        try:
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
            file_name = f"{str(ObjectId())}_{file_obj.filename}"
            # Create a blob object for the bucket with the name of the file
            blob = bucket.blob(file_name)
            # Position the file_obj to its beginning
            file_obj.seek(0)

            # # Generate new photo_id
            # photo_id = _get_next_photo_id()

            # Upload the file into Cloud Storage
            blob.upload_from_file(file_obj)
            photo_url = blob.public_url

            photo_data = {
                "file_name": file_name,
                "photo_url": photo_url
            }

            # Save photo_url into Experience Collection
            experience_id = request.form.get('experience_id')
            # experience_id = request.args.get("experience_id")
            # experience = collection.find_one({"_id" : experience_id})
            experience = collection.find_one({"_id": ObjectId(experience_id)})
            if experience:
                collection.update_one(
                    {"_id": experience_id},
                    {"$push": {"photo_data": photo_data}}
                )
                response = {
                    "Message": "Success",
                    "ID": _post(collection, request.get_json())
                }
                return jsonify(response)
            else:
                return jsonify({'Error': "Experience Not Found"}), 404

        except Exception as e:
            return jsonify({"Error": str(e)}), 500

    if request.method == 'GET':
        # Sample GET Request: GET /api/photos?experience_id=some_experience_id
        # Get Data
        try:
            experience_id = request.args.get("experience_id")
            # experience_id = request.form.get('experience_id')
            if not experience_id:
                return jsonify({"Error": "Experience ID Required"}), 400

            # experience = collection.find_one({"_id" : experience_id})
            experience = collection.find_one({"_id": ObjectId(experience_id)})
            if experience:
                photo_data = experience.get("photo_data", [])
                photo_urls = [photo["photo_url"] for photo in photo_data]

                if not photo_urls:
                    response = {
                        "message": "No photos found for this experience",
                        "experience_id": ObjectId(experience_id)
                    }
                    return jsonify(response)
                response = {
                    "message": "Success",
                    "experience_id": experience_id,
                    "photo_urls": photo_urls
                }
                return jsonify(response), 200
            else:
                return jsonify({'Error': "Experience Not Found"}), 404

        except Exception as e:
            return jsonify({"Error": str(e)}), 500

    if request.method == 'DELETE':
        # Sample DELETE Request: DELETE /api/photos?experience_id=some_experience_id&photo_url=https://storage.googleapis.com/cs467-crowd-sourced-travel-planner-images/photo1.jpg
        # Update Data
        try:
            experience_id = request.args.get("experience_id")
            # experience_id = request.form.get('experience_id')
            photo_url_to_delete = request.args.get('photo_url')
            if not experience_id or not photo_url_to_delete:
                return jsonify({"Error": "Experience_id and Photo_url are required."}), 400

            file_name = photo_url_to_delete.split('/')[-1]

            storage_client = storage.Client()
            bucket = storage_client.get_bucket(PHOTO_BUCKET)

            blob = bucket.blob(file_name)
            # Check if file exists in Cloud Storage
            if not blob.exists():
                return jsonify({'error': "File not found"}), 404
            # Delete the file from Cloud Storage
            blob.delete()
            # Delete corresponding photo metadata from MongoDB
            result = collection.delete_one({"file_name": file_name})

            # experience = collection.find_one({"_id" : experience_id})
            experience = collection.find_one({"_id": ObjectId(experience_id)})
            if experience:
                result = collection.update_one(
                    {"_id": experience_id},
                    {"$pull": {"photo_data": {"photo_url": photo_url_to_delete}}}
                )

                if result.modified_count > 0:
                    response = {
                        "message": "Success: Photo URL Removed",
                        "experience_id": experience_id,
                        "removed_photo_url": photo_url_to_delete
                    }
                    return jsonify(response), 200
                else:
                    return jsonify({'Error': "Experience Not Found"}), 404

        except Exception as e:
            return jsonify({"Error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=8001)
