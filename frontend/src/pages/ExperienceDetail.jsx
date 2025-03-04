import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import './ExperienceDetail.css';
import { FaRegBookmark, FaBookmark, FaRegEdit } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";


const ExperienceDetail = () => {
  const { id } = useParams(); // Get experience ID from URL
  const [experience, setExperience] = useState(null);
  const [comments, setComments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, userID } = useAuth();
  const [formData, setFormData] = useState({ 
    title: "",
    description: "",
    eventDate: "",
    location: ""
  });
  const [updatedData, setUpdatedData] = useState({
    "mongo_id": id
  });
  const [bookmarks, setBookmarks] = useState([]);
  
  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const response = await fetch(`http://localhost:8001/api/experience-data/${id}`);
        const data = await response.json();
        if (data.Message === "Success") {
          setExperience(data.data);
          setComments(data.data.Comment);
        } else {
          console.error("Experience not found.");
        }
      } catch (error) {
        console.error("Error fetching experience:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserBookmarks = async () => {
      if (isAuthenticated && userID) {
        try {
          const response = await fetch(`http://localhost:8001/api/user-data/${userID}`);
          const data = await response.json();
          if (data.Message === "Success") {
            setBookmarks(data.data.Bookmarks || []); // Set the bookmarks from the DB
          }
        } catch (error) {
          console.error("Error fetching user bookmarks:", error);
        }
      }
    };

    fetchExperience();
    fetchUserBookmarks();
  }, [id, isAuthenticated, userID]);

  // Function to toggle bookmark state for an experience
  const handleBookmarkClick = async () => {
    if (!isAuthenticated) {
      alert("You must be signed in to bookmark.");
      return;
    }

    const isBookmarked = bookmarks.includes(id);
    let updatedBookmarks;

    if (isBookmarked) {
      updatedBookmarks = bookmarks.filter(bookmark => bookmark !== id);
    } else {
      updatedBookmarks = [...bookmarks, id];
      console.log("updated Bookmarks", updatedBookmarks);
    }

    try {
      // Update the database with the new bookmarks list
      const response = await fetch(`http://localhost:8001/api/user-data`, {
        method: "PUT",
        body: JSON.stringify({ 
          "mongo_id": userID, Bookmarks: updatedBookmarks 
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.Message === "Success") {
        // Update the local state
        setBookmarks(updatedBookmarks);
      } else {
        console.error("Error updating bookmarks.");
      }
    } catch (error) {
      console.error("Error updating bookmarks:", error);
    }
  };

  const isBookmarked = bookmarks.includes(id);

  if (loading) return <p>Loading...</p>;
  if (!experience) return <p>Experience not found.</p>;

  const handleWriteReviewClick = () => {
    if (isAuthenticated) {
      navigate(`/review-form/${id}`);
    } else {
      alert("You must be signed in to write a review.");
    }
  };

  const handleAddPhotosClick = () => {
    if (isAuthenticated) {
      navigate(`/photo-form/${id}`);
    } else {
      alert("You must be signed in to write a review.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value, // Update the corresponding field in the form data
    }));
  };

  const handleEditButtonClick = () => {
    setFormData({
      title: experience.title,
      description: experience.description,
      eventDate: experience.eventDate,
      location: experience.location
    })
    setEditOpen(true);
  };

  const handleEditCancel = () => {
    setEditOpen(false);
  };

  const handleEditSubmit = async () => {
    // Prepare an object to store the fields that have changed
    let updated = { ...updatedData };
  
    // Check for changes and add them to updatedData
    if (formData.description !== experience.description) {
      updatedData.description = formData.description;
    }
    if (formData.title !== experience.title) {
      updatedData.title = formData.title;
    }
    if (formData.eventDate !== experience.eventDate) {
      updatedData.eventDate = formData.eventDate;
    }
    if (formData.location !== experience.location) {
      updatedData.location = formData.location;
    }
    setUpdatedData(updated);
  
    // If no data has changed, don't send anything
    if (Object.keys(updatedData).length === 1) {
      alert("No changes detected.");
      setEditOpen(false);
      return;
    }
  
    // Send the updated data to the server
    try {
      const response = await fetch(`http://localhost:8001/api/experience-data`, {
        method: "PUT",
        body: JSON.stringify(updatedData), // Only send the updated fields
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.Message === "Success") {
        // Update the experience object with the new data
        setExperience((prevExperience) => ({
          ...prevExperience,
          ...updatedData, // Update only the changed fields
        }));
        setEditOpen(false); // Close the modal
      } else {
        console.error("Error updating experience.");
      }
    } catch (error) {
      console.error("Error updating experience:", error);
    }
  };

  return (
    <>
  <div className="search-bar experience-detail-search">
    <SearchBar />
  </div>
    <div className="experience-detail">
      <div className="header-container">
        <div className="header-group-left">
          <h1>{experience.title}</h1>
          <button className="review-btn" onClick={handleWriteReviewClick}>Write a Review</button>
          <button className="photos-btn" onClick={handleAddPhotosClick}>Add Photos</button>
        </div>
        <div className="header-group-right">
          {user && user.name === experience.User[0] && (
            <button className="edit-btn" onClick={handleEditButtonClick}><FaRegEdit />Edit</button>
          )}
          <button className="bookmark-btn" onClick={handleBookmarkClick}>{isBookmarked ? (
        <>
          <FaBookmark /> Unbookmark
        </>
      ) : (
        <>
          <FaRegBookmark /> Bookmark
        </>
      )}</button>
        </div>
      </div>
      <div className="header-detail">
        <div className="header-detail-left">
          <p>Created by <a href="">{experience.User[0]}</a></p>
          <p>Average rating: {experience.rating["average"]}  (<a href="">{experience.rating["total"]} Reviews</a>)</p>
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

      {editOpen && (
        <div className="edit-overlay">
          <div className="edit-form">
            <h3>Edit Experience</h3>
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Add a title"
              required
            />
            <label htmlFor="eventDate">Date of Experience:</label>
            <input
              type="date"
              id="eventDate"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleInputChange}
              required
            />
            <label htmlFor="location">Location:</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Add a location or Address"
              required
            />
            <label htmlFor="description">Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="5"
              cols="40"
            ></textarea>
            <div className="edit-form-actions">
              <button onClick={handleEditSubmit}>Save</button>
              <button onClick={handleEditCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Review section with comments */}
      <div className="review-container">
        <h4>Latest Reviews</h4>
        <a href="">See More Reviews</a>
          {loading ? (
          <p className="loading-message">Loading...</p>
        ) : (
          <div className="review-grid">
            {Array.isArray(comments) && comments.length > 0 ? (
              comments.reverse().map((comment, index) => (
                <div className="review-card" key={index}>
                  <div>
                    {[1,2,3,4,5].map(star => (
                      <span key={star}>
                        {/* Fill star if rating is greater than or equal to the star number */}
                        {comment[3] >= star ? (
                          <i className="fa fa-star" style={{ color: 'gold' }}></i> // Filled star
                        ) : (
                          <i className="fa fa-star-o" style={{ color: 'gray' }}></i> // Empty star
                        )}
                      </span>
                    ))}
                  </div>
                  <h3>{comment[0]}</h3> {/* Name */}
                  <p>{comment[1]}</p> {/* Date */}
                  <p>{comment[2]}</p> {/* Comment */}
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
