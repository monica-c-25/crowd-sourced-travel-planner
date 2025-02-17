import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Assuming you have this context
import "./ExperienceForm.css";
import '../index.css';

function ExperienceForm() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    title: "",
    eventDate: today,
    description: "",
    photoURL: "",
    location: ""
  });

  const [loading, setLoading] = useState(true); // Loading state to prevent rendering content before check
  const { isAuthenticated } = useAuth(); // Assuming this hook tells you if the user is authenticated

  // Redirect user if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      alert("You must be signed in to access this page");
      navigate(-1); // Redirect to login page
    } else {
      setLoading(false); // Only render content when authentication is verified
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8001/api/experience-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          eventDate: formData.eventDate,
          creationDate: today,
          description: formData.description,
          photoURL: "",
          location: formData.location, // Send lat/lon string
          rating: {"average": 0, "total": 0}
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.Message === "Success") {
          alert("Experience added successfully!");
          setFormData({
            title: "",
            eventDate: today,
            description: "",
            location: "",
          });

          window.location.href = "/explore";
        } else {
          alert(result.Message || "Unable to add experience");
        }
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.Message || "Failed to add experience."}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form.");
    }
  };

  if (loading) {
    return <div>Loading...</div>; // You can show a loading spinner or any other placeholder
  }

  return (
    <form onSubmit={handleSubmit} className="experience-form">
      <h1>Share Your Experience</h1>
      <h2 className="quote">"Life is about creating and living experiences that are worth sharing"</h2>
      <h2 className="quote-author">- Steve Jobs</h2>
      <div className="form-group">
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Add a title"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="eventDate">Date of Experience:</label>
        <input
          type="date"
          id="eventDate"
          name="eventDate"
          value={formData.eventDate}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add a detailed description"
          maxLength="1200"
          required
        />
      </div>
      <div className="form-group location">
        <label htmlFor="location">Location:</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Add a location or Address"
          required
        />
      </div>
      <div className="form-actions">
        <div className="button-group-left">
          <button type="submit" className="submit-button">
            Create
          </button>
          <button
            type="button"
            className="reset-button"
            onClick={() =>
              setFormData({
                title: "",
                eventDate: today,
                description: "",
                location: "",
              })
            }
          >
            Reset
          </button>
        </div>
        <button
          type="button"
          className="cancel-button"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ExperienceForm;
