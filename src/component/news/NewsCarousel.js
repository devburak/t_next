// components/NewsCarousel.js
import * as React from 'react';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import NewsCard from './NewsCard';
import useMediaQuery from '@mui/material/useMediaQuery'; // Medya sorgusu için MUI kancası
import { getMediaUrl } from '../basic/AspectRatioMedia';
import CardCarouselFrame, { CAROUSEL_ITEM_HEIGHT, cardGroupSx } from '../basic/CardCarouselFrame';

const Carousel = dynamic(() => import('react-material-ui-carousel'), { ssr: false });

export default function NewsCarousel({
  categorySlug,
  one = false,
  itemsPerSlide = 3,
  initialNewsData = null,
  deferCarousel = false,
  disableCarousel = false,
  eagerImages = false,
}) {
  const hasInitialNewsData = Array.isArray(initialNewsData);
  const [newsData, setNewsData] = useState(hasInitialNewsData ? initialNewsData : []);
  const [loading, setLoading] = useState(!hasInitialNewsData);
  const [carouselReady, setCarouselReady] = useState(!(deferCarousel || disableCarousel));

  // Ekran boyutuna göre limit ayarlaması
  const matches = useMediaQuery('(max-width:599.95px)');
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
    if (!deferCarousel || disableCarousel) {
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
  }, [deferCarousel, disableCarousel]);

  if (loading) {
    return (
      <CardCarouselFrame columns={one ? 1 : itemsPerSlide} controls={!disableCarousel}>
        <Box role="status" aria-label="Haberler yükleniyor" sx={{ height: '100%', bgcolor: 'grey.100' }} />
      </CardCarouselFrame>
    );
  }

  if (newsData.length === 0) {
    return <Typography>Bu kategoride haber bulunmamaktadır.</Typography>; // Eğer veri yoksa
  }

  // Haberleri itemsPerSlide'a göre grupla
  const groupedNews = [];
  for (let i = 0; i < newsData.length; i += itemsPerSlide) {
    groupedNews.push(newsData.slice(i, i + itemsPerSlide));
  }

  const renderNewsGroup = (group, keyPrefix, isFirstGroup = false) => (
    <Box key={keyPrefix} sx={cardGroupSx(one ? 1 : itemsPerSlide)}>
      {group.map((news, idx) => (
        <Box key={`${keyPrefix}-${idx}`} sx={{ display: 'flex', width: '100%', maxWidth: 345, minWidth: 0 }}>
          <NewsCard {...news} eager={eagerImages && isFirstGroup} />
        </Box>
      ))}
    </Box>
  );

  const shouldRenderStatic = disableCarousel || !carouselReady;

  if (shouldRenderStatic) {
    const firstGroup = isMobile
      ? newsData.slice(0, 1)
      : groupedNews[0] || [];

    return (
      <CardCarouselFrame columns={one ? 1 : itemsPerSlide} controls={!disableCarousel}>
        <Box sx={{ height: disableCarousel ? '100%' : CAROUSEL_ITEM_HEIGHT, overflow: 'hidden' }}>
          {firstGroup.length > 0 ? renderNewsGroup(firstGroup, 'news-static', true) : null}
        </Box>
      </CardCarouselFrame>
    );
  }

  return (
    <CardCarouselFrame columns={one ? 1 : itemsPerSlide}>
      <Carousel height={CAROUSEL_ITEM_HEIGHT} sx={{ height: '100%' }} navButtonsAlwaysVisible={true}>
        {/* Geniş ekranda her kaydırma için itemsPerSlide haber, dar ekranda her kaydırma için bir haber */}
        {isMobile
          ? newsData.map((news, index) => renderNewsGroup([news], `news-mobile-${index}`, index === 0))
          : groupedNews.map((group, index) => renderNewsGroup(group, `news-${index}`, index === 0))}
      </Carousel>
    </CardCarouselFrame>
  );
}
