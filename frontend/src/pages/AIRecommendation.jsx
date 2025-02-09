import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import './AIRecommendation.css'; // Assume styles are in this CSS file

// React Component
const AIRecommendations = () => {
  const location = useLocation();
  const { recommendations: rawRecommendations } = location.state || {};

  const [recommendations, setRecommendations] = useState(null);

  const parseRecommendations = (rawData) => {
    // Extract everything between the triple backticks (```) because recommendations is a string
    const regex = /```json([\s\S]*?)```/; 
    const match = rawData.match(regex);

    // match to verify if string contains valid json object
    if (match && match[1]) {
      const jsonString = match[1].trim();

      try {
        return JSON.parse(jsonString);
      } catch (error) {
        console.error("Error parsing recommendations JSON:", error);
        return null;
      }
    }

    return null; // Return null if no match found
  };

  useEffect(() => {
    // Only parse the recommendations if rawRecommendations is available
    if (rawRecommendations) {
      const parsedRecommendations = parseRecommendations(rawRecommendations);
      setRecommendations(parsedRecommendations);
    }
  }, [rawRecommendations]);

  const renderCategories = () => {
    if (!recommendations) {
      return <p>Loading...</p>;
    }

    return Object.keys(recommendations).map((category, index) => {
      // Skip 'Introduction' if it's present
      if (category === "Introduction") return null;
      
      return (
        <div key={index} className="category">
          <h3>{category}</h3>
          <ul>
            {recommendations[category].map((item, idx) => (
              <li key={idx} className="category-item">
                <h4>{item.name}</h4>
                <p>{item.description}</p>
                <p><strong>Address:</strong> {item.address}</p>
              </li>
            ))}
          </ul>
        </div>
      );
    });
  };

  return (
    <div className="recommendations-container">
      <>
        {recommendations && recommendations.Introduction && (
          <h2>{recommendations.Introduction}</h2>
        )}

        {renderCategories()}
      </>
    </div>
  );
};

export default AIRecommendations;
