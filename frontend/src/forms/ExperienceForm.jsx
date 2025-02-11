import React, { useState } from "react";
import "./ExperienceForm.css";
import { useNavigate } from "react-router-dom";

function ExperienceForm() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    title: "",
    eventDate: today,
    Description: "",
    Location: ""
  });

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
          Description: formData.Description,
          Location: formData.Location, // Send lat/lon string
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.Message === "Success") {
          alert(result.Message || "Experience added successfully!");
            setFormData({
              title: "",
              eventDate: today,
              Description: "",
              Location: "",
          });
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

  return (
    <form onSubmit={handleSubmit} className="experience-form">
      <h1>Share Your Experience</h1>
      <h2 className="quote">" Life is about creating and living experiences that are worth sharing "</h2>
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
      <div className="form-group">
        <label htmlFor="eventDate">Date of Experience</label>
        <input
          type="date"
          id="eventDate"
          name="eventDate"
          value={formData.eventDate}
          onChange={handleChange}
        />
      </div>
      </div>
      <div className="form-group">
        <label htmlFor="Description">Description:</label>
        <textarea
          id="Description"
          name="Description"
          value={formData.Description}
          onChange={handleChange}
          placeholder="Add a detailed description"
          maxLength="1200"
          required
        />
      </div>
      <div className="form-group location">
        <label htmlFor="Location">Location:</label>
        <input
          type="text"
          id="Location"
          name="Location"
          value={formData.Location}
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
                Description: "",
                Location: "",
              })
            }
          >
            Reset
          </button>
        </div>
        <button
          type="button"
          className="cancel-button"
          onClick={() => navigate("/explore")}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ExperienceForm;
