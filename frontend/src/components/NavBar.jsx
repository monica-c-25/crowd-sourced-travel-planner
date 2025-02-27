import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../components/NavBar.css";

const NavBar = () => {
  const { loginWithRedirect, logout, isAuthenticated, isLoading, user } = useAuth();

  // Dropdown state for showing logout button
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const closeDropdown = () => setIsDropdownOpen(false);

  // If loading, show loading state
  if (isLoading) {
    return <div>Loading ...</div>;
  }

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  return (
    <nav className="navigation">
      <h1 className="brand">
        <Link to="/" className="brand-link">
          <img src="/images/logo.jpg" alt="An owl logo" />
          OwlWays Travel
        </Link>
      </h1>
      <ul className="navLinks">
        <li>
          <Link to="/explore" className="link">Explore</Link>
        </li>
        <li>
          <Link to="/about" className="link">About Us</Link>
        </li>

        {isAuthenticated ? (
          <>
            <li>
              <Link to="/dashboard" className="link">My Dashboard</Link>
            </li>
            {/* User is authenticated, show their info */}
            <li className="link">
              <div className="dropdown">
              <div className="user-info" onClick={toggleDropdown}>
                <img
                  src="/images/default-pic.jpg"
                  alt="avatar"
                  className="user-avatar"
                />
                <div className="user-details">
                <div className="user-details">
                Welcome, {user?.name?.split(" ")[0] || "User"}
                </div>
                </div>
              </div>

              {isDropdownOpen && (
                <div className="dropdown-menu">
                   <button
                    onClick={closeDropdown}
                    className="close-btn"
                  >
                    X
                  </button>
                  <button
                    onClick={() => logout({ returnTo: window.location.origin })}
                    className="link logout-btn"
                  >
                    Log Out
                  </button>
                </div>
              )}
              </div>
            </li>
          </>
        ) : (
          // Show login button when not authenticated
          <li>
            <button
              onClick={() => loginWithRedirect()}
              className="link login-btn"
            >
              Login
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
