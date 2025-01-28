from flask import Flask, request, jsonify
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from os import getenv
from dotenv import load_dotenv
from HTTP_funcs import _get, _put, _post, _delete, _set_payload


load_dotenv()
app = Flask(__name__)
USER = getenv('USER')
PASSWORD = getenv('PASSWORD')
uri = (
    f"mongodb+srv://{USER}:{PASSWORD}@capstone.fw3b6.mongodb.net/?"
    "retryWrites=true&w=majority&appName=Capstone"
)

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))


@app.route('/api/data/experience', methods=['POST', 'GET', 'DELETE', 'PUT'])
def request_handler():

    # Grabs collection DB
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


if __name__ == '__main__':
    app.run(debug=True, port=8001)
