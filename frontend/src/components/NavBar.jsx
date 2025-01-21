import React from "react";
import { Link } from "react-router-dom";
import "../components/NavBar.css"

const NavBar = () => {
    return (
        <nav className="navigation">
            <h1 className="brand">
                <img src="/images/logo.jpg" alt="an owl logo"/>
                OwlWays Travel
            </h1>
            <ul className="navLinks">
            <li>
                    <Link to="/" className="link">Explore</Link>
                </li>
                <li>
                    <Link to="/about" className="link">About Us</Link>
                </li>
                <li>
                    <Link to="/signIn" id="signIn" className="link">Sign-In</Link>
                </li>
            </ul>
        </nav>
    );
};

export default NavBar;