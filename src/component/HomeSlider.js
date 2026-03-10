// components/HomeSlider.js
import React from 'react';
import Head from 'next/head';
import Carousel from 'react-material-ui-carousel';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import Link from 'next/link';
import AspectRatioMedia, { getMediaUrl } from './basic/AspectRatioMedia';
import { DEFAULT_OG_IMAGE } from '../lib/seo';

const HomeSlider = ({ slides = [] }) => {
  const firstSlideImage = getMediaUrl(slides?.[0]?.featuredMedia) || DEFAULT_OG_IMAGE;

  return (
    <>
      <Head>
        <link rel="preload" as="image" href={firstSlideImage} />
      </Head>
      <Carousel
        // navButtonsAlwaysVisible={true} // Kaydırma düğmelerinin her zaman görünür olmasını sağlar
        indicators={true} // Alt noktalı göstergeler
        animation="slide" // Slayt animasyonu
        duration={500} // Animasyon süresi
      >
        {slides.map((slide, index) => (
          <Link href={slide.slug} passHref key={slide.title} legacyBehavior>
            <a style={{ textDecoration: 'none', color: 'inherit' }}>
              <Card sx={{
                display: 'flex',
                alignItems: 'center',
                margin: '0 auto',
                maxWidth: {
                  xs: '100%', // Mobilde tam genişlik
                  sm: '720px', // Tabletlerde 720px
                  md: '100%', // Bilgisayarlarda 980px
                },
                overflow: 'hidden',
              }}>
                <Grid container alignItems="stretch">
                  {/* Resim bölümü */}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ width: '100%' }}>
                      <AspectRatioMedia
                        src={getMediaUrl(slide?.featuredMedia) || DEFAULT_OG_IMAGE}
                        alt={slide.title}
                        priority={index === 0}
                        imageProps={index === 0 ? { fetchPriority: 'high' } : {}}
                        sizes="(max-width: 600px) 100vw, 50vw"
                        sx={{
                          minHeight: {
                            xs: 240,
                            sm: 280,
                            md: 320,
                          },
                        }}
                        objectFit="contain"
                      />
                    </Box>
                  </Grid>
                  {/* Metin bölümü */}
                  <Grid item xs={12} sm={6}>
                    <CardContent
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: {
                          xs: '4px', // Mobil cihazlarda daha az padding
                          sm: '8px', // Tabletlerde orta padding
                          md: '12px', // Bilgisayarlarda varsayılan padding
                        },
                        '& .MuiTypography-h6': {
                          fontSize: {
                            xs: '12px', // Mobil cihazlarda daha küçük başlık boyutu
                            sm: '14px', // Tabletlerde orta başlık boyutu
                            md: '28px', // Bilgisayarlarda varsayılan başlık boyutu
                          },
                        },
                        '& .MuiTypography-body1': {
                          fontSize: {
                            xs: '8px', // Mobil cihazlarda daha küçük metin boyutu
                            sm: '12px', // Tabletlerde orta metin boyutu
                            md: '16px', // Bilgisayarlarda varsayılan metin boyutu
                          },
                        },
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        {slide.title}
                      </Typography>
                      <Typography variant="body1">
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
    </>
  );
};

export default HomeSlider;
