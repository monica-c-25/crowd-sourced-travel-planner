import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Assuming this context gives the user info
import './Dashboard.css';
import '../index.css';

const Dashboard = () => {
    const { isAuthenticated, user, userID } = useAuth();
    const navigate = useNavigate();

    // State to track which button is selected in each section
    const [selectedExperienceButton, setSelectedExperienceButton] = useState("default");
    const [selectedTripButton, setSelectedTripButton] = useState("default");
    const [selectedBookmarkButton, setSelectedBookmarkButton] = useState("default");

    // State to track viewMode
    const [expViewMode, setExpViewMode] = useState("grid");
    const [bmViewMode, setBMViewMode] = useState("grid");

    // State to hold user-specific experiences
    const [experiences, setExperiences] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Handle user creating an experience
    const handleCreateExperienceClick = () => {
        if (isAuthenticated) {
            navigate("/experience-form");
        } else {
            alert("You must be signed in to add an experience.");
        }
    };

    const handleCreateTripClick = () => {
        if (isAuthenticated) {
            navigate("/trip-form");
        } else {
            alert("You must be signed in to add a trip.");
        }
    };

    const handleExperienceButtonClick = (buttonType) => {
        setSelectedExperienceButton(buttonType);
        if (buttonType === "list") {
            setExpViewMode("list"); // Switch to list view
        } else {
            setExpViewMode("grid"); // Switch back to grid view
        }
    };

    const handleTripButtonClick = (buttonType) => {
        setSelectedTripButton(buttonType);
    };

    const handleBookmarkButtonClick = (buttonType) => {
        setSelectedBookmarkButton(buttonType);
        if (buttonType === "list") {
            setBMViewMode("list"); // Switch to list view
        } else {
            setBMViewMode("grid"); // Switch back to grid view
        }
    };

    // Fetch user's experiences based on their ID
    useEffect(() => {
        if (isAuthenticated && user) {
            fetchUserExperiences(user.auth0_id); // Assuming `user.auth0_id` is the user's ID
        }
    }, [isAuthenticated, user]);

    const fetchUserExperiences = async () => {
        setLoading(true);
        try {
            console.log("user ID is: ", userID);
            const response = await fetch(`http://127.0.0.1:8001/api/user-experiences/${userID}`);
            const data = await response.json();

            console.log("Fetched Data:", data[0]); // Debugging: Ensure correct response

            if (response.ok && Array.isArray(data.data[0])) {
                setExperiences(data.data[0]);
                setBookmarks(data.data[1]);
            } else {
                console.error("Fetched data is not an array:", data);
                setExperiences([]); // Ensure empty state if data is incorrect
                setBookmarks([]);
            }
        } catch (error) {
            console.error("Error fetching experiences:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="board-body body-content">
            {/* Board Navigation */}
            <div className="board-nav">
                <div className="left">
                    <h1 className="title">My Board</h1>
                </div>
                <div className="right">
                    <div className="board-links">
                        <a href="#experience-nav">My Experiences</a>
                        <div>|</div>
                        <a href="#trip-nav">My Trips</a>
                        <div>|</div>
                        <a href="#bookmark-nav">Bookmarked</a>
                    </div>
                </div>
            </div>

            {/* My Experiences Section */}
            <div id="experience-nav" className="experience-nav">
                <div className="left">
                    <h3 className="title">My Experiences</h3>
                    <button onClick={handleCreateExperienceClick}>
                        Create an Experience
                    </button>
                </div>
                <div className="right">
                    <div>{experiences.length} Experience(s)</div>
                    <button
                        className={selectedExperienceButton === "default" ? "selected" : "not-selected"}
                        onClick={() => handleExperienceButtonClick("default")}
                    >
                        Default
                    </button>
                    <button
                        className={selectedExperienceButton === "az" ? "selected" : "not-selected"}
                        onClick={() => handleExperienceButtonClick("az")}
                    >
                        A-Z
                    </button>
                    <button
                        className={selectedExperienceButton === "list" ? "selected" : "not-selected"}
                        onClick={() => handleExperienceButtonClick("list")}
                    >
                        List View
                    </button>
                </div>
            </div>

            {/* Display User's Experiences */}
            <div className={`user-experiences ${expViewMode === "list" ? "list-view" : ""}`}>
                {loading ? (
                    <p>Loading experiences...</p>
                ) : (
                    experiences.length === 0 ? (
                        <p>No experiences to display.</p>
                    ) : (
                        experiences.map((experience) => (
                            <div key={experience._id} className="experience-card">
                                <h4>{experience.title}</h4>
                                <p><strong>Date:</strong> {experience.eventDate}</p>
                                <p><strong>Location:</strong> {experience.location}</p>
                                <p><strong>Description:</strong> {experience.description}</p>
                                <p><strong>Created on:</strong> {experience.creationDate}</p>
                                {experience.photoURL && <img src={experience.photoURL} alt="Experience" />}
                                <div className="ratings">
                                    <p><strong>Rating:</strong> {experience.rating ? `Avg: ${experience.rating.average}` : "No ratings yet"}</p>
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>

            {/* My Trips Section */}
            <div id="trip-nav" className="trip-nav">
                <div className="left">
                    <h3 className="title">My Trips</h3>
                    <button onClick={handleCreateTripClick}>
                        Create a Trip
                    </button>
                </div>
                <div className="right">
                    <div>xx Trip(s)</div>
                    <button
                        className={selectedTripButton === "default" ? "selected" : "not-selected"}
                        onClick={() => handleTripButtonClick("default")}
                    >
                        Default
                    </button>
                    <button
                        className={selectedTripButton === "az" ? "selected" : "not-selected"}
                        onClick={() => handleTripButtonClick("az")}
                    >
                        A-Z
                    </button>
                    <button
                        className={selectedTripButton === "list" ? "selected" : "not-selected"}
                        onClick={() => handleTripButtonClick("list")}
                    >
                        List View
                    </button>
                </div>
            </div>

            {/* Bookmarked Section */}
            <div id="bookmark-nav" className="bookmark-nav">
                <div className="left">
                    <h3 className="title">Bookmarked</h3>
                </div>
                <div className="right">
                    <div>{bookmarks.length} Experience(s)</div>
                    <button
                        className={selectedBookmarkButton === "default" ? "selected" : "not-selected"}
                        onClick={() => handleBookmarkButtonClick("default")}
                    >
                        Default
                    </button>
                    <button
                        className={selectedBookmarkButton === "az" ? "selected" : "not-selected"}
                        onClick={() => handleBookmarkButtonClick("az")}
                    >
                        A-Z
                    </button>
                    <button
                        className={selectedBookmarkButton === "list" ? "selected" : "not-selected"}
                        onClick={() => handleBookmarkButtonClick("list")}
                    >
                        List View
                    </button>
                </div>
            </div>

            {/* Display Bookmarked Experiences */}
            <div className={`bookmark-experiences ${bmViewMode === "list" ? "list-view" : ""}`}>
                {loading ? (
                    <p>Loading bookmarked experiences...</p>
                ) : (
                    bookmarks.length === 0 ? (
                        <p>No bookmarked experiences to display.</p>
                    ) : (
                        bookmarks.map((bookmark) => (
                            <div key={bookmark._id} className="bookmark-card">
                                <h4>{bookmark.title}</h4>
                                <p><strong>Date:</strong> {bookmark.eventDate}</p>
                                <p><strong>Location:</strong> {bookmark.location}</p>
                                <p><strong>Description:</strong> {bookmark.description}</p>
                                <p><strong>Created on:</strong> {bookmark.creationDate}</p>
                                {bookmark.photoURL && <img src={bookmark.photoURL} alt="Experience" />}
                                <div className="ratings">
                                    <p><strong>Rating:</strong> {bookmark.rating ? `Avg: ${bookmark.rating.average}` : "No ratings yet"}</p>
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>
        </div>
    );
};

export default Dashboard;
