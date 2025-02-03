from flask import Flask, request, jsonify
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from os import getenv
from dotenv import load_dotenv
from HTTP_funcs import _get, _put, _post, _delete, _set_payload
from flask_cors import CORS
from bson.objectid import ObjectId

load_dotenv()
app = Flask(__name__)
# Initialize CORS (Cross-Origin Resource Sharing) for React frontend
CORS(app, origins="http://localhost:3000", supports_credentials=True)
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
            # filters = request.args.to_dict()
            # response_data = _get(filters, collection)
            response_data = _get({}, collection)  # Fetch data
            # Convert ObjectId to string
            for experience in response_data:
                experience["_id"] = str(experience["_id"])  # Convert ObjectId to string

            # response = _get(request.get_json(), collection)
            response = {
                "Message": "Success",
                "data": response_data
            }
        except Exception as e:
            response = {
                'Message': f"Failed: {e} raised"
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
                'Message': f"Failed: '{exception}' raised"
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
    

@app.route('/api/experience-data/<experience_id>', methods=['GET'])
def get_experience_by_id(experience_id):
    db = client["Experience"]
    collection = db["Experience"]
    
    try:
        ObjectId(experience_id)  # This will raise an exception if it's not a valid ObjectId
    except Exception as e:
        return jsonify({"Message": f"Invalid ID: {str(e)}"})
    
    try:
        # Pass experience_id as part of the request body to _get
        
        filters = {"Query": experience_id}
        experience_data = _get(filters, collection)

        if experience_data:
            # If data is returned, it will be a list with one experience
            experience = experience_data[0]  # Get the first experience
            experience["_id"] = str(experience["_id"])  # Convert ObjectId to string
            response = {
                "Message": "Success",
                "data": experience
            }
        else:
            response = {
                "Message": "Experience not found"
            }

    except Exception as e:
        response = {
            "Message": f"Failed: {e} raised"
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


if __name__ == '__main__':
    app.run(debug=True, port=8001)
