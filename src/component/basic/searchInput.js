import { useState } from 'react';
import { TextField, Button, InputAdornment , IconButton} from '@mui/material';
import { useRouter } from 'next/router';
import SearchIcon from '@mui/icons-material/Search';

function SearchInput() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    // Arama terimini URL'e ekleyerek arama sayfasına yönlendir
    if(searchTerm)
    router.push(`/search?s=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div>
      <TextField
        variant="outlined"
        label="Ara"
        size="small"
        fullWidth={true}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} size="small">
                  <SearchIcon /> {/* Arama ikonunu kullan */}
                </IconButton>
              </InputAdornment>
            ),
          }}
      />
    </div>
  );
}

export default SearchInput;