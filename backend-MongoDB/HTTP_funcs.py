def _get(request_body: dict, collection: object) -> object:

    if request_body["Query"] == "All":
        return collection.find()

    return collection.find_one({collection.name: request_body["Query"]})


def _put(collection: object, payload: dict, prev_name: str) -> None:

    collection.update_one(
        {collection.name: prev_name},
        payload
    )


def _delete(collection: object, query: str) -> None:

    collection.delete_one({collection.name: query})


def _post(collection: object, request: object) -> str:

    return collection.insert_one(request)


def _strip_id(input_data: object) -> None:

    for data in input_data:
        del data['_id']


def _set_payload(input_data: object, payload: dict) -> None:

    payload["$set"] = {}

    for key, value in input_data.items():
        payload["$set"][key] = value
