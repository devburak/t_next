import * as React from 'react';
import { useState, useEffect } from 'react';
import Carousel from 'react-material-ui-carousel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PublicationCard from './PublicationCard';
import useMediaQuery from '@mui/material/useMediaQuery';

export default function PublicationCarousel({
  page = 1,
  limit = 6,
  search = '',
  period = '',
  category = '',
  initialData = null,
  categorySlug = '',
  one = false,
}) {
  const [data, setData] = useState(initialData ? initialData.data : []);
  const [loading, setLoading] = useState(!initialData);

  // Ekran boyutuna göre limit ve görünüm ayarlama
  const matches = useMediaQuery('(max-width:600px)');
  const isMobile = one ? true : matches;
  const itemLimit = isMobile ? 3 : 6;

  useEffect(() => {
    if (initialData) return;
    async function fetchData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', itemLimit);
        if (search) params.append('search', search);
        if (period) params.append('period', period);
        if (category) params.append('category', category);
        if (categorySlug) params.append('categorySlug', categorySlug);

        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/publication?${params.toString()}`;
        const response = await fetch(url);
        const json = await response.json();
        setData(json.data || []);
      } catch (error) {
        console.error("Publication verisi çekilirken hata oluştu:", error);
        setData([]);
      }
      setLoading(false);
    }
    fetchData();
  }, [page, itemLimit, search, period, category, categorySlug, initialData]);

  if (loading) return <Typography>Yükleniyor...</Typography>;
  if (!data || data.length === 0) return <Typography>Hiç yayın bulunamadı.</Typography>;

  // Yayınları 3'erli gruplar halinde organize et
  const groupedPublications = [];
  for (let i = 0; i < data.length; i += 3) {
    groupedPublications.push(data.slice(i, i + 3));
  }

  return (
    <Box sx={{ width: '100%', padding: 1 }}>
      <Carousel navButtonsAlwaysVisible={true}>
        {isMobile
          ? data.map((publication, index) => (
              <Box key={publication._id} sx={{ display: 'flex', justifyContent: 'center' }}>
                <PublicationCard publication={publication} hideCategories />
              </Box>
            ))
          : groupedPublications.map((group, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                {group.map((publication, idx) => (
                  <PublicationCard key={publication._id} publication={publication} hideCategories />
                ))}
              </Box>
            ))}
      </Carousel>
    </Box>
  );
}