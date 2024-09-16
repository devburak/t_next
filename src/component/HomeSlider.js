// components/HomeSlider.js
import React from 'react';
import Carousel from 'react-material-ui-carousel';
import { Card, CardMedia, CardContent, Typography, Box, Grid } from '@mui/material';
import Link from 'next/link';

const HomeSlider = ({ slides = [] }) => {

  return (
    <Carousel
      height="360px"
      // navButtonsAlwaysVisible={true} // Kaydırma düğmelerinin her zaman görünür olmasını sağlar
      indicators={true} // Alt noktalı göstergeler
      animation="slide" // Slayt animasyonu
      duration={500} // Animasyon süresi
    >
      {slides.map((slide) => (
        <Link href={slide.slug} passHref key={slide.title} legacyBehavior>
          <a style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card sx={{ display: 'flex', alignItems: 'center', maxWidth: '980px', maxHeight: '500px', margin: '0 auto' }}>
              <Grid container>
                {/* Resim bölümü */}
                <Grid item xs={12} sm={6}>
                  <CardMedia
                    component="img"
                    image={slide.featuredMedia.url}
                    alt={slide.title}
                    sx={{ maxHeight: '380px', objectFit: 'cover' }}
                  />
                </Grid>

                {/* Metin bölümü */}
                <Grid item xs={12} sm={6}>
                  <CardContent>
                    <Typography variant="h6" sx={{fontWeight:600 }} gutterBottom>
                      {slide.title}
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '14px'}}>
                      {slide.spot}
                    </Typography>
                  </CardContent>
                </Grid>
              </Grid>
            </Card>
          </a>
        </Link>
      ))}
    </Carousel>
  );
};

export default HomeSlider;
