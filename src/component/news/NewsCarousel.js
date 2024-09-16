// components/NewsCarousel.js
import * as React from 'react';
import { useState, useEffect } from 'react';
import Carousel from 'react-material-ui-carousel'; // MUI Karusel kütüphanesi
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import NewsCard from './NewsCard';
import useMediaQuery from '@mui/material/useMediaQuery'; // Medya sorgusu için MUI kancası

export default function NewsCarousel({ categorySlug , one=false }) {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ekran boyutuna göre limit ayarlaması
  const isMobile = one ? true: useMediaQuery('(max-width:600px)');
  const newsLimit = isMobile ? 3 : 6; // Mobilde 3, geniş ekranlarda 6 haber çek

  // Veriyi API'den çekme işlemi
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/contents/category/${categorySlug}?limit=${newsLimit}`);
        const data = await response.json();

        // İçerikleri belirli bir formata dönüştürme
        const formattedData = data.contents.map((content) => ({
          image: content.featuredMedia.url,
          title: content.title,
          url: `/${content.slug}`, // Link yönlendirme için
          publishDate: content.publishDate
        }));

        setNewsData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Veri çekilirken bir hata oluştu:", error);
        setLoading(false);
      }
    }

    fetchData();
  }, [categorySlug, newsLimit]);

  if (loading) {
    return <Typography>Yükleniyor...</Typography>; // Yüklenme durumu
  }

  if (newsData.length === 0) {
    return <Typography>Bu kategoride haber bulunmamaktadır.</Typography>; // Eğer veri yoksa
  }

  // Haberleri ikili gruplar halinde organize et
  const groupedNews = [];
  for (let i = 0; i < newsData.length; i += 3) {
    groupedNews.push(newsData.slice(i, i + 3));
  }

  return (
    <Box sx={{ width: '100%', padding: 1 }}>
      <Carousel navButtonsAlwaysVisible={true}>
        {/* Geniş ekranda her kaydırma için iki haber, dar ekranda her kaydırma için bir haber */}
        {isMobile
          ? newsData.map((news, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                <NewsCard {...news} />
              </Box>
            ))
          : groupedNews.map((group, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                {group.map((news, idx) => (
                  <NewsCard key={idx} {...news} />
                ))}
              </Box>
            ))}
      </Carousel>
    </Box>
  );
}
