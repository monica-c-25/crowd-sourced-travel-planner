import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Assuming this context gives the user info
import { Link } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import './Dashboard.css';
import '../index.css';

const Dashboard = () => {
    const { isAuthenticated, userID } = useAuth();
    const navigate = useNavigate();

    // State to track which button is selected in each section
    const [selectedExperienceButton, setSelectedExperienceButton] = useState("default");
    const [selectedTripButton, setSelectedTripButton] = useState("default");
    const [selectedBookmarkButton, setSelectedBookmarkButton] = useState("default");

    // State to track viewMode
    const [expViewMode, setExpViewMode] = useState("grid");
    const [tripViewMode, setTripViewMode] = useState("grid");
    const [bmViewMode, setBMViewMode] = useState("grid");

    // State to hold user-specific experiences, trips, and bookmarks
    const [experiences, setExperiences] = useState([]);
    const [trips, setTrips] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    // States to store the original unsorted data
    const [originalExperiences, setOriginalExperiences] = useState([]);
    const [originalTrips, setOriginalTrips] = useState([]);
    const [originalBookmarks, setOriginalBookmarks] = useState([]);

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
            setExpViewMode("list");
        } else if (buttonType === "az") {
            setExpViewMode("grid");
            // Sort experiences A-Z by title
            const sortedExperiences = [...experiences].sort((a, b) =>
                a.title.localeCompare(b.title)
            );
            setExperiences(sortedExperiences);
        } else if (buttonType === "default") {
            setExpViewMode("grid");
            // Reset to the original, unsorted experiences
            setExperiences([...originalExperiences]);
        }
    };

    const handleTripButtonClick = (buttonType) => {
        setSelectedTripButton(buttonType);
        if (buttonType === "list") {
            setTripViewMode("list");
        } else if (buttonType === "az") {
            setTripViewMode("grid");
            // Sort trips A-Z by title
            const sortedTrips = [...trips].sort((a, b) =>
                a.title.localeCompare(b.title)
            );
            setTrips(sortedTrips);
        } else if (buttonType === "default") {
            setTripViewMode("grid");
            // Reset to the original, unsorted trips
            setTrips([...originalTrips]);
        }
    };

    const handleBookmarkButtonClick = (buttonType) => {
        setSelectedBookmarkButton(buttonType);
        if (buttonType === "list") {
            setBMViewMode("list");
        } else if (buttonType === "az") {
            setBMViewMode("grid");
            // Sort bookmarks A-Z by title
            const sortedBookmarks = [...bookmarks].sort((a, b) =>
                a.title.localeCompare(b.title)
            );
            setBookmarks(sortedBookmarks);
        } else if (buttonType === "default") {
            setBMViewMode("grid");
            // Reset to the original, unsorted bookmarks
            setBookmarks([...originalBookmarks]);
        }
    };

    // Fetch user data (experiences, trips, bookmarks) and store the original data
    useEffect(() => {
        if (isAuthenticated && userID) {
            fetchUserExperiencesAndTrips(userID);
        }
    }, [isAuthenticated, userID]);

    const fetchUserExperiencesAndTrips = async (userID) => {
        setLoading(true);
        try {
            // Fetch experiences and bookmarks
            const response = await fetch(`http://127.0.0.1:46725/api/user-experiences/${userID}`);
            const data = await response.json();

            if (response.ok && Array.isArray(data.data[0])) {
                setExperiences(data.data[0]);
                setOriginalExperiences(data.data[0]); // Store original experiences data
                setBookmarks(data.data[1]);
                setOriginalBookmarks(data.data[1]); // Store original bookmarks data
            } else {
                setExperiences([]);
                setBookmarks([]);
            }

            // Fetch trips
            const tripResponse = await fetch(`http://127.0.0.1:46725/api/user-trips/${userID}`);
            const tripData = await tripResponse.json();

            if (tripResponse.ok && Array.isArray(tripData.data)) {
                setTrips(tripData.data);
                setOriginalTrips(tripData.data); // Store original trips data
            } else {
                setTrips([]);
            }
        } catch (error) {
            console.error("Error fetching experiences and trips:", error);
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
                        experiences.reverse().map((experience) => (
                            <Link
                                key={experience._id}
                                to={`/experience-detail/${experience._id}`} // Navigate to details page
                                className="experience-card"
                            >
                            {/* <div key={experience._id} className="experience-card"> */}
                                <h4>{experience.title}</h4>
                                <p><strong>Date:</strong> {experience.eventDate}</p>
                                <p><strong>Location:</strong> {experience.location}</p>
                                <p><strong>Description:</strong> {experience.description}</p>
                                <p><strong>Created on:</strong> {experience.creationDate}</p>
                                {experience.photoURL && <img src={experience.photoURL} alt="Experience" />}
                                <div className="ratings">
                                    <p><strong>Rating:</strong> {experience.rating ? `Avg: ${experience.rating.average}` : "No ratings yet"}</p>
                                </div>
                            </Link>
                            // </div>
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
                    <div>{trips.length} Trip(s)</div>
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

            {/* Display User's Trips */}
            <div className={`user-trips ${tripViewMode === "list" ? "list-view" : ""}`}>
                {loading ? (
                    <p>Loading trips...</p>
                ) : trips.length === 0 ? (
                    <p>No trips to display.</p>
                ) : (
                    trips.reverse().map((trip) => (
                        <Link
                        key={trip._id}
                        to={`/trip-data/${trip._id}`} // Navigate to details page
                        className="trip-card"
                        >
                        {/* <div key={trip._id} className="trip-card"> */}
                            <h4>{trip.title}</h4>
                            <p><strong>Created on:</strong> {trip.creationDate}</p>
                            <p><strong>Event Date:</strong> {trip.eventDate ? `${trip.eventDate.start} to ${trip.eventDate.end}` : "Not set"}</p>
                            {trip.photoURL && <img src={trip.photoURL} alt="Trip" />}
                            {trip.completed && (<p><FaCheck style={{ color: 'green' }} /> Trip has been completed!</p>)}
                        {/* </div> */}
                        </Link>
                    ))
                )}
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
                        bookmarks.reverse().map((bookmark) => (
                            <Link
                                key={bookmark._id}
                                to={`/experience-detail/${bookmark._id}`} // Navigate to details page
                                className="bookmark-card"
                            >
                                <h4>{bookmark.title}</h4>
                                <p><strong>Date:</strong> {bookmark.eventDate}</p>
                                <p><strong>Location:</strong> {bookmark.location}</p>
                                <p><strong>Description:</strong> {bookmark.description}</p>
                                <p><strong>Created on:</strong> {bookmark.creationDate}</p>
                                {bookmark.photoURL && <img src={bookmark.photoURL} alt="Experience" />}
                                <div className="ratings">
                                    <p><strong>Rating:</strong> {bookmark.rating ? `Avg: ${bookmark.rating.average}` : "No ratings yet"}</p>
                                </div>
                            </Link>
                        ))
                    )
                )}
            </div>
        </div>
    );
};

export default Dashboard;
