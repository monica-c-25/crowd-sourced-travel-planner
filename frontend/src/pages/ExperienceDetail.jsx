import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import './ExperienceDetail.css';
import { FaRegBookmark } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";


const ExperienceDetail = () => {
  const { id } = useParams(); // Get experience ID from URL
  const [experience, setExperience] = useState(null);
  const [comments, setComments] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const response = await fetch(`http://localhost:8001/api/experience-data/${id}`);
        const data = await response.json();
        if (data.Message === "Success") {
          setExperience(data.data);
          setComments(data.data.Comment)
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

  // useEffect(() => {
  //   const fetchComments = async () => {
  //     try {
  //       const response = await fetch("http://localhost:8001/api/comment-data");
  //       const data = await response.json();
  //       if (data.Message === "Success") {
  //         setComments(data.data);
  //       } else {
  //         console.error("Comments not found.");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching comments:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchComments();
  // }, []);

  if (loading) return <p>Loading...</p>;
  if (!experience) return <p>Experience not found.</p>;

  const handleWriteReviewClick = () => {
    if (isAuthenticated) {
      navigate("/review-form");
    } else {
      alert("You must be signed in to write a review.");
    }
  };

  return (
    <>
    <div className="search-bar">
      <div><SearchBar /></div>
    </div>
    <div className="experience-detail">
      <div className="header-container">
        <div className="header-group-left">
          <h1>{experience.title}</h1>
          <button className="review-btn" onClick={handleWriteReviewClick}>Write a Review</button>
        </div>
        <button className="bookmark-btn"><FaRegBookmark />Bookmark</button>
      </div>
      <div className="header-detail">
        <div className="header-detail-left">
          <p>Created by <a href="">{experience.User[0].name}</a></p>
          <p>Average rating: {experience.rating.average}  (<a href="">{experience.rating.total} Reviews</a>)</p>
        </div>
        <div className="header-detail-right">
          <p><strong>Event Date:</strong> {experience.eventDate}</p>
          <p><strong>Created On:</strong> {experience.creationDate}</p>
        </div>
      </div>
      
      <img className="images" src={experience.Photos || "/images/travel-background.jpg"} alt="No Img Available" />
      
      <div className="detail-container">
        <div className="detail-left">
          <h4>Description</h4> 
          <p>{experience.description}</p>
        </div>
        <div className="detail-right">
          <h4>Location</h4> 
          <p>{experience.location}</p>
        </div>
      </div>

      <div className="review-container">
        <h4>Latest Reviews</h4>
        {/* <div className="review-grid">
          <div className="review-card">Review 1 Review 1 Review 1 Review 1 Review 1 Review 1 Review 1 Review 1 Review 1 Review 1 Review 1 Review 1 Review 1 Review 1 Review 1 Review 1 Review 1 Review 1 Review 1 Review 1 Review 1 Review 1 </div>
          <div className="review-card">Review 2</div>
          <div className="review-card">Review 3</div>
        </div> */}
        <a href="">See More Reviews</a>
          {loading ? (
          <p className="loading-message">Loading...</p>
        ) : (
          <div className="review-grid">
            {Array.isArray(comments) && comments.length > 0 ? (
              comments.map((comment, index) => (
                <div className="review-card">
                  <h3>{comment.User[0]}</h3>
                  <p className="date">{comment.commentDate}</p>
                  <div>
                    {[1,2,3,4,5].map(star => (
                      <span key={star}>
                        {/* Fill star if rating is greater than or equal to the star number */}
                        {comment.rating >= star ? (
                          <i className="fa fa-star" style={{ color: 'gold' }}></i> // Filled star
                        ) : (
                          <i className="fa fa-star-o" style={{ color: 'gray' }}></i> // Empty star
                        )}
                      </span>
                    ))}
                  </div>
                  <p>{comment.Comment}</p>
                </div>
              ))
            ) : (
              <p>No comments available.</p>
            )}
          </div>
        )}
      </div>
      
    </div>
    </>
  );
};

export default ExperienceDetail;
