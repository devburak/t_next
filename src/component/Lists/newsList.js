import React, { useEffect, useState } from 'react';
import { Paper, Typography, Grid, Link } from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/tr'; // Türkçe dil paketini içe aktar

dayjs.locale('tr'); // Global olarak Türkçe'yi aktif dil olarak ayarla

function NewsList({ categoryId = "65bd78f86edf77b16ef450b1", exp = false ,vertical=false}) {
  const [newsItems, setNewsItems] = useState([]);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  const fetchNews = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/content/contents?categoryId=${categoryId}&limit=1`);
      if (!response.ok) { // Yanıt başarılı değilse (örneğin, 404 veya 500 durum kodları)
        throw new Error('Sunucu hatası!');
      }
      const data = await response.json();
      setNewsItems(data.docs);
    } catch (error) { // Hata yakalama
      console.error('Haberler yüklenirken bir hata oluştu:', error.message);
      // Hata mesajını kullanıcı arayüzünde göstermek için durumu ayarlayabilirsiniz
      // Örneğin: setError('Haberler yüklenemedi.');
    }
  };

  useEffect(() => {

    fetchNews();
  }, []);

  return (
    <Grid container spacing={2}>
      {newsItems.map((newsItem) => (
        <Grid item xs={12} key={newsItem._id}>
          <Paper elevation={2} sx={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'center', p: 2 }}>
            {newsItem.images[0] && (
              <img
                src={newsItem.images[0].thumbnailUrl}
                alt={newsItem.title}
                style={{ width: '80px', height: '80px', marginRight: vertical ? '0' : '16px', marginBottom: vertical ? '16px' : '0' }}
              />
            )}
            <div>
              <Link href={`/icerik/${newsItem.slug}`} color="inherit" underline="hover">
                <Typography variant="subtitle1" style={{ lineHeight: 1.3 }}>{newsItem.title}</Typography>
              </Link>
              <Typography variant="body2" color="textSecondary">
                {dayjs(newsItem.publishedDate).format('DD MMMM YYYY')}
              </Typography>
              {exp && (
                <Typography variant="body2" color="textSecondary" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {newsItem.summary}
                </Typography>
              )}
            </div>
          </Paper>
        </Grid>
      ))}

    </Grid>
  );
}

export default NewsList;
