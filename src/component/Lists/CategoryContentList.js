import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import Link from 'next/link';
import AspectRatioMedia, { getMediaUrl } from '../basic/AspectRatioMedia';

const CategoryContentList = ({ category, limit }) => {
  const [contents, setContents] = useState([]);
  const leadContent = contents[0];
  const leadMediaUrl = getMediaUrl(leadContent?.featuredMedia, { preferThumbnail: true }) || getMediaUrl(leadContent?.featuredMedia);

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
          <Card sx={{ display: 'flex', marginBottom: 2, overflow: 'hidden' }}>
            <Grid container alignItems="stretch">
            
              {leadMediaUrl && (
                <Grid item xs={12} sm={4}>
                  <AspectRatioMedia
                    src={leadMediaUrl}
                    alt={leadContent.title}
                    sizes="(max-width: 600px) 100vw, 33vw"
                    sx={{
                      minHeight: {
                        xs: 200,
                        sm: 140,
                      },
                    }}
                  />
                </Grid>
              )}
          
              <Grid item xs={12} sm={leadMediaUrl ? 8 : 12}>
                <CardContent>
                  <Link href={`/${leadContent.slug}`} passHref>
                    <Typography variant="h6"  sx={{ textDecoration: 'none', color: 'inherit', fontSize:12, fontWeight:600}}>
                      {leadContent.title}
                    </Typography>
                  </Link>
                  {/* Diğer İçerikler Başlık Olarak */}
                 
                </CardContent>
              </Grid>
             
                    {contents.slice(1).map((content,i) => (
                      <Grid key={i + (content?.slug || 'cont')} item xs={12} sm={12} sx={{marginTop:2}}>
                        <CardContent key={content.slug} sx={{padding:'4px'}}>
                            <Link href={`/${content.slug}`} passHref>
                              <Typography variant="h6" 
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
