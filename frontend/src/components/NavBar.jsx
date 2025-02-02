import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import "../components/NavBar.css";

const NavBar = () => {
    const { user, setUser } = useContext(UserContext);  // Get user and setUser from context

    useEffect(() => {
        // Fetch user data from backend to check if logged in
        fetch("http://localhost:8001/user", {
            method: "GET",
            credentials: "include",  // Include cookies for session
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.user) {
                setUser(data.user);  // Set user data if logged in
            }
        })
        .catch((error) => console.error("Error fetching user data:", error));
    }, [setUser]);

    const handleLogout = () => {
        fetch("http://localhost:8001/logout", {
            method: "GET",
            credentials: "include", // Include cookies for session
        })
        .then(() => {
            setUser(null); 
        })
        .catch((err) => console.error("Logout failed", err));
    };

    return (
        <nav className="navigation">
            <h1 className="brand">
                <Link to="/" className="brand-link">
                    <img src="/images/logo.jpg" alt="an owl logo" />
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
                {user ? (
                    <>
                        <li className="link">Welcome, {user.name}</li>
                        <li>
                            <button onClick={handleLogout} className="link logout-btn">Log Out</button>
                        </li>
                    </>
                ) : (
                    <li>
                        <button onClick={() => window.location.href = "http://localhost:8001/login"} className="link login-btn">Sign-In</button>
                    </li>
                )}
            </ul>
        </nav>
    );
};

export default NavBar;
