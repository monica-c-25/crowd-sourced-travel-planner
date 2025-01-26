from flask import Flask, request, jsonify
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from os import getenv
from dotenv import load_dotenv


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
    db_experience = client["Experience"]
    collection_experience = db_experience["Experience"]

    if request.method == 'POST':
        # Add Data
        data = request.get_json()['Test']
        print(data)
        # collection_experience.insert_one(jsonify(dummy_data))
        response = {
            "Message": "Successfully Created"
        }
        return jsonify(response)

    if request.method == 'GET':
        # Get Data
        response_data = [data for data in collection_experience.find()]
        _strip_id(response_data)
        response = {
            'Message': "Successfully Retrieved",
            'data': response_data
        }
        return jsonify(response)

    if request.method == 'Delete':
        # Update Data
        collection_experience.delete_one({'Experience': 'Bahamas'})
        response = {
            "Successfully Updated"
        }
        return jsonify(response)

    if request.method == 'Update':
        collection_experience.update_one(
            {'Experience': 'Bahamas'},
            {"$set": {'Experience': 'Hawaii'}}
        )
        response = {
            "Successfully Updated"
        }
        return jsonify(response)


def _strip_id(input_data: object) -> None:
    for data in input_data:
        del data['_id']


if __name__ == '__main__':
    app.run(debug=True, port=8001)
