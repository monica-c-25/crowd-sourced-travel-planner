import mysql.connector
from flask import request, jsonify, Blueprint, g

exp_bp = Blueprint('experiences', __name__)


@exp_bp.route('/api/experience', methods=['POST'])
def add_experience():
    # Get data from form submission
    data = request.get_json()

    # Extract values from the JSON data
    title = data['title']
    event_date = data['eventDate']
    description = data['Description']
    location = data['Location']
    users_id = data['Users_idUsers']
    trips_id = data.get('Trips_idTrips', None)

    # Split location into latitude and longitude
    lat, lon = map(float, location.split(','))

    # Establish connection to Cloud SQL (replace with Cloud SQL details)
    db = g.db
    cursor = db.cursor()

    # SQL query to insert experience
    sql_query = """
    INSERT INTO Experiences (title, eventDate, Description,
    Location, Users_idUsers, Trips_idTrips)
    VALUES (%s, %s, %s, ST_GeomFromText(%s), %s, %s)
    """

    # Create the POINT value for location
    location_point = f"POINT({lat} {lon})"

    try:
        # Execute the query
        cursor.execute(sql_query, (title, event_date, description,
                       location_point, users_id, trips_id))

        # Commit the transaction
        db.commit()
        return jsonify({"message": "Experience added successfully!"}), 201

    except mysql.connector.Error:
        # Rollback in case of an error
        db.rollback()
        return jsonify({"error": "Failed to add experience"}), 500

    finally:
        # Close cursor after the operation
        cursor.close()
