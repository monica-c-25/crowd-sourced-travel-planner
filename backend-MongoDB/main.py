from flask import Flask, request, jsonify
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from os import getenv
from dotenv import load_dotenv
from HTTP_funcs import _get, _put, _post, _delete, _set_payload
from flask_cors import CORS
from bson.objectid import ObjectId
from openai import OpenAI

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
openaiclient = OpenAI(
  api_key=getenv('OPENAI_API_KEY')
)


# API FOR EXPERIENCES PAGE
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
    
# GETS EXPERIENCE DETAILS
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


# AI (OPENAI API) RECOMMENDATIONS
@app.route("/get_recommendations", methods=["POST"])
def get_recommendations():
    data1 = request.json
    location1 = data1.get("location")
    trip_date1 = data1.get("trip_date")
    travel_group1 = data1.get("travel_group")
    interests1 = data1.get("interests", [])
    print(f"Location: {location1}, Date: {trip_date1}, Group: {travel_group1}, Interests: {interests1}")
    try:
        data = request.json
        location = data.get("location")
        trip_date = data.get("trip_date")
        travel_group = data.get("travel_group")
        interests = data.get("interests", [])

        # Ensure all required data is present
        if not location or not trip_date or not travel_group or not interests:
            return jsonify({"error": "Missing required fields"}), 400

        # Create prompt for ChatGPT
        prompt = f"""
        I am planning a trip to {location} on {trip_date} with my {travel_group}.
        My interests are {', '.join(interests)}. 
        Can you recommend some must-visit places and attractions?
        """

        # Call ChatGPT API
        response = openaiclient.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )

        # Extract and return response
        # recommendations = response["choices"][0]["message"]["content"]
        recommendations = response.choices[0].message.content
        return jsonify({"recommendations": recommendations})

    except Exception as e:
        print(f"Error: {str(e)}") 
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=8001)
