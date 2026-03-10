// components/NewsCarousel.js
import * as React from 'react';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import NewsCard from './NewsCard';
import useMediaQuery from '@mui/material/useMediaQuery'; // Medya sorgusu için MUI kancası
import { getMediaUrl } from '../basic/AspectRatioMedia';

const Carousel = dynamic(() => import('react-material-ui-carousel'), { ssr: false });

export default function NewsCarousel({
  categorySlug,
  one = false,
  itemsPerSlide = 3,
  initialNewsData = null,
  deferCarousel = false,
}) {
  const hasInitialNewsData = Array.isArray(initialNewsData);
  const [newsData, setNewsData] = useState(hasInitialNewsData ? initialNewsData : []);
  const [loading, setLoading] = useState(!hasInitialNewsData);
  const [carouselReady, setCarouselReady] = useState(!deferCarousel);

  // Ekran boyutuna göre limit ayarlaması
  const matches = useMediaQuery('(max-width:600px)');
  const isMobile = one ? true : matches;
  // Mobilde itemsPerSlide kadar, geniş ekranlarda itemsPerSlide * 2 haber çek
  const newsLimit = isMobile ? itemsPerSlide : itemsPerSlide * 2;

  // Veriyi API'den çekme işlemi
  useEffect(() => {
    if (hasInitialNewsData) {
      return undefined;
    }

    const controller = new AbortController();

    async function fetchData() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/contents/category/${categorySlug}?limit=${newsLimit}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error(`News API error: ${response.status}`);
        }
        const data = await response.json();

        // İçerikleri belirli bir formata dönüştürme
        const formattedData = data.contents.map((content) => ({
          image: getMediaUrl(content.featuredMedia),
          title: content.title,
          url: `/${content.slug}`, // Link yönlendirme için
          publishDate: content.publishDate
        }));

        if (controller.signal.aborted) {
          return;
        }

        setNewsData(formattedData);
        setLoading(false);
      } catch (error) {
        if (error?.name === 'AbortError') {
          return;
        }
        console.error("Veri çekilirken bir hata oluştu:", error);
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      controller.abort();
    };
  }, [categorySlug, newsLimit, hasInitialNewsData]);

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

  if (loading) {
    return <Typography>Yükleniyor...</Typography>; // Yüklenme durumu
  }

  if (newsData.length === 0) {
    return <Typography>Bu kategoride haber bulunmamaktadır.</Typography>; // Eğer veri yoksa
  }

  // Haberleri itemsPerSlide'a göre grupla
  const groupedNews = [];
  for (let i = 0; i < newsData.length; i += itemsPerSlide) {
    groupedNews.push(newsData.slice(i, i + itemsPerSlide));
  }

  const renderNewsGroup = (group, keyPrefix) => (
    <Box key={keyPrefix} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch', gap: 4 }}>
      {group.map((news, idx) => (
        <Box key={`${keyPrefix}-${idx}`} sx={{ display: 'flex', width: '100%', maxWidth: 345 }}>
          <NewsCard {...news} />
        </Box>
      ))}
    </Box>
  );

  if (!carouselReady) {
    const firstGroup = isMobile
      ? newsData.slice(0, 1)
      : groupedNews[0] || [];

    return (
      <Box sx={{ width: '100%', padding: 1 }}>
        {firstGroup.length > 0 ? renderNewsGroup(firstGroup, 'news-static') : null}
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', padding: 1 }}>
      <Carousel navButtonsAlwaysVisible={true}>
        {/* Geniş ekranda her kaydırma için itemsPerSlide haber, dar ekranda her kaydırma için bir haber */}
        {isMobile
          ? newsData.map((news, index) => renderNewsGroup([news], `news-mobile-${index}`))
          : groupedNews.map((group, index) => renderNewsGroup(group, `news-${index}`))}
      </Carousel>
    </Box>
  );
}
