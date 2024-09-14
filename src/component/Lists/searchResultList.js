import React, { useEffect, useState } from 'react';
import { Paper, Typography,  Grid, Link, Pagination  } from '@mui/material';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

function SearchResults({  page,exp = true ,vertical=false }) {
    const [searchResults, setSearchResults] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
  
  const router = useRouter();
  const { s } = router.query; // URL'den 's' parametresini (arama terimini) al

  useEffect(() => {
    if (!s) return; // Arama terimi yoksa, istek yapma

    const fetchSearchResults = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/content/search?searchTerm=${encodeURIComponent(s)}&page=${page}`);
        if (!response.ok) throw new Error('Sunucu hatası!');
        const data = await response.json();
        setSearchResults(data.docs);
      } catch (error) {
        console.error('Arama sonuçları yüklenirken bir hata oluştu:', error);
      }
    };

    fetchSearchResults();
  }, [s,page]);


const handlePageChange = (event, value) => {
  router.push({
    pathname: '/search',
    query: { s: searchTerm, page: value },
  });
};
  return (
    <Grid container spacing={2}>
        <Grid item xs={12}>
            <h2>Arama Sonucu : {s}</h2>
        </Grid>
      {searchResults.map((item) => (
       
        <Grid item xs={12} key={item._id}>
          <Paper elevation={2} sx={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'center', p: 2 }}>
            {item.images[0] && (
              <img
                src={item.images[0].thumbnailUrl}
                alt={item.title}
                style={{ width: '80px', height: '80px', marginRight: vertical ? '0' : '16px', marginBottom: vertical ? '16px' : '0' }}
              />
            )}
            <div>
              <Link href={`/icerik/${item.slug}`} color="inherit" underline="hover">
                <Typography variant="subtitle1" style={{ lineHeight: 1.3 }}>{item.title}</Typography>
              </Link>
              <Typography variant="body2" color="textSecondary">
                {dayjs(item.publishedDate).format('DD MMMM YYYY')}
              </Typography>
              {exp && (
                <Typography variant="body2" color="textSecondary" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.summary} ...
                </Typography>
              )}
            </div>
          </Paper>
        </Grid>
  
      ))}
       <Pagination count={totalPages} page={page} onChange={handlePageChange} />
    </Grid>
  );
}

export default SearchResults;
