import React, {useState} from "react";
import './SearchBar.css'
import 'font-awesome/css/font-awesome.min.css';

export function SearchBar() {

  const [searchInput, setSearchInput] = useState('');
  const [resultantInputs, setResultantInputs] = useState({});

  // For API Call
  // useEffect(() )
  const grabSearchResults = () => {
    // TODO
      console.log(searchInput)
  }

  return (
    <div className="search-container">
      {/* The search input with filter icon inside */}
      <div className="search-input-container">
        <i className="fa fa-bars filter-icon"></i> {/* Filter (hamburger) icon inside */}
        <input type="text" placeholder="Search..." className="search-input" 
          onChange={(e) => {setSearchInput(e.target.value)}} 
          value={searchInput}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              grabSearchResults();
            }}/>
        <i className="fa fa-search search-icon" onClick={grabSearchResults}></i> {/* Search icon on the right */}
      </div>
    </div>
  );
};

export default SearchBar;