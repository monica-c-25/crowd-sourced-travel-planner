from locationApi.locApi import geocode, reverse_geocode
from bson import ObjectId

def _get(request_body: dict, collection: object) -> object:
    
    if not request_body or request_body["Query"] == "All":
        result = list(collection.find())
    else:
        result = collection.find_one({"_id": ObjectId(request_body["Query"])})

    if result is not None and not isinstance(result, list):
        result = [result]

    for res in result:
        if res and "Location" in res:
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
                    # If address found, update Location field with address
                    if address:
                        res["Location"] = address["address"]
                    else:
                        res["Location"] = "Address not found"
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
    data = request["Location"]
    geoloc = geocode(data)
    if geoloc is None:
        raise ValueError("Invalid location entered")
    request["Location"] = geoloc
    result = collection.insert_one(request)
    return str(result.inserted_id)


def _strip_id(input_data: object) -> None:

    # If input_data is a list (multiple documents)
    if isinstance(input_data, list):
        for data in input_data:
            if '_id' in data:
                del data['_id']
    # If input_data is a single document (dictionary)
    elif isinstance(input_data, dict):
        if '_id' in input_data:
            del input_data['_id']


def _set_payload(input_data: object, payload: dict) -> None:

    payload["$set"] = {}

    for key, value in input_data.items():
        payload["$set"][key] = value
