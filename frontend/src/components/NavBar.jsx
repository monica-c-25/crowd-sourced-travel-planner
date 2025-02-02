import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { UserContext } from "../App";
import "../components/NavBar.css";

const NavBar = () => {
    const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
    const { setUser } = useContext(UserContext); // Get setUser from UserContext

    // Update user context when authentication state changes
    useEffect(() => {
        if (isAuthenticated) {
            // If logged in, fetch user data from Auth0 and update context
            setUser(user);
        } else {
            setUser(null); // Clear user data when logged out
        }
    }, [isAuthenticated, user, setUser]);

    // Show loading state while determining auth status
    if (isLoading) {
        return (
            <nav className="navigation">
                <h1 className="brand">
                    <Link to="/" className="brand-link">
                        <img src="/images/logo.jpg" alt="an owl logo" />
                        OwlWays Travel
                    </Link>
                </h1>
                <ul className="navLinks">
                    <li>Loading...</li>
                </ul>
            </nav>
        );
    }

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
                {isAuthenticated ? (
                    <>
                        <li className="link">Welcome, {user?.name || "Guest"}</li>
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
                    <li>
                        <button
                            onClick={() => {
                                console.log("Redirecting to Auth0 login...");
                                try {
                                    loginWithRedirect();
                                } catch (error) {
                                    console.error("Login redirect failed:", error);
                                }
                            }}
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
