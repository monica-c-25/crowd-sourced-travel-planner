import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AIRecommendator.css";
import '../index.css';


const ChatbotForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    location: "",
    trip_date: "",
    travel_group: "self",
    interests: [],
  });
  const [customInterest, setCustomInterest] = useState(""); // Stores user-inputted custom interests
  const [recommendations, setRecommendations] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const interestOptions = [
    "Food",
    "Drinks",
    "Attractions",
    "History",
    "Outdoor",
    "Shopping",
  ];

  const handleNext = () => setStep((prevStep) => prevStep + 1);
  const handleBack = () => setStep((prevStep) => prevStep - 1);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInterestChange = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleCustomInterestChange = (e) => {
    setCustomInterest(e.target.value);
  };

  const addCustomInterests = () => {
    if (customInterest.trim() !== "") {
      const newInterests = customInterest.split(",").map((i) => i.trim());
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, ...newInterests],
      }));
      setCustomInterest(""); // Clear input after adding
    }
  };

  const removeInterest = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8001/get_recommendations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();

      setRecommendations(data.recommendations);
      setLoading(false);

      navigate("/ai-recommendation", { state: { recommendations: recommendations } });
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setLoading(false);
    }
  };

  const isFormComplete =
    formData.location.trim() !== "" &&
    formData.trip_date.trim() !== "" &&
    formData.travel_group.trim() !== "" &&
    formData.interests.length > 0;

  return (
    <div className="container">
      <h2>Plan Your Trip</h2>
      <p>Note to Developers:</p>
      <p>Please test sparingly. This is a paid API!</p><br></br>
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="form-group">
            <h3>Where would you like to go?</h3>
            <label>Location:</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter a Location"
              required
            />
            <button type="button" onClick={handleNext}>
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="form-group">
            <h3>When do you plan to go?</h3>
            <label>Trip Date:</label>
            <input
              type="date"
              name="trip_date"
              value={formData.trip_date}
              onChange={handleChange}
              // travel_group
              required
            />
            <button type="button" onClick={handleBack}>
              Back
            </button>
            <button type="button" onClick={handleNext}>
              Next
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="form-group">
            <h3>Who are you traveling with?</h3>
            <label>My Company:</label>
            <select
              name="travel_group"
              value={formData.travel_group}
              onChange={handleChange}
              required
            >
              <option value="self">Solo</option>
              <option value="partner">Partner</option>
              <option value="friends">Friends</option>
              <option value="family">Family</option>
            </select>
            <button type="button" onClick={handleBack}>
              Back
            </button>
            <button type="button" onClick={handleNext}>
              Next
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="form-group">
            <label>Interests:</label>
            <div className="checkbox-group">
              {interestOptions.map((interest, index) => (
                <label
                  key={interest}
                  htmlFor={`interest-${index}`}
                  className="checkbox-label"
                >
                  <input
                    id={`interest-${index}`}
                    type="checkbox"
                    checked={formData.interests.includes(interest)}
                    onChange={() => handleInterestChange(interest)}
                  />
                  <span>{interest}</span>
                </label>
              ))}
            </div>

            {/* Custom Interest Input */}
            <div className="custom-interest-input">
              <input
                type="text"
                placeholder="Enter other interests not listed (separated by commas)"
                value={customInterest}
                onChange={handleCustomInterestChange}
              />
              <button type="button" onClick={addCustomInterests}>
                Add
              </button>
            </div>

            {/* Display Added Interests */}
            <div className="added-interests">
              {formData.interests.map((interest, index) => (
                <span
                  key={index}
                  className="interest-tag"
                  onClick={() => removeInterest(interest)}
                >
                  {interest} ✖
                </span>
              ))}
            </div>

            <button type="button" onClick={handleBack}>
              Back
            </button>
            <button type="submit" disabled={!isFormComplete}>
              Get Recommendations
            </button>
          </div>
        )}
      </form>

      {loading && <div className="loading-indicator">Loading...</div>}
    </div>
  );
};

export default ChatbotForm;
