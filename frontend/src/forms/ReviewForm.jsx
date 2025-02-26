import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./ReviewForm.css";
import { useParams } from 'react-router-dom';


function ReviewForm(props) {
  const { isAuthenticated, userID } = useAuth();
  const { id } = useParams(); // Get experience ID from URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    commentDate: today,
    review: "",
    rating: 0,
    user: [props.user]
  });
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      alert("You must be signed in to access this page");
      navigate(-1); // Redirect to login page
    } else {
      setLoading(false); // Only render content when authentication is verified
    }
  }, [isAuthenticated, navigate]);

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
      const response = await fetch("http://127.0.0.1:8001/api/comment-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentDate: today,
          Comment: formData.Comment,
          rating: formData.rating,
          User: [userID],
          Experience: [id]
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.Message === "Success") {
          alert("Thanks for leaving a review!");
          setFormData({
            commentDate: today,
            Comment: "",
            rating: 0,
          });

          window.history.back(); // Return to Experience Details Page
        } else {
          alert(result.Message || "Unable to add review");
        }
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.Message || "Failed to add review."}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form.");
    }
  };

  if (loading) {
    return <div>Loading...</div>; // You can show a loading spinner or any other placeholder
  }

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h1>Write a Review</h1>
      <div className="form-group">
        <label htmlFor="rating">Rating:</label>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${
                star <= (hoverRating || formData.rating) ? "filled" : ""
              }`}
              onMouseEnter={() => setHoverRating(star)} // Hover
              onMouseLeave={() => setHoverRating(0)} // Reset hover
              onClick={() => setFormData({ ...formData, rating: star })} // Set rating on click
            >
              &#9733; {/* Unicode star character */}
            </span>
          ))}
        </div>
        <label htmlFor="Comment">Review:</label>
        <textarea
          id="Comment"
          name="Comment"
          value={formData.Comment}
          onChange={handleChange}
          placeholder="Write your review."
          maxLength="1200"
          required
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="submit-button">
          Create
        </button>
        <button
          type="button"
          className="cancel-button"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ReviewForm;
