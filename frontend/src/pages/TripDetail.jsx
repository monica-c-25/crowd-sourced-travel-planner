import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { FaCheck, FaRegEdit } from "react-icons/fa";
import "./TripDetail.css";

const TripDetail = () => {
  const { id } = useParams(); // Get experience ID from URL
  const [trip, setTrip] = useState(null);
  const [experiences, setExperiences] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user, userID } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    title: "",
  });
  const [updatedData, setUpdatedData] = useState({
    "mongo_id": id
  });

  useEffect(() => {
    const fetchTrip = async () => {
      if (isAuthenticated && userID) {
        try {
          const response = await fetch(
            `http://localhost:46725/api/trip-data/${id}`
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value, // Update the corresponding field in the form data
    }));
  };

  const handleCompleteButtonClick = () => {
    const updatedCompletedStatus = !trip.completed; // Toggle the completed status
    setTrip((prevTrip) => ({
      ...prevTrip,
      completed: updatedCompletedStatus,
    }));
    
    setUpdatedData((prevUpdatedData) => ({
      ...prevUpdatedData,
      completed: updatedCompletedStatus, // Update completed field for the API request
    }));
  };  

  const handleEditButtonClick = () => {
    setFormData({
      title: trip.title
    })
    setEditOpen(true);
  };

  const handleEditCancel = () => {
    setEditOpen(false);
  };

  const handleEditSubmit = async () => {
    let updated = { ...updatedData };
    if (formData.title !== trip.title) {
      updatedData.title = formData.title;
    }
    setUpdatedData(updated);

    if (Object.keys(updatedData).length === 1) {
      alert("No changes detected.");
      setEditOpen(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:46725/api/trip-data`, {
        method: "PUT",
        body: JSON.stringify(updatedData), 
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.Message === "Success") {
        setTrip((prevTrip) => ({
          ...prevTrip,
          ...updatedData,
        }));
        setEditOpen(false); 
      } else {
        console.error("Error updating trip.");
      }
    } catch (error) {
      console.error("Error updating trip:", error);
    }
  };

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

        {user && user.name === trip.User[0] && (
          <button className="edit-btn" onClick={handleEditButtonClick}><FaRegEdit />Edit</button>
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

        {editOpen && (
          <div className="edit-overlay">
            <div className="edit-form">
              <h3>Edit Trip</h3>
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Add a title"
                required
              />
              <button className="complete-btn" onClick={handleCompleteButtonClick}>
                {trip.completed ? (
                  <>
                    <FaCheck style={{ color: 'green' }} /> This Trip is Complete!
                  </>
                ) : (
                  <>
                    <FaCheck style={{ color: 'grey' }} /> Complete This Trip
                  </>
                )}
              </button>
              <div className="edit-form-actions">
                <button onClick={handleEditSubmit}>Save</button>
                <button onClick={handleEditCancel}>Cancel</button>
              </div>
            </div>
          </div>
        )}
    </>
  );
};

export default TripDetail;
