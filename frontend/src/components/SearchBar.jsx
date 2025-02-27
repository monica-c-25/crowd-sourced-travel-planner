import React, {useEffect, useState} from "react";
import './SearchBar.css'
import 'font-awesome/css/font-awesome.min.css';
import { FormControlLabel, RadioGroup, Radio } from '@mui/material';


export function SearchBar() {

  const [searchInput, setSearchInput] = useState('');
  const [resultantInputs, setResultantInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [keywordOrLocation, setKeywordOrLocation] = useState('keyword')

  // For API Call
  // useEffect(() )

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://127.0.0.1:8001/api/search", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',  
          },
          body: JSON.stringify({
            type: keywordOrLocation,
            input: searchInput
          })
        })
        const data = await response.json()

        if (data.message === "success") {
          setResultantInputs(data.data);
        }
      } catch (exception) {
        console.log(exception);
      }
    }

    if (searchInput !== '') fetchSearchResults();
  }, [searchInput])

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
      <RadioGroup
          row
          aria-labelledby="search-filter"
          defaultValue="Name"
          name="radio-buttons-group"
          onChange={(e) => setKeywordOrLocation(e.target.value)}
        >
          <FormControlLabel value="Name" control={<Radio />} label="Name"/>
          <FormControlLabel value="Location" control={<Radio />} label="Location"/>
        </RadioGroup>
    </div>
  );
};

export default SearchBar;