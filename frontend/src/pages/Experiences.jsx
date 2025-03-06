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
        const apiUrl = process.env.REACT_APP_API_URL;

        // Ensure the API URL is defined
        if (!apiUrl) {
          console.error("API URL is not defined in the environment variables.");
          return;
        }

        // Fetch data using the dynamic API URL
        const response = await fetch(`${apiUrl}/api/experience-data`, {
          method: "GET", // Specify GET method if it's a GET request
          headers: {
            Accept: "application/json", // The response is expected in JSON
          },
        });
        if (!response.ok) {
          console.error("Server responded with error:", response.status);
          return;
        }
        const data = await response.json();
        console.log("Response Data:", data);
        if (data.Message === "Success") {
          setExperiences(data.data.reverse());
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

  // const getFirstPhotoUrl = (experience) => {
  //   if (experience && experience.photo_data && experience.photo_data.length > 0) {
  //     // Return the URL of the first photo in the array
  //     return experience.photo_data[0].photo_url;
  //   }
  //   // Fallback to default image if no photos are available
  //   return "/images/travel-background.jpg";
  // };

  const getRandomPhotoUrl = (experience) => {
    if (experience && experience.photo_data && experience.photo_data.length > 0) {
      // Get a random index from the photo_data array
      const randomIndex = Math.floor(Math.random() * experience.photo_data.length);
      return experience.photo_data[randomIndex].photo_url;
    }
    // Fallback to default image if no photos are available
    return "/images/travel-background.jpg";
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
      <div className="search-bar">
        <SearchBar />
      </div>
      {loading ? (
        <p className="loading-message">Loading...</p>
      ) : (
        <div className="experience-grid">
          {Array.isArray(experiences) && experiences.length > 0 ? (
            experiences.map((experience, index) => (
              <Link
                key={index}
                to={`/experience-detail/${experience._id}`} // Navigate to details page
                className="experience-card"
              >
                <h3>{experience.title}</h3>
                <img
                  src={getRandomPhotoUrl(experience)} // Use helper function to get a random photo
                  // src={getFirstPhotoUrl(experience)} // Use helper function to get first photo uploaded to the experience
                  alt="Experience"
                />
                <p className="date">{experience.eventDate}</p>
                <p><strong>Location: </strong> {experience.location}</p>
                <p><strong>Description: </strong>{experience.description.slice(0, 42)}{experience.description.length > 42 && "..."}</p>
                <p><strong>Created By: </strong>{experience.User[0]}</p>
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
