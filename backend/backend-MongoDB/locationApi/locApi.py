import requests
from os import getenv
from dotenv import load_dotenv
import pprint

load_dotenv()

BASE_URL = getenv("GEOLOC_API_URL")
API_KEY = getenv("GEOLOC_API_KEY")


def geocode(address):
    """Converts an address into latitude and longitude."""
    params = {"q": address, "api_key": API_KEY}
    response = requests.get(f"{BASE_URL}/search", params=params)

    if response.status_code == 200:
        data = response.json()
        if data:
            return {"lat": data[0]["lat"], "lon": data[0]["lon"]}
        else:
            return None  # No results found
    return None


def reverse_geocode(lat, lon):
    """Converts latitude and longitude into an address."""
    params = {"lat": lat, "lon": lon, "api_key": API_KEY}
    response = requests.get(f"{BASE_URL}/reverse", params=params)

    if response.status_code == 200:
        data = response.json()
        address_data = data.get("address", {})

        # Extract components safely
        house_number = address_data.get("house_number", "")
        road = address_data.get("road", "")
        city = address_data.get("city", address_data.get(
            "town", address_data.get("village", "")))
        state = address_data.get("state", "")
        zip_code = address_data.get("postcode", "")

        # Format the address
        formatted_address = f"""{house_number} {road}, {city}, {
            state}, {zip_code}""".strip().replace(" ,", ",")

        return {"address": formatted_address} if formatted_address else None
    return None


# Example Usage
if __name__ == "__main__":
    # pprint.pprint(geocode("1600 Amphitheatre Parkway, Mountain View, CA"))
    # pprint.pprint(geocode("Columbia Place Mall, Columbia, SC, 29229"))
    pprint.pprint(geocode("Fake Address"))
    # pprint.pprint(reverse_geocode(37.422, -122.084))
    # pprint.pprint(reverse_geocode(40.7503935, -73.9891511))
    # pprint.pprint(reverse_geocode(34.06597555, -80.96172902910322))
