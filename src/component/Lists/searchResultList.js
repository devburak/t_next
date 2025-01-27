import React, { useEffect, useState } from 'react';
import { Grid, Pagination } from '@mui/material';
import { useRouter } from 'next/router';
import ContentListItem from '../ContentListItem';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

function SearchResults({ page, exp = true, vertical = false }) {
  const [searchResults, setSearchResults] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

  const router = useRouter();
  const { s } = router.query; // URL'den 's' parametresini al
  const currentPage = parseInt(router.query.page) || page || 1; // Mevcut sayfayı belirle

  useEffect(() => {
    if (!s) return; // Arama terimi yoksa istek yapma

    const fetchSearchResults = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/contents/search?searchTerm=${encodeURIComponent(s)}&page=${currentPage}`);
        if (!response.ok) throw new Error('Sunucu hatası!');
        const data = await response.json();
        console.log("data", data);
        setSearchResults(data.contents || []);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Arama sonuçları yüklenirken bir hata oluştu:', error);
      }
    };

    fetchSearchResults();
  }, [s, currentPage]);

  const handlePageChange = (event, value) => {
    router.push({
      pathname: '/search',
      query: { s, page: value }, // Arama terimi ve yeni sayfa numarası
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <h2>Arama Sonucu : {s}</h2>
      </Grid>
      {searchResults.map((item) => (
        <ContentListItem
          key={item.slug}
          title={item.title}
          publishDate={item.publishDate}
          featuredMedia={item.featuredMedia}
          spot={item.spot}
          link={`/${item.slug}`}
        />
      ))}
      <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} />
    </Grid>
  );
}

export default SearchResults;
