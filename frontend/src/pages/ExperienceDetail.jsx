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
  const [currentIndex, setCurrentIndex] = useState(0); // State to manage current image index
  
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

  // Handle navigation through images
  const handleNext = () => {
    if (experience && experience.photo_data) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % experience.photo_data.length);
    }
  };

  const handlePrevious = () => {
    if (experience && experience.photo_data) {
      setCurrentIndex(
        (prevIndex) => (prevIndex - 1 + experience.photo_data.length) % experience.photo_data.length
      );
    }
  };

  const getPhotoUrl = (index) => {
    if (experience && experience.photo_data && experience.photo_data.length > 0) {
      return experience.photo_data[index].photo_url;
    }
    return "/images/travel-background.jpg"; // Fallback image
  };

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
      alert("You must be signed in to add photos.");
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
    let updated = { ...updatedData };
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
  
    if (Object.keys(updatedData).length === 1) {
      alert("No changes detected.");
      setEditOpen(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8001/api/experience-data`, {
        method: "PUT",
        body: JSON.stringify(updatedData), 
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.Message === "Success") {
        setExperience((prevExperience) => ({
          ...prevExperience,
          ...updatedData,
        }));
        setEditOpen(false); 
      } else {
        console.error("Error updating experience.");
      }
    } catch (error) {
      console.error("Error updating experience:", error);
    }
  };

  // Function to handle deleting a photo
  const handleDeletePhoto = async (index) => {
    if (!isAuthenticated) {
      alert("You must be signed in to delete a photo.");
      return;
    }
  
    // Ensure the photo exists and has a photo_url
    const photo = experience.photo_data[index];
    if (!photo || !photo.photo_url) {
      console.error("Photo URL not found.");
      return;
    }
  
    const photoUrl = photo.photo_url; // Get the photo URL to delete
    const experienceId = experience._id; // Get the experience ID
  
    // Confirm the action with the user
    const confirmDelete = window.confirm("Are you sure you want to delete this photo?");
    if (!confirmDelete) return;
  
    try {
      // Send DELETE request to the backend to delete the photo
      const response = await fetch(`http://localhost:8001/api/experience-data/${experienceId}/photos`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          experience_id: experienceId,
          photo_url: photoUrl, // Send the photo URL to the backend
        }),
      });
  
      const data = await response.json();
  
      if (data.message === "Success: Photo URL Removed") {
        // Update the experience data to remove the deleted photo from the UI
        const updatedExperience = {
          ...experience,
          photo_data: experience.photo_data.filter((_, idx) => idx !== index), // Remove photo at index
        };
        setExperience(updatedExperience); // Update the state with the new photo data
        setCurrentIndex(0); // Reset the photo index after deletion
      } else {
        console.error("Error deleting photo:", data.Error || data.message);
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
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
            <button className="bookmark-btn" onClick={handleBookmarkClick}>
              {isBookmarked ? (
                <>
                  <FaBookmark /> Unbookmark
                </>
              ) : (
                <>
                  <FaRegBookmark /> Bookmark
                </>
              )}
            </button>
          </div>
        </div>

        <div className="photo-viewer-container">
          <button className="scroll-button" onClick={handlePrevious}>←</button>
          <div className="photo-container">
            <img
              src={getPhotoUrl(currentIndex)}
              alt="Experience"
              className="photo-viewer"
            />
            <button className="delete-photo-btn" onClick={() => handleDeletePhoto(currentIndex)}>Delete Photo</button>
          </div>
          <button className="scroll-button" onClick={handleNext}>→</button>
        </div>

        <div className="header-detail">
          <div className="header-detail-left">
            <p>Created by <a href="">{experience.User[0]}</a></p>
            <p>Average rating: {experience.rating["average"]} (<a href="">{experience.rating["total"]} Reviews</a>)</p>
          </div>
          <div className="header-detail-right">
            <p><strong>Event Date:</strong> {experience.eventDate}</p>
            <p><strong>Created On:</strong> {experience.creationDate}</p>
          </div>
        </div>

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
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star}>
                          {comment[3] >= star ? (
                            <i className="fa fa-star" style={{ color: 'gold' }}></i>
                          ) : (
                            <i className="fa fa-star-o" style={{ color: 'gray' }}></i>
                          )}
                        </span>
                      ))}
                    </div>
                    <h3>{comment[0]}</h3>
                    <p>{comment[1]}</p>
                    <p>{comment[2]}</p>
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