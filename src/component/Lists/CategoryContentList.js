import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Card, CardMedia, CardContent, Grid } from '@mui/material';
import Link from 'next/link';

const CategoryContentList = ({ category, limit }) => {
  const [contents, setContents] = useState([]);

  useEffect(() => {
    // İstemci tarafında veri çekme
    const fetchContents = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/contents/category/${category}?limit=${limit}`);
        if (!res.ok) {
          console.error('Sunucudan veri alınırken hata oluştu:', res.statusText);
          return;
        }
        const data = await res.json();
        setContents(data.contents || []);
      } catch (error) {
        console.error('Veri çekme hatası:', error.message);
      }
    };

    fetchContents();
  }, [category, limit]); // Kategori veya limit değiştiğinde veri çekmeyi yeniden başlat

  return (
    <Box>
      {contents.length > 0 && (
        <>
          {/* İlk İçerik Resimli */}
          <Card sx={{ display: 'flex', marginBottom: 2 }}>
            <Grid container>
            
              {contents[0].featuredMedia && (
                <Grid item xs={12} sm={4}>
                  <CardMedia
                    component="img"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover',  maxHeight:80 }}
                    image={
                      contents[0].featuredMedia.thumbnails && contents[0].featuredMedia.thumbnails[0]
                        ? contents[0].featuredMedia.thumbnails[0]
                        : contents[0].featuredMedia.url
                    }
                    alt={contents[0].title}
                  />
                </Grid>
              )}
          
              <Grid item xs={12} sm={8}>
                <CardContent>
                  <Link href={`/${contents[0].slug}`} passHref>
                    <Typography variant="h6" component="a" sx={{ textDecoration: 'none', color: 'inherit', fontSize:12, fontWeight:600}}>
                      {contents[0].title}
                    </Typography>
                  </Link>
                  {/* Diğer İçerikler Başlık Olarak */}
                 
                </CardContent>
              </Grid>
             
                    {contents.slice(1).map((content) => (
                      <Grid item xs={12} sm={12} sx={{marginTop:2}}>
                        <CardContent key={content.slug} sx={{padding:'4px'}}>
                            <Link href={`/${content.slug}`} passHref>
                              <Typography variant="h6" component="a"
                                sx={{ textDecoration: 'none', color: 'inherit', fontSize: 12 ,fontWeight:600}} // Font boyutunu ayarladık
                              >
                                 {content.title}
                                </Typography>
                            </Link>
                        </CardContent>
                      </Grid>
                    ))}
              
            </Grid>
          </Card>

          
        </>
      )}
    </Box>
  );
};

export default CategoryContentList;
