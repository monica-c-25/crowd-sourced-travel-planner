import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import "../components/NavBar.css";

const NavBar = () => {
    const { user, setUser } = useContext(UserContext);  // Get user and setUser from context

    useEffect(() => {
        // Fetch user data from backend to check if logged in
        fetch("http://localhost:46725/user", {
            method: "GET",
            credentials: "include",  // Include cookies for session
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.user) {
                setUser(data.user);  // Set user data if logged in
            } else {
                setUser(null);  // Reset user context if no user data
            }
        })
        .catch((error) => {
            console.error("Error fetching user data:", error);
            setUser(null);  // Reset user context if error occurs
        });
    }, []);

    const handleLogout = async () => {
        try {

        localStorage.removeItem("auth_token");
        sessionStorage.removeItem("auth_token");
        document.cookie = "auth_token=; max-age=0; path=/"; // Clear cookies
        document.cookie = "auth0-tenant-name=; max-age=0; path=/";


        setUser(null);

        const response = await fetch("/logout", { method: "GET" });

        if (response.ok) {
            console.log("Logout successful on the backend.");
        } else {
            console.error("Logout failed on the backend.");
        }

        } catch (error) {
            console.error("Error logging out:", error);
        }
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
                    <Link to="/" className="link">Explore</Link>
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
                        <button onClick={() => window.location.href = "http://localhost:46725/login"} className="link login-btn">Sign-In</button>
                    </li>
                )}
            </ul>
        </nav>
    );
};

export default NavBar;
