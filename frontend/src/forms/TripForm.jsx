import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./TripForm.css";
import '../index.css';

function TripForm() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const today = new Date().toISOString().split("T")[0];

    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: "",
        eventDate: { start: "", end: "" },
        selectedTrips: [],
    });

    const [experiences, setExperiences] = useState([]); 
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (!isAuthenticated) {
            alert("You must be signed in to access this page");
            navigate(-1);
        } else {
            setLoading(false);
            fetchExperiences();
        }
    }, [isAuthenticated, navigate]);

    const fetchExperiences = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8001/api/experience-data");
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    setExperiences(data);
                } else {
                    console.error("Fetched data is not an array:", data);
                }
            } else {
                console.error("Failed to fetch experiences");
            }
        } catch (error) {
            console.error("Error fetching experiences:", error);
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleTripSelection = (tripId) => {
        setFormData((prev) => {
            const isSelected = prev.selectedTrips.includes(tripId);
            return {
                ...prev,
                selectedTrips: isSelected
                    ? prev.selectedTrips.filter((id) => id !== tripId)
                    : [...prev.selectedTrips, tripId],
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // If checkbox is checked, ensure both start and end dates are selected
        if (
            (formData.eventDate.start && !formData.eventDate.end) ||
            (!formData.eventDate.start && formData.eventDate.end)
        ) {
            alert("Please select both start and end dates for the event.");
            return;
        }

        const formPayload = {
            title: formData.title,
            selectedTrips: formData.selectedTrips,
            creationDate: today,
            eventDate: formData.eventDate,
        };


        try {
            const response = await fetch("http://127.0.0.1:8001/api/trip-data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formPayload),
            });

            if (response.ok) {
                alert("Trip added successfully!");
                setFormData({
                    title: "",
                    eventDate: { start: "", end: "" },
                    selectedTrips: [],
                });
                window.location.href = "/dashboard";
            } else {
                alert("Failed to add trip");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("An error occurred while submitting the form.");
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="body-content">
            <h1>Create Your Trip</h1>
            <form onSubmit={handleSubmit} className="trip-form">
                <div className="title">
                    <label htmlFor="title">Title:</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Add a title"
                        required
                    />
                </div>

                {/* Select Trips Section */}
                <div className="form-group filters">
                    <label>Select trips from your experiences</label>
                    <div className="trip-filters">
                        <button
                            type="button"
                            onClick={() => setFilter("all")}
                            className={filter === "all" ? "selected-filter" : ""}
                        >
                            Show All
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilter("myExperiences")}
                            className={filter === "myExperiences" ? "selected-filter" : ""}
                        >
                            My Experiences
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilter("bookmarked")}
                            className={filter === "bookmarked" ? "selected-filter" : ""}
                        >
                            Bookmarked
                        </button>
                    </div>
                    <div className="trip-list">
                        {experiences.map((trip) => (
                            <div
                                key={trip._id}
                                className={`trip-card ${formData.selectedTrips.includes(trip._id) ? "selected" : ""}`}
                                onClick={() => handleTripSelection(trip._id)}
                            >
                                <img src={trip.photoURL || "/default-trip.jpg"} alt={trip.title} />
                                <p>{trip.title}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trip Completion Date */}
                <div className="form-group">
                    <label className="check-label">
                        <input
                            type="checkbox"
                            onChange={(e) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    eventDate: e.target.checked
                                        ? { start: today, end: today }
                                        : { start: "", end: "" },
                                }));
                            }}
                        />
                        Have you already completed this trip?
                    </label>

                    {/* Only show date fields if checkbox is checked */}
                    {formData.eventDate.start && formData.eventDate.end && (
                        <div className="date-range-container">
                            <input
                                type="date"
                                value={formData.eventDate.start}
                                onChange={(e) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        eventDate: { ...prev.eventDate, start: e.target.value },
                                    }));
                                }}
                                required
                                placeholder="Choose a start date"
                            />
                            <span>to</span>
                            <input
                                type="date"
                                value={formData.eventDate.end}
                                onChange={(e) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        eventDate: { ...prev.eventDate, end: e.target.value },
                                    }));
                                }}
                                required
                                placeholder="Choose an end date"
                            />
                        </div>
                    )}
                </div>

                {/* Static "Drag and Drop" Box */}
                <div className="form-group">
                    <label>Cover Photo (Optional)</label>
                    <div className="dropzone-container">
                        <p className="drag-drop-text">Drag & Drop or,</p>
                        <label htmlFor="file-upload" className="browse-link">Browse</label>
                        <input
                            type="file"
                            id="file-upload"
                            style={{ display: "none" }}
                            disabled // Disable the file input, so it doesn't actually upload
                        />
                    </div>
                </div>

                {/* Submit and Reset Buttons */}
                <div className="form-actions">
                    <div className="button-group-left">
                        <button type="submit" className="submit-button">Create</button>
                        <button
                            type="button"
                            className="reset-button"
                            onClick={() => setFormData({
                                title: "",
                                eventDate: { start: "", end: "" },
                                selectedTrips: [],
                            })}
                        >
                            Reset
                        </button>
                    </div>
                    <button type="button" className="cancel-button" onClick={() => navigate(-1)}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default TripForm;