from locationApi.locApi import geocode
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
            {"_id": ObjectId(_id[0])}
        )

        if collection_name in update_query:
            collection_update_query = {
                collection_name: update_query[collection_name]
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


def comment_decoder(collection: object, result: object) -> None:
    collection_to_insert = {collection.name: {}}
    for _id in result[collection.name]:

        # Get the user name from the comment
        query_collection = client[collection.name][collection.name]
        username = query_collection.find_one(
            {"_id": ObjectId(_id)})["username"]

        if not username:
            continue

        if username not in collection_to_insert[collection.name]:
            collection_to_insert[collection.name][username] = []

        retrieved_object = query_collection.find_one({"_id": ObjectId(_id)})
        if not retrieved_object:
            collection_to_insert[collection.name][username].append(
                retrieved_object)


def decoder(collection: str, result: object) -> None:

    if collection == "Comment":
        print(1)
        return comment_decoder(collection, result)

    collection_to_insert = {collection: []}

    for _id in result[collection]:

        query_collection = client[collection][collection]
        retrieved_object = query_collection.find_one({"_id": ObjectId(_id)})

        if retrieved_object:
            retrieved_object["_id"] = str(retrieved_object["_id"])
            collection_to_insert[collection].append(retrieved_object)

    result[collection] = collection_to_insert[collection]


def _decoder_setup(collections_to_loop: list, result: dict) -> None:

    for collection in collections_to_loop:
        print(result[collection])
        if collection in result and result[collection]:
            decoder(collection, result)


def _get(request_body: dict, collection: object) -> object:
    if not request_body:
        cursor = collection.find()
        result = [item for item in cursor]
    elif "_id" in request_body:
        result = collection.find_one({"_id": ObjectId(request_body["_id"])})
    else:
        result = collection.find_one(request_body)

    if not result:
        return

    _update_id(result)

    collections_to_loop = None

    if collection.name == "Trip":
        collections_to_loop = ["User", "Experience", "Photos"]
    elif collection.name == "Experience":
        collections_to_loop = ["User", "Photo", "Comment"]
    elif collection.name == "Photo":
        collections_to_loop = ["User"]
    elif collection.name == "Comment":
        collections_to_loop = ["User"]
    else:
        return result

    if not isinstance(result, list):
        _decoder_setup(collections_to_loop, result)
        return result

    for item in result:
        _decoder_setup(collections_to_loop, item)

    return result


def _put(collection: object, payload: dict, prev_name: str) -> None:

    collection.update_one(
        {collection.name: prev_name},
        payload
    )


def _delete(collection: object, query: str) -> None:

    collection.delete_one({collection.name: query})


def _post(collection: object, request: object) -> str:

    if collection.name == "Experience":
        data = request["location"]
        geoloc = geocode(data)

        if geoloc is None:
            raise ValueError("Invalid location entered")

        request["coords"] = geoloc

        experience_id = str(collection.insert_one(request).inserted_id)

        collections = {}
        for value in ["Trip", "User"]:
            if value in request:
                collections[value] = request[value]

        collection_name = collection.name

        _linked_update(collections, collection_name, experience_id)
        return experience_id

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

        collections = {}
        for value in ["User", "Experience"]:
            if value in request:
                collections[value] = request[value]

        _linked_update(collections, collection.name, comment_id)
        return comment_id

    elif collection.name == "Trip":
        trip_id = str(collection.insert_one(request).inserted_id)

        collections = {}
        for value in ["User", "Experience"]:
            if value in request:
                collections[value] = request[value]

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
