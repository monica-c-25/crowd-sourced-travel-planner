import React from "react";
import './SearchBar.css'
import 'font-awesome/css/font-awesome.min.css';

const SearchBar = () => {
  return (
    <div className="search-container">
      {/* The search input with filter icon inside */}
      <div className="search-input-container">
        <i className="fa fa-bars filter-icon"></i> {/* Filter (hamburger) icon inside */}
        <input type="text" placeholder="Search..." className="search-input" />
        <i className="fa fa-search search-icon"></i> {/* Search icon on the right */}
      </div>
    </div>
  );
};

export default SearchBar;