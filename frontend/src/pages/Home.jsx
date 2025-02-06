import React from "react";
import SearchBar from "../components/SearchBar";
import '../pages/Home.css'

const Home = () => {
    return (
        <>
        <div className="header">
            <h1>Your destination awaits.</h1>
        </div>
        <div className="image-container">
            <img 
                src="images/travel-background.jpg" 
                alt="Travel Background" 
                className="background-img" 
            />
            <div className="search-bar-wrapper">
                <SearchBar />
            </div>
        </div>
        </>
    );
};

export default Home;