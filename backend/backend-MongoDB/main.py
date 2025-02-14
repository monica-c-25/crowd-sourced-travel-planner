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
load_dotenv()
USER = getenv('USER')
PASSWORD = getenv('PASSWORD')
uri = (
    f"mongodb+srv://{USER}:{PASSWORD}@capstone.fw3b6.mongodb.net/?"
    "retryWrites=true&w=majority&appName=Capstone"
)
client = MongoClient(uri, server_api=ServerApi('1'))


def general_request(request: object, collection: object) -> None:

    if request.method == 'POST':
        # Add Data
        print(request.args)
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
            filters = request.json
            print(filters)
            response_data = _get(filters, collection)
            response = {
                "Message": "Success",
                "data": response_data
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
        ObjectId(experience_id)  # raise exception if not valid ObjectId
    except Exception as e:
        return jsonify({"Message": f"Invalid ID: {str(e)}"})

    try:
        # Pass experience_id as part of the request body to _get

        filters = {"Query": experience_id}
        experience_data = _get(filters, collection)

        if experience_data:
            # If data is returned, it will be a list with one experience
            experience = experience_data[0]  # Get the first experience
            experience["_id"] = str(experience["_id"])  # ObjectId to string
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


@app.route('/api/experience-data', methods=['POST', 'GET', 'DELETE', 'PUT'])
def experience_request_handler():

    db = client["Experience"]
    collection = db["Experience"]

    return general_request(request, collection)


@app.route('/api/user-data', methods=['GET', 'POST'])
def user_request_handler():

    # Grabs collection DB
    db = client["User"]
    collection = db["User"]

    return general_request(request, collection)


@app.route('/api/trip-data', methods=['GET', 'POST', 'PUT', 'DELETE'])
def trip_request_handler():

    db = client["Trip"]
    collection = db["Trip"]

    return general_request(request, collection)


@app.route('/api/comment-data', methods=['GET', 'POST', 'PUT', 'DELETE'])
def comment_request_handler():

    print(request)
    db = client["Comment"]
    collection = db["Comment"]

    return general_request(request, collection)


# # AI (OPENAI API) RECOMMENDATIONS
# @app.route("/get_recommendations", methods=["POST"])
# def get_recommendations():
#     try:
#         data = request.json
#         location = data.get("location")
#         trip_date = data.get("trip_date")
#         travel_group = data.get("travel_group")
#         interests = data.get("interests", [])

#         # Ensure all required data is present
#         if not location or not trip_date or not travel_group or not interests:
#             return jsonify({"error": "Missing required fields"}), 400

#         # Create prompt for ChatGPT
#         prompt = (
#             f"I am planning a trip to {location} on {trip_date} with my {travel_group}.\n"
#             f"My interests are {', '.join(interests)}.\n"
#             "Can you recommend 3 must-visit places for each category?\n"
#             "Return the results in json object following this structure:\n"
#             '{"Introduction": "Sample Introduction", "Category 1": ['
#             '{"name": "Example name 1", "description": "Example description 1", "address": "Example address 1"},'
#             '{"name": "Example name 2", "description": "Example description 2", "address": "Example address 2"},'
#             '{"name": "Example name 3", "description": "Example description 3", "address": "Example address 3"}], '
#             '"Category 2": etc. etc. }'
#         )

#         # Call ChatGPT API
#         response = openaiclient.chat.completions.create(
#             model="gpt-4o-mini",
#             messages=[{"role": "user", "content": prompt}]
#         )

#         # Extract and return response
#         recommendations = response.choices[0].message.content
#         return jsonify({"recommendations": recommendations})

#     except Exception as e:
#         print(f"Error: {str(e)}")
#         return jsonify({"error": str(e)}), 500


# ------------------- FILTER EXPERIENCES -------------------


@app.route("/api/filter-experiences", methods=["GET"])
def filter_experiences():
    """Filter experiences by creation date."""
    db = client["Experience"]
    experiences_collection = db["Experience"]

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
    app.run(debug=True, port=8001)
