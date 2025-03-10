import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import "./TripDetail.css";

const TripDetail = () => {
  const { id } = useParams(); // Get experience ID from URL
  const [trip, setTrip] = useState(null);
  const [experiences, setExperiences] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, userID } = useAuth();

  useEffect(() => {
    const fetchTrip = async () => {
      if (isAuthenticated && userID) {
        try {
          const REACT_APP_AUTH_URL = process.env.REACT_APP_AUTH_URL
          const response = await fetch(
            `${REACT_APP_AUTH_URL}/api/trip-data/${id}`
          );
          const data = await response.json();
          if (data.Message === "Success") {
            setTrip(data.data[0]);
            setExperiences(data.data[1]);
          } else {
            console.error("Trip not found.");
          }
        } catch (error) {
          console.error("Error fetching Trip:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchTrip();
  }, [id, isAuthenticated, userID]);

  if (loading) return <p>Loading...</p>;
  if (!trip) return <p>Trip not found.</p>;

  return (
    <>
        <div className="trip-detail">
        <h1>{trip.title}</h1>
        <p><strong>Trip Created on:</strong> {trip.creationDate}</p>
        {trip.completed ? (
            <p>
            <FaCheck style={{ color: 'green' }} /> Trip has been completed!
            <br />
            <strong>Trip Dates:</strong>{" "}
            {trip.eventDate
                ? `${trip.eventDate.start} to ${trip.eventDate.end}`
                : "Not set"}
            </p>
        ) : (
            <p>
            <strong>Trip Date:</strong> Trip not completed yet.
            </p>
        )}
        </div>

        {/* Experiences List (updated to a list) */}
        {loading ? (
        <p className="loading-message">Loading...</p>
        ) : (
        <div className="experience-list">
            {Array.isArray(experiences) && experiences.length > 0 ? (
            experiences.reverse().map((experience, index) => (
                <Link
                key={index}
                to={`/experience-detail/${experience._id}`} // Navigate to details page
                className="experience-item" // Updated class to match list style
                >
                    <div className="list-left">
                        <h3>{experience.title}</h3>
                        <img
                            src={experience.Photos || "/images/travel-background.jpg"}
                            alt="No Img Available"
                        />
                    </div>
                    <div className="list-right">
                        <p className="date">{experience.eventDate}</p>
                        <p><strong>Location: </strong> {experience.location}</p>
                        <p><strong>Description: </strong>{experience.description.slice(0, 42)}{experience.description.length > 42 && "..."}</p>
                        <p><strong>Created By: </strong>{experience.User[0]}</p>
                    </div>
                </Link>
            ))
            ) : (
            <p>No experiences available.</p>
            )}
        </div>
        )}
    </>
  );
};

export default TripDetail;
