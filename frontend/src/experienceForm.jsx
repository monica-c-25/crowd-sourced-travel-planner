import React, { useState } from 'react';

function ExperienceForm() {
    const [formData, setFormData] = useState({
        title: '',
        eventDate: '', // New field for event date
        Description: '',
        Location_lat: '',
        Location_lon: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Construct the Location POINT as a string 'latitude,longitude'
        const location = `${formData.Location_lat},${formData.Location_lon}`;

        try {
            const response = await fetch('http://127.0.0.1:46725/api/experience', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.title,
                    eventDate: formData.eventDate, // Send the event date
                    Description: formData.Description,
                    Location: location, // Send as a string "latitude,longitude"
                }),
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message || 'Experience added successfully!');
                setFormData({
                    title: '',
                    eventDate: '',
                    Description: '',
                    Location_lat: '',
                    Location_lon: '',
                });
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Failed to add experience.'}`);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An error occurred while submitting the form.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="title">Title:</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label htmlFor="eventDate">Event Date:</label>
                <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label htmlFor="Description">Description:</label>
                <textarea
                    id="Description"
                    name="Description"
                    value={formData.Description}
                    onChange={handleChange}
                    maxLength="1200"
                    required
                />
            </div>
            <div>
                <label htmlFor="Location_lat">Latitude:</label>
                <input
                    type="number"
                    id="Location_lat"
                    name="Location_lat"
                    value={formData.Location_lat}
                    onChange={handleChange}
                    step="0.0001"
                    min="-90"
                    max="90"
                    required
                />
            </div>
            <div>
                <label htmlFor="Location_lon">Longitude:</label>
                <input
                    type="number"
                    id="Location_lon"
                    name="Location_lon"
                    value={formData.Location_lon}
                    onChange={handleChange}
                    step="0.0001"
                    min="-180"
                    max="180"
                    required
                />
            </div>
            <button type="submit">Submit</button>
        </form>
    );
}

export default ExperienceForm;
