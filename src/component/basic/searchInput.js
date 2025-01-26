// components/SearchInput.js
import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton, Tooltip } from '@mui/material';
import { useRouter } from 'next/router';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';

// Stil Özelleştirmeleri için styled API kullanımı
const StyledTextField = styled(TextField)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.dark,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.dark,
    },
  },
}));

const SearchInput = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const handleSearch = () => {
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm) {
      // Arama terimini URL'e ekleyerek arama sayfasına yönlendir
      router.push(`/search?s=${encodeURIComponent(trimmedSearchTerm)}`);
    } else {
      // Hata mesajı göster
      setError('Lütfen aramak istediğiniz terimi giriniz.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <StyledTextField
      variant="outlined"
      label={error? error:"Ara"}
      size="small"
      fullWidth
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        if (error) setError('');
      }}
      onKeyDown={handleKeyDown}
      aria-label="Arama Yap"
      error={!!error}
      // helperText={error}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Tooltip title="Ara">
              <IconButton
                onClick={handleSearch}
                size="small"
                aria-label="Ara"
                edge="end"
              >
                <SearchIcon />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchInput;
