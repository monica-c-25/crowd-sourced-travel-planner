import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ExperienceDetail = () => {
  const { id } = useParams(); // Get experience ID from URL
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const response = await fetch(`http://localhost:8001/api/experience-data/${id}`);
        const data = await response.json();
        if (data.Message === "Success") {
          setExperience(data.data);
        } else {
          console.error("Experience not found.");
        }
      } catch (error) {
        console.error("Error fetching experience:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!experience) return <p>Experience not found.</p>;

  return (
    <div className="experience-detail">
      <h1>{experience.title}</h1>
      <img src={experience.Photos || "/images/travel-background.jpg"} alt="No Img Available" />
      <p><strong>Event Date:</strong> {experience.eventDate}</p>
      <p><strong>Location:</strong> {experience.Location}</p>
      <p><strong>Description:</strong> {experience.Description}</p>
    </div>
  );
};

export default ExperienceDetail;
