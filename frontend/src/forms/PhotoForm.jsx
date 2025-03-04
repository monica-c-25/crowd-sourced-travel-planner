import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PhotoForm(props) {
  const { isAuthenticated, userID } = useAuth();
  const { id } = useParams(); // Get experience ID from URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]); // Change to an array for multiple files
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      alert("You must be signed in to access this page");
      navigate(-1); // Redirect to login page
    } else {
      setLoading(false); // Only render content when authentication is verified
    }
  }, [isAuthenticated, navigate]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files); // Convert FileList to an array
    setFiles(selectedFiles); // Update state to hold an array of files
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      setErrorMessage("Please select at least one file to upload.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("file", file); // Append each file to the FormData
    });

    try {
      const response = await fetch(`http://127.0.0.1:8001/api/experience-data/${id}/photos`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.Message === "Success") {
          alert("Photos uploaded successfully!");
          setFiles([]); // Reset files array after successful upload
          navigate(-1); // Go back to the previous page
        } else {
          alert(result.Message || "Unable to upload photos");
        }
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.Message || "Failed to upload photos."}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form.");
    }
  };

  if (loading) {
    return <div>Loading...</div>; // You can show a loading spinner or any other placeholder
  }

  return (
    <form onSubmit={handleSubmit} className="photo-upload-form">
      <h1>Upload Photos</h1>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <div className="form-group">
        <label htmlFor="file">Choose Photos:</label>
        <input
          type="file"
          id="file"
          name="file"
          accept="image/*"
          onChange={handleFileChange}
          multiple // Allow multiple files
          required
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="submit-button">
          Upload
        </button>
        <button
          type="button"
          className="cancel-button"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default PhotoForm;
