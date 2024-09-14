// components/HomeSlider.js
import React from 'react';
import Slider from 'react-slick';
import { Card, CardMedia, CardContent, Typography, Box, Grid } from '@mui/material';
import Link from 'next/link';

const HomeSlider = ({ slides=[] }) => {

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  return (
    <Slider {...settings}>
      {slides.map((slide) => (
        <Link href={slide.slug} passHref key={slide.title} legacyBehavior>
          <a style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card sx={{ display: 'flex', alignItems: 'center', maxWidth: '980px',maxHeight: '500px', margin: '0 auto' }}>
              <Grid container>
                {/* Resim bölümü */}
                <Grid item xs={12} sm={6}>
                  <CardMedia
                    component="img"
                    image={slide.featuredMedia.url}
                    alt={slide.title}
                    sx={{ maxHeight: '400px', objectFit: 'cover' }}
                  />
                </Grid>
                
                {/* Metin bölümü */}
                <Grid item xs={12} sm={6}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {slide.title}
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '14px' }}>
                      {slide.spot}
                    </Typography>
                  </CardContent>
                </Grid>
              </Grid>
            </Card>
          </a>
        </Link>
      ))}
    </Slider>
  );
};

export default HomeSlider;
