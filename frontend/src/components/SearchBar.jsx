import React, { useEffect, useState } from "react";
import './SearchBar.css';
import 'font-awesome/css/font-awesome.min.css';
import { Autocomplete, TextField, Stack, Typography, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { Form, useNavigate } from "react-router-dom";

export function SearchBar() {

  const [searchInput, setSearchInput] = useState('');
  const [resultantInputs, setResultantInputs] = useState([]);
  const [locationInput, setLocationInput] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [keywordOrLocation, setKeywordOrLocation] = useState('title');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const response = await fetch("http://127.0.0.1:46725/api/search", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',  
          },
          body: JSON.stringify({
            type: 'title',
            input: searchInput
          })
        });
        const data = await response.json();
        if (data.message === "success") {
          setResultantInputs(data.data);
        }
      } catch (exception) {
        alert(`${exception} raised`);
      } 
    };

    if (searchInput !== '') fetchSearchResults();
    else setResultantInputs([]); 
  }, [searchInput]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8001/api/search", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',  
          },
          body: JSON.stringify({
            type: 'Location',
            input: locationInput
          })
        });
        const data = await response.json();
        if (data.message === "success") {
          let dupeData = new Set();
          for (const experience of data.data) {
            console.log(experience.location)
            if (!dupeData.has(experience)) {
              dupeData.add(experience.location);
            }
          }
          setLocationResults(Array.from(dupeData));
        }
      } catch (exception) {
        alert(`${exception} raised`);
      }
    };
    console.log(locationResults)
    if (locationInput !== '') fetchSearchResults();
    else setLocationResults([]);
  }, [locationInput])
  
  const handleSelect = (selectedTitle) => {
    const selectedExperience = resultantInputs.find(exp => exp.title === selectedTitle);
    if (selectedExperience) {
      console.log("Selected Experience:", selectedExperience);
      navigate(`/experience-detail/${selectedExperience._id}`);
    }
  };

  const handleLocationSelect = (location) =>{
    const selectedLocation = locationResults.find(loc => loc === location);
    if (selectedLocation) {
      navigate(`/select-experience/${selectedLocation}`)
    }
  }

  const handleChange = (event) => {
    setKeywordOrLocation(event.target.value)
    console.log(keywordOrLocation)
  }

  console.log(locationResults)
  return (
    <Stack>
      <RadioGroup
        value={keywordOrLocation}
        defaultValue="title"  
        onChange={handleChange}
      >
        <FormControlLabel value="title" label="Name" control={<Radio/>}/>
        <FormControlLabel value="location" label="Location" control={<Radio/>}/>
      </RadioGroup>
      {
        keywordOrLocation === 'title' ? 
        <Autocomplete
        inputValue={searchInput}
        onInputChange={(event, newValue) => setSearchInput(newValue)}
        groupBy={(experience) => experience?.location || "Unknown Location"}
        getOptionLabel={(experience) => experience?.title  || ""}
        onChange={(event, selectedExperience) => {
          if (selectedExperience) {
            handleSelect(selectedExperience.title);
          }
        }}
        freeSolo
        id="search-box"
        disableClearable
        options={resultantInputs}
        renderInput={(params) => <TextField {...params} label={"Find an Experience by Name"} />}
        renderGroup={(params) => (
          <li key={params.key}>
            <Typography variant="subtitle2" className="location-heading">
              {params.group}
            </Typography>
            <ul style={{ paddingLeft: '0px' }}>{params.children}</ul>
          </li>
        )}
      />
        :
        <Autocomplete
        inputValue={locationInput}
        onInputChange={(event, newValue) => setLocationInput(newValue)}
        onChange={(event, location) => {
          if (location) {
            handleLocationSelect(location);
          }
        }}
        freeSolo
        id="search-box"
        disableClearable
        options={locationResults}
        renderInput={(params) => <TextField {...params} label={"Find an Experience by Location"} />}
        />
      }
    </Stack>
  );
}

export default SearchBar;