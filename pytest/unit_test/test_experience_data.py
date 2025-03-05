# pytest/unit/testfile.py

import sys
import os
import pytest

# Add the /backend directory to sys.path so we can import from it
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend')))

import json
from app import app
from unittest.mock import patch

# Test Client Setup
@pytest.fixture
def client():
    with app.test_client() as client:
        yield client


# ------------------- TESTS -------------------
# _get.py
def _get(filters, collection):
    return collection.find(filters)

# Unit test for _get function
from unittest.mock import MagicMock

def test_get_function():
    # Mock the collection (like a mock database)
    mock_collection = MagicMock()
    
    # Define the mock behavior
    mock_collection.find.return_value = [{"_id": "123", "name": "Test Experience"}]
    
    # Call the _get function with mock data
    filters = {"_id": "123"}
    result = _get(filters, mock_collection)
    
    # Verify that _get returns the expected result
    assert result == [{"_id": "123", "name": "Test Experience"}]
    
    # Verify that the find method was called with the correct filters
    mock_collection.find.assert_called_with(filters)

# sync_user.py
def sync_user_logic(user_data, users_collection):
    auth0_id = user_data.get("auth0_id")
    email = user_data.get("email")
    name = user_data.get("name")
    picture = user_data.get("picture")

    existing_user = users_collection.find_one({"auth0_id": auth0_id})

    if existing_user:
        updates = {}

        if existing_user.get("name") != name:
            updates["name"] = name

        if existing_user.get("email") != email:
            updates["email"] = email

        if existing_user.get("picture") != picture:
            updates["picture"] = picture

        if updates:
            users_collection.update_one({"auth0_id": auth0_id}, {"$set": updates})
            return {"message": "User data updated successfully"}
        else:
            return {"message": "No changes to update", "userID": str(existing_user["_id"])}
    else:
        new_user = {
            "auth0_id": auth0_id,
            "email": email,
            "name": name,
            "picture": picture
        }
        new_user_result = users_collection.insert_one(new_user)
        return {"message": "New user created successfully", "userID": str(new_user_result.inserted_id)}

# Unit test for sync_user_logic

def test_sync_user_create():
    # Mock the database collection
    mock_users_collection = MagicMock()
    mock_users_collection.find_one.return_value = None  # Simulating no existing user
    
    user_data = {
        "auth0_id": "auth0|12345",
        "email": "new_user@example.com",
        "name": "New User",
        "picture": "http://example.com/picture.jpg"
    }
    
    result = sync_user_logic(user_data, mock_users_collection)
    
    # Verify that a new user was created
    assert result["message"] == "New user created successfully"
    mock_users_collection.insert_one.assert_called_once_with({
        "auth0_id": "auth0|12345",
        "email": "new_user@example.com",
        "name": "New User",
        "picture": "http://example.com/picture.jpg"
    })