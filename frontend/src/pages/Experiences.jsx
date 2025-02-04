import React, { useEffect, useState } from "react";
import './Experiences.css';
import SearchBar from "../components/SearchBar";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Explore = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch experiences from the backend API
    const fetchExperiences = async () => {
      try {
        const response = await fetch("http://localhost:8001/api/experience-data", {
            headers: { "Accept": "application/json" },});
        const data = await response.json();
        console.log("Response Data:", data); 
        console.log(data.Message);
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

return (
    <div className="explore-container">
      <h1>Explore Experiences</h1>
      <button className="button" onClick={() => navigate("/experience-form")}>Add New Experience</button>
      <button className="button" onClick={() => navigate("/ai-recommendator")}>Use AI to plan a trip!</button>
      <div className="search-bar-container">
        <SearchBar />
      </div>
      {loading ? (
        <p className="loading-message">Loading...</p>
      ) : (
        <div className="experience-grid">
          {experiences.length > 0 ? (
            experiences.map((experience, index) => (
              // <div key={index} className="experience-card">
              //   <h3>{experience.title}</h3>
              //   <img src={experience.Photos || "/images/travel-background.jpg"} alt="No Img Available" />
              //   <p className="date">{experience.eventDate}</p>
              //   <p>{experience.Location}</p>
              //   <p>{experience.Description}</p>
              // </div>
              <Link
                key={index}
                to={`/experience-detail/${experience._id}`} // Navigate to details page
                className="experience-card"
              >
                <h3>{experience.title}</h3>
                <img src={experience.Photos || "/images/travel-background.jpg"} alt="No Img Available" />
                <p className="date">{experience.eventDate}</p>
                <p>{experience.Location}</p>
                <p>{experience.Description}</p>
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
