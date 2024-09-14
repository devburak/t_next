import React, { useState } from 'react';
import { Grid,TextField,InputLabel,MenuItem,FormControl,Select } from '@mui/material'

const SearchComponent = ({ onSearch }) => {
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState('all');

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    onSearch(e.target.value, category);
  };

  const handleCategoryChange = (e) => {
    console.log(e.target.value)
    setCategory(e.target.value);
    onSearch(searchText, e.target.value);
  };

  return (
      <Grid container spacing={2} sx={{mb:4}}>
          <Grid item xs={12} sm={8}>
              <TextField size='small' fullWidth label="Search" variant="outlined" value={searchText} onChange={handleSearchChange} />
          </Grid>
          <Grid item xs={6} sm={4} >
              <FormControl fullWidth size="small">
                  <InputLabel id="demo-select-small-label">Kategori</InputLabel>
                  <Select
                      labelId="demo-select-small-label"
                      id='category'
                      label="kategori"
                      onChange={(e)=>handleCategoryChange(e)}
                  >
                      <MenuItem value="all">Hepsi</MenuItem>
                      <MenuItem value="Kent Suçları">Kent Suçları</MenuItem>
                      <MenuItem value="Eko Kırım">Eko Kırım</MenuItem>
                      <MenuItem value="TMMOB Davaları">TMMOB Davaları</MenuItem>
                  </Select>
              </FormControl>
          </Grid>

      </Grid>
  );
};

export default SearchComponent;