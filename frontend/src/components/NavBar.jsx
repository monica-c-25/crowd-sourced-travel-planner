import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import the AuthContext
import "../components/NavBar.css";

const NavBar = () => {
  const { loginWithRedirect, logout, isAuthenticated, isLoading, user } = useAuth();

  // If loading, show loading state
  if (isLoading) {
    return <div>Loading ...</div>;
  }

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
          <Link to="/" className="link">Explore</Link>
        </li>
        <li>
          <Link to="/about" className="link">About Us</Link>
        </li>

        {isAuthenticated ? (
          <>
            {/* User is authenticated, show their info */}
            <li className="link">
              <div className="user-info">
                <img
                  src={user?.picture}
                  alt={user?.name}
                  className="user-avatar"
                />
                <div className="user-details">
                  <h3>Welcome, {user?.name || "User"}</h3>
                </div>
              </div>
            </li>
            <li>
              <button
                onClick={() => logout({ returnTo: window.location.origin })}
                className="link logout-btn"
              >
                Log Out
              </button>
            </li>
          </>
        ) : (
          // Show login button when not authenticated
          <li>
            <button
              onClick={() => loginWithRedirect()}
              className="link login-btn"
            >
              Sign-In
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;

