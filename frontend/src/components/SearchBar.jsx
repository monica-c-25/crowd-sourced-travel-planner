import React, { useEffect, useState } from "react";
import './SearchBar.css';
import 'font-awesome/css/font-awesome.min.css';
import { Autocomplete, TextField, Stack, Typography } from '@mui/material';
import { useNavigate } from "react-router-dom";

export function SearchBar() {

  const [searchInput, setSearchInput] = useState('');
  const [resultantInputs, setResultantInputs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8001/api/search", {
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

  const handleSelect = (selectedTitle) => {
    const selectedExperience = resultantInputs.find(exp => exp.title === selectedTitle);
    if (selectedExperience) {
      console.log("Selected Experience:", selectedExperience);
      navigate(`/experience-detail/${selectedExperience._id}`);
    }
  };

  return (
    <Stack>
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
        renderInput={(params) => <TextField {...params} label={"Find an Experience"} />}
        renderGroup={(params) => (
          <li key={params.key}>
            <Typography variant="subtitle2" className="location-heading">
              {params.group}
            </Typography>
            <ul style={{ paddingLeft: '0px' }}>{params.children}</ul>
          </li>
        )}
      />
    </Stack>
  );
}

export default SearchBar;