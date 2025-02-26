import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Assuming this context gives the user info
import './Dashboard.css';
import '../index.css';

const Dashboard = () => {
    const { isAuthenticated, user } = useAuth(); // Get user details (user ID)
    const navigate = useNavigate();

    // State to track which button is selected in each section
    const [selectedExperienceButton, setSelectedExperienceButton] = useState("default");
    const [selectedTripButton, setSelectedTripButton] = useState("default");
    const [selectedBookmarkButton, setSelectedBookmarkButton] = useState("default");

    // State to hold user-specific experiences
    const [experiences, setExperiences] = useState([]);
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
    };

    const handleTripButtonClick = (buttonType) => {
        setSelectedTripButton(buttonType);
    };

    const handleBookmarkButtonClick = (buttonType) => {
        setSelectedBookmarkButton(buttonType);
    };

    // Fetch user's experiences based on their ID
    useEffect(() => {
        if (isAuthenticated && user) {
            fetchUserExperiences(user.auth0_id); // Assuming `user.auth0_id` is the user's ID
        }
    }, [isAuthenticated, user]);

    const fetchUserExperiences = async (userId) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/user-experiences/${userId}`);
            const data = await response.json();
            if (response.ok) {
                setExperiences(data);
            } else {
                console.error("Failed to fetch experiences", data);
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
                        <div>My Experiences</div>
                        <div>|</div>
                        <div>My Trips</div>
                        <div>|</div>
                        <div>Bookmarked</div>
                    </div>
                </div>
            </div>

            {/* My Experiences Section */}
            <div className="experience-nav">
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
            {loading ? (
                <p>Loading experiences...</p>
            ) : (
                <div className="user-experiences">
                    {experiences.length === 0 ? (
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
                    )}
                </div>
            )}

            {/* My Trips Section */}
            <div className="trip-nav">
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
            <div className="bookmark-nav">
                <div className="left">
                    <h3 className="title">Bookmarked</h3>
                </div>
                <div className="right">
                    <div>xx Experience(s)</div>
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
        </div>
    );
};

export default Dashboard;
