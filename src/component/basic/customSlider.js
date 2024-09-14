import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { Box, Typography, Paper } from '@mui/material';
import { useRouter } from 'next/router';

function CustomSlider({ categoryId="65bd799f6edf77b16ef450d3", limit=5 }) {
  const [slides, setSlides] = useState([]);
  const router = useRouter();
  const handleSlideClick = (slug) => {
    router.push(`/icerik/${slug}`);
  };
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/content/contents?categoryId=${categoryId}&limit=${limit}`);
        const data = await response.json();
        setSlides(data.docs);
      } catch (error) {
        console.error("Slider data fetching error: ", error);
      }
    };

    fetchSlides();
  }, [categoryId, limit]);

  const settings = {
    dots: true,
    lazyLoad: 'ondemand',
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: 1,
    arrows:false
  };

  return (
    <Slider {...settings}>
      {slides && slides.map((slide) => (
        <Paper key={slide._id} elevation={2} sx={{ padding: 1 }} onClick={() => handleSlideClick(slide.slug)}>
          <Box sx={{ position: 'relative', height: 470, overflow: 'hidden' }}>
            {slide.images && slide.images[0] && (
              <img src={slide.images[0].fileUrl} alt={slide.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            <Typography variant="h6" sx={{ position: 'absolute', bottom: 10, left: 10, color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '6px' }}>
              {slide.title}
            </Typography>
          </Box>
        </Paper>
      ))}
    </Slider>
  );
}

export default CustomSlider;
