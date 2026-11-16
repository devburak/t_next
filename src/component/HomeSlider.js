import React, { useState } from 'react';
import Carousel from 'react-material-ui-carousel';
import { Card, CardContent, Typography, Box, useMediaQuery } from '@mui/material';
import Link from 'next/link';
import AspectRatioMedia, { getMediaUrl } from './basic/AspectRatioMedia';
import { DEFAULT_OG_IMAGE } from '../lib/seo';

const CONTROLS_HEIGHT = 32;
const HomeSlider = ({ slides = [] }) => {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [activeIndex, setActiveIndex] = useState(0);
  const [visitedSlides, setVisitedSlides] = useState(() => new Set([0]));

  const handleChange = (index) => {
    setActiveIndex(index);
    setVisitedSlides((visited) => visited.has(index) ? visited : new Set([...visited, index]));
  };

  return (
    <Box
      data-home-slider
      role="region"
      aria-label="Ana sayfa manşetleri"
      aria-roledescription="slayt gösterisi"
      sx={{
        '--home-slider-height': { xs: '384px', sm: '280px', md: '320px' },
        height: `calc(var(--home-slider-height) + ${CONTROLS_HEIGHT}px)`,
        width: '100%',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      {slides.length === 0 ? (
        <Box role="status" sx={{ height: 'var(--home-slider-height)', display: 'grid', placeItems: 'center' }}>
          Gösterilecek manşet bulunmuyor.
        </Box>
      ) : (
        <Carousel
          // CSS reserves the complete frame before hydration and image loading.
          // Passing height also prevents the carousel's per-slide measurement from resizing it.
          height="var(--home-slider-height)"
          sx={{ height: '100%' }}
          indicators
          animation="slide"
          autoPlay={!reduceMotion}
          duration={reduceMotion ? 0 : 500}
          onChange={handleChange}
          navButtonsWrapperProps={{ style: { top: 0, height: 'var(--home-slider-height)' } }}
          indicatorContainerProps={{ style: { height: CONTROLS_HEIGHT, marginTop: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' } }}
        >
          {slides.map((slide, index) => (
            <Box
              component={Link}
              href={slide.slug || '/'}
              key={slide._id || `${slide.slug}-${index}`}
              aria-hidden={index !== activeIndex}
              tabIndex={index === activeIndex ? 0 : -1}
              sx={{
                display: 'block',
                height: '100%',
                minWidth: 0,
                color: 'inherit',
                textDecoration: 'none',
                '&:focus-visible': { outline: '2px solid var(--tmmob-red)', outlineOffset: '-2px' },
              }}
            >
              <Card sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
                gridTemplateRows: { xs: '240px minmax(0, 1fr)', sm: 'minmax(0, 1fr)' },
                height: '100%',
                minWidth: 0,
                overflow: 'hidden',
              }}>
                <Box data-home-slider-media sx={{ height: '100%', minWidth: 0, overflow: 'hidden', bgcolor: 'grey.100' }}>
                  {visitedSlides.has(index) && (
                    <AspectRatioMedia
                      src={getMediaUrl(slide?.featuredMedia) || DEFAULT_OG_IMAGE}
                      alt={slide.title}
                      imageProps={{ loading: 'lazy', decoding: 'async', 'data-home-slider-image': index === 0 ? 'true' : undefined }}
                      sizes="(max-width: 599px) 100vw, (max-width: 1359px) 38vw, 480px"
                      sx={{ height: '100%', aspectRatio: 'auto' }}
                      objectFit="contain"
                    />
                  )}
                </Box>
                <CardContent
                  sx={{
                    minWidth: 0,
                    minHeight: 0,
                    height: '100%',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '4px',
                    p: { xs: 1, sm: 1.5, md: 2 },
                    '&:last-child': { pb: { xs: 1, sm: 1.5, md: 2 } },
                  }}
                >
                  <Box
                    data-home-slider-caption
                    sx={{
                      // Clamp the text flow as a whole: the complete title comes first,
                      // and the summary uses only the lines that remain.
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: { xs: 6, sm: 10, md: 10 },
                      maxHeight: '100%',
                      overflow: 'hidden',
                      overflowWrap: 'anywhere',
                      lineHeight: { xs: '20px', sm: '24px', md: '28px' },
                    }}
                  >
                    <Typography
                      component="h2"
                      variant="h6"
                      sx={{
                        m: 0,
                        p: 0,
                        // Override the legacy global h2!important rule within this slider only.
                        fontSize: { xs: '16px !important', sm: '18px !important', md: '24px !important' },
                        lineHeight: 'inherit',
                      }}
                    >
                      {slide.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        m: 0,
                        mt: '4px',
                        p: 0,
                        fontSize: { xs: '14px', md: '16px' },
                        lineHeight: 'inherit',
                      }}
                    >
                      {slide.spot}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Carousel>
      )}
    </Box>
  );
};

export default HomeSlider;
