import React, { useState } from "react";
import "./experienceForm.css";

function ExperienceForm() {
  const [formData, setFormData] = useState({
    title: "",
    eventDate: "",
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
        alert(result.message || "Experience added successfully!");
        setFormData({
          title: "",
          eventDate: "",
          Description: "",
          Location: "",
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
              Location: "",
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