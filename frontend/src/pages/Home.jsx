import React from "react";
import SearchBar from "../components/SearchBar";
import '../pages/Home.css'

const Home = () => {
    return (
        <>
        <div className="header">
            <h1>Your destination awaits.</h1>
        </div>
        <SearchBar />
        </>
    );
};

export default Home;