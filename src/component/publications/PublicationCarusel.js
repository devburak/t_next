import * as React from 'react';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PublicationCard from './PublicationCard';
import useMediaQuery from '@mui/material/useMediaQuery';

const Carousel = dynamic(() => import('react-material-ui-carousel'), { ssr: false });

export default function PublicationCarousel({
  page = 1,
  limit = 6,
  search = '',
  period = '',
  category = '',
  initialData = null,
  categorySlug = '',
  one = false,
  deferCarousel = false,
}) {
  const [data, setData] = useState(initialData ? initialData.data : []);
  const [loading, setLoading] = useState(!initialData);
  const [carouselReady, setCarouselReady] = useState(!deferCarousel);

  // Ekran boyutuna göre limit ve görünüm ayarlama
  const matches = useMediaQuery('(max-width:600px)');
  const isMobile = one ? true : matches;
  const itemLimit = isMobile ? 3 : 6;

  useEffect(() => {
    if (initialData) return;
    const controller = new AbortController();

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
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Publication API error: ${response.status}`);
        }
        const json = await response.json();
        if (controller.signal.aborted) {
          return;
        }
        setData(json.data || []);
      } catch (error) {
        if (error?.name === 'AbortError') {
          return;
        }
        console.error("Publication verisi çekilirken hata oluştu:", error);
        setData([]);
      }

      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
    fetchData();

    return () => {
      controller.abort();
    };
  }, [page, itemLimit, search, period, category, categorySlug, initialData]);

  useEffect(() => {
    if (!deferCarousel) {
      return undefined;
    }

    let timeoutId = null;
    let idleId = null;

    const markReady = () => setCarouselReady(true);

    if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(markReady, { timeout: 2000 });
    } else {
      timeoutId = setTimeout(markReady, 800);
    }

    return () => {
      if (idleId && typeof window !== 'undefined' && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [deferCarousel]);

  if (loading) return <Typography>Yükleniyor...</Typography>;
  if (!data || data.length === 0) return <Typography>Hiç yayın bulunamadı.</Typography>;

  // Yayınları 3'erli gruplar halinde organize et
  const groupedPublications = [];
  for (let i = 0; i < data.length; i += 3) {
    groupedPublications.push(data.slice(i, i + 3));
  }

  const renderPublicationGroup = (group, keyPrefix) => (
    <Box key={keyPrefix} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch', gap: 4 }}>
      {group.map((publication, idx) => (
        <Box key={`${keyPrefix}-${publication._id || idx}`} sx={{ display: 'flex', width: '100%', maxWidth: 345 }}>
          <PublicationCard publication={publication} hideCategories />
        </Box>
      ))}
    </Box>
  );

  if (!carouselReady) {
    const firstGroup = isMobile ? data.slice(0, 1) : (groupedPublications[0] || []);
    return (
      <Box sx={{ width: '100%', padding: 1 }}>
        {firstGroup.length > 0 ? renderPublicationGroup(firstGroup, 'publication-static') : null}
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', padding: 1 }}>
      <Carousel navButtonsAlwaysVisible={true}>
        {isMobile
          ? data.map((publication, index) => renderPublicationGroup([publication], `publication-mobile-${index}`))
          : groupedPublications.map((group, index) => renderPublicationGroup(group, `publication-${index}`))}
      </Carousel>
    </Box>
  );
}
