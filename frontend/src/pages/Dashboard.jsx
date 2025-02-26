import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import './Dashboard.css';
import '../index.css';

const Dashboard = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // State to track which button is selected in each section
    const [selectedExperienceButton, setSelectedExperienceButton] = useState("default");
    const [selectedTripButton, setSelectedTripButton] = useState("default");
    const [selectedBookmarkButton, setSelectedBookmarkButton] = useState("default");

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
          alert("You must be signed in to add an experience.");
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

    return (
        <div className="board-body body-content">
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

            <div className="experience-nav">
                <div className="left">
                    <h3 className="title">My Experiences</h3>
                    <button onClick={handleCreateExperienceClick}>
                        Create an Experience</button>
                </div>
                <div className="right">
                    <div>xx Experiences(s)</div>
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

            <div className="trip-nav">
                <div className="left">
                    <h3 className="title">My Trips</h3>
                    <button onClick={handleCreateTripClick}>
                        Create a Trip</button>
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
    )
};

export default Dashboard;