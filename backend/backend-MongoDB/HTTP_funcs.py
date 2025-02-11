from locationApi.locApi import geocode, reverse_geocode
from pymongo.mongo_client import MongoClient
from bson.objectid import ObjectId
from pymongo.server_api import ServerApi
from os import getenv
from dotenv import load_dotenv

load_dotenv()
USER = getenv('USER')
PASSWORD = getenv('PASSWORD')
uri = (
    f"mongodb+srv://{USER}:{PASSWORD}@capstone.fw3b6.mongodb.net/?"
    "retryWrites=true&w=majority&appName=Capstone"
)
client = MongoClient(uri, server_api=ServerApi('1'))


def _linked_update(collections: dict, collection_name: str,
                   cross_id: str) -> None:

    for name, _id in collections.items():

        collection = client[name][name]
        update_query = collection.find_one(
            {"_id": ObjectId(_id)}
        )

        if collection_name in update_query:
            collection_update_query = {
                collection_name: update_query[collection]
            }
        else:
            collection_update_query = {
                collection_name: []
            }

        collection_update_query[collection_name].append(cross_id)
        collection.update_one(
            {"_id": update_query["_id"]},
            {"$set": collection_update_query}
        )


def _get(request_body: dict, collection: object) -> object:
    if not request_body:
        result = list(collection.find())
    else:
        result = collection.find_one({collection.name: request_body["Query"]})

    _update_id(result)

    for res in result:

        if res and collection.name == "Location":

            location = res["Location"]
            lat = location.get("lat")
            lon = location.get("lon")

            # Ensure lat/lon are valid and convert them
            if lat and lon:
                try:
                    lat = float(lat)
                    lon = float(lon)
                    # Call reverse geocode API to convert lat/lon to an address
                    address = reverse_geocode(lat, lon)
                    # If address is found, update the Location field with
                    # address
                    # TODO eliminate backwards communication, aka translation
                    # from lat and long to loco back to lat and long
                    res["Location"] = (
                        address["address"] if address else "Address not found"
                    )
                except ValueError:
                    res["Location"] = "Invalid lat/lon"

    return result


def _put(collection: object, payload: dict, prev_name: str) -> None:

    collection.update_one(
        {collection.name: prev_name},
        payload
    )


def _delete(collection: object, query: str) -> None:

    collection.delete_one({collection.name: query})


def _post(collection: object, request: object) -> str:

    if collection.name == "Location":
        data = request["Location"]
        geoloc = geocode(data)

        if geoloc is None:
            raise ValueError("Invalid location entered")
        # TODO add long and lat here instead of back translating
        request["Location"] = geoloc
        result = collection.insert_one(request)
        return str(result.inserted_id)

    elif collection.name == "User":

        username_in_db = (
            False
            if collection.find_one(
                {"username": request["username"]}
                ) is None
            else True)

        return (
            str(collection.insert_one(request).inserted_id)
            if (not username_in_db)
            else "Username Not Available"
        )

    elif collection.name == "Comment":
        comment_id = str(collection.insert_one(request).inserted_id)

        collections = {
            "User": request["user_id"],
            "Experience": request["experience_id"]
        }
        collection_name = collection.name

        _linked_update(collections, collection_name, comment_id)
        return comment_id

    elif collection.name == "Experience":
        experience_id = str(collection.insert_one(request).inserted_id)

        collections = {
            "Trip": request["trip_id"],
            "User": request["user_id"],
            "Location": request["location_id"]
        }

        collection_name = collection.name

        _linked_update(collections, collection_name, experience_id)
        return experience_id

    elif collection.name == "Trip":
        trip_id = str(collection.insert_one(request).inserted_id)

        collections = {
            "User": request["user_id"],
            "Experience": request["experience_id"],
            "Location": request["location_id"]
        }
        _linked_update(collections, collection_name, trip_id)
        return trip_id

    else:
        return str(collection.insert_one(request).inserted_id)


def _update_id(input_data: object) -> None:

    # If input_data is a list (multiple documents)
    if isinstance(input_data, list):
        for data in input_data:
            data['_id'] = str(data['_id'])
    # If input_data is a single document (dictionary)
    elif isinstance(input_data, dict):
        input_data['_id'] = str(input_data['_id'])


def _set_payload(input_data: object, payload: dict) -> None:

    payload["$set"] = {}

    for key, value in input_data.items():
        payload["$set"][key] = value


if __name__ == "__main__":
    load_dotenv()
    USER = getenv('USER')
    PASSWORD = getenv('PASSWORD')
    uri = (
        f"mongodb+srv://{USER}:{PASSWORD}@capstone.fw3b6.mongodb.net/?"
        "retryWrites=true&w=majority&appName=Capstone"
    )
    client = MongoClient(uri, server_api=ServerApi('1'))
