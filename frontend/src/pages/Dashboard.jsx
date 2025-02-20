import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import './Dashboard.css';
import '../index.css';

const Dashboard = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleCreateTripClick = () => {
        if (isAuthenticated) {
          navigate("/trip-form");
        } else {
          alert("You must be signed in to add an experience.");
        }
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
                    <h3 className="title">My Trips</h3>
                    <button onClick={handleCreateTripClick}>
                        Create a Trip</button>
                </div>
                <div className="right">
                    <div>xx Trip(s)</div>
                    <button>Default</button>
                    <button>A-Z</button>
                    <button>List View</button>
                </div>
            </div>

            <div className="trip-nav">
                <div className="left">
                    <h3 className="title">Bookmarked</h3>
                </div>
                <div className="right">
                    <div>xx Experience(s)</div>
                    <button>Default</button>
                    <button>A-Z</button>
                    <button>List View</button>
                </div>
            </div>
        </div>
    )
};

export default Dashboard;