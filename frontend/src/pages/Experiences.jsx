import React, { useEffect, useState } from "react";
import "./Experiences.css";
import SearchBar from "../components/SearchBar";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Explore = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth(); // Ensure you destructure the result of useAuth properly
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch experiences from the backend API
    const fetchExperiences = async () => {
      try {
        const response = await fetch(
          "http://localhost:8001/api/experience-data",
          {
            method: "GET", // Specify GET method if it's a GET request
            headers: {
              Accept: "application/json", // The response is expected in JSON
              "Content-Type": "application/json", // Requesting JSON data
            },
          }
        );
        if (!response.ok) {
          console.error("Server responded with error:", response.status);
          return;
        }
        const data = await response.json();
        console.log("Response Data:", data);
        if (data.Message === "Success") {
          setExperiences(data.data);
        } else {
          console.error("No experiences found.");
        }
      } catch (error) {
        console.error("Error fetching experiences:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  const handleAddExperienceClick = () => {
    if (isAuthenticated) {
      navigate("/experience-form");
    } else {
      alert("You must be signed in to add an experience.");
    }
  };

  return (
    <div className="explore-container">
      <h1>Explore Experiences</h1>
      <div className="button-container">
        <button className="button" onClick={handleAddExperienceClick}>
          Add New Experience
        </button>
        <button
          className="button"
          onClick={() => navigate("/ai-recommendator")}
        >
          Use AI to plan a trip!
        </button>
      </div>
      <div className="search-bar-container">
        <SearchBar />
      </div>
      {loading ? (
        <p className="loading-message">Loading...</p>
      ) : (
        <div className="experience-grid">
          {experiences.length > 0 ? (
            experiences.map((experience, index) => (
              <Link
                key={index}
                to={`/experience-detail/${experience._id}`} // Navigate to details page
                className="experience-card"
              >
                <h3>{experience.title}</h3>
                <img
                  src={experience.Photos || "/images/travel-background.jpg"}
                  alt="No Img Available"
                />
                <p className="date">{experience.eventDate}</p>
                <p>{experience.location}</p>
                <p>{experience.description}</p>
              </Link>
            ))
          ) : (
            <p>No experiences available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Explore;
