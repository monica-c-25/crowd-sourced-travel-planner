import React, { useState } from "react";
import "./experienceForm.css";

function ExperienceForm() {
  const [formData, setFormData] = useState({
    title: "",
    eventDate: "",
    Description: "",
    Location_lat: "",
    Location_lon: "",
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

    const location = `${formData.Location_lat},${formData.Location_lon}`;

    try {
      const response = await fetch("http://127.0.0.1:46725/api/experience", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          eventDate: formData.eventDate,
          Description: formData.Description,
          Location: location,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || "Experience added successfully!");
        setFormData({
          title: "",
          eventDate: "",
          Description: "",
          Location_lat: "",
          Location_lon: "",
        });
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Failed to add experience."}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="experience-form">
      <h1>Share Your Experience</h1>
      <h2>" Life is about creating and living experiences that are worth sharing "</h2>
      <h2>- Steve Jobs</h2>
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
        <div>
          <label htmlFor="Location_lat">Latitude:</label>
          <input
            type="number"
            id="Location_lat"
            name="Location_lat"
            value={formData.Location_lat}
            onChange={handleChange}
            step="0.0001"
            min="-90"
            max="90"
            required
          />
        </div>
        <div>
          <label htmlFor="Location_lon">Longitude:</label>
          <input
            type="number"
            id="Location_lon"
            name="Location_lon"
            value={formData.Location_lon}
            onChange={handleChange}
            step="0.0001"
            min="-180"
            max="180"
            required
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="submit-button">
          Create
        </button>
        <button
          type="button"
          className="reset-button"
          onClick={() =>
            setFormData({
              title: "",
              eventDate: "",
              Description: "",
              Location_lat: "",
              Location_lon: "",
            })
          }
        >
          Reset
        </button>
      </div>
    </form>
  );
}

export default ExperienceForm;