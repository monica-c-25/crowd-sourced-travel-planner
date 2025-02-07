import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import './AIRecommendation.css'; // Assume styles are in this CSS file

// ParseText Function
const parseText = (text) => {
    const result = {
      intro: '',
      categories: [],
      closingStatement: '',
    };
  
    // Step 1: Extract Intro (Everything before the first '###')
    const introMatch = text.match(/^(.*?)###/s);
    if (introMatch) {
      result.intro = introMatch[1].trim();
    }
  
    // Step 2: Extract Categories and their recommendations
    const categoryRegex = /###\s+(.+?)\n([\s\S]+?)(?=###|$)/g;
    let match;
    
    while ((match = categoryRegex.exec(text)) !== null) {
      const category = match[1].trim();
      const recommendationsText = match[2].trim();
  
      // Parse each recommendation under the category
      const recommendations = [];
      const recommendationRegex = /\*\*(.*?)\*\*\s*-\s*(.*?)(?=\n|$)/g;
      let recMatch;
  
      while ((recMatch = recommendationRegex.exec(recommendationsText)) !== null) {
        recommendations.push({
          title: recMatch[1].trim(),
          description: recMatch[2].trim(),
        });
      }
  
      result.categories.push({
        category,
        recommendations,
      });
    }
  
    // Step 3: Extract Closing Statement
    // After all categories are parsed, the remaining part of the text is the closing statement
    const remainingText = text.replace(result.intro, '').replace(/###.*$/s, '').trim();
    console.log(remainingText);
    if (remainingText) {
      result.closingStatement = remainingText;
    }
  
    return result;
  };
  
  
  

// React Component
const AIRecommendations = () => {
  const location = useLocation();
  const { recommendations } = location.state || {};

  const [parsedResult, setParsedResult] = useState({
    intro: '',
    categories: [],
    closingStatement: '',
  });

  useEffect(() => {
    const result = parseText(recommendations);
    setParsedResult(result);
  }, [recommendations]);

  return (
    <div className="recommendation-container">
      {/* Intro */}
      {parsedResult.intro && <div className="intro"><p>{parsedResult.intro}</p></div>}

      {/* Categories */}
      {parsedResult.categories.map((category, index) => (
        <div key={index} className="category">
          <h2 className="category-title">{category.category}</h2>
          {category.recommendations.map((recommendation, recIndex) => (
            <div key={recIndex} className="recommendation">
              <h3 className="recommendation-title">{recommendation.title}</h3>
              <p className="recommendation-description">{recommendation.description}</p>
            </div>
          ))}
        </div>
      ))}

      {/* Closing Statement */}
      {parsedResult.closingStatement && <div className="closing"><p>{parsedResult.closingStatement}</p></div>}
    </div>
  );
};


export default AIRecommendations;
