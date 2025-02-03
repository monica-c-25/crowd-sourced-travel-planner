import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import NavBar from './components/NavBar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import { AuthProvider, useAuth } from './context/AuthContext';

const App = () => {
    const { isAuthenticated, user, isLoading } = useAuth0();
    const { setUser, setIsAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated && user) {
            setUser(user);
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, [isAuthenticated, user, setUser, setIsAuthenticated]);

    if (isLoading) {
        return <div>Loading ...</div>;
    }

    return (
        <Router>
            <div className="container">
                <NavBar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                </Routes>
            </div>
            <Footer />
        </Router>
    );
};

export default () => (
    <AuthProvider>
        <App />
    </AuthProvider>
);