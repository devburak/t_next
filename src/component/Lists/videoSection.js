import React from 'react';
import Link from 'next/link'; // Link bileşenini import edin
import { Box, Typography, Divider } from '@mui/material';
import NewsList from './newsList'; // NewsList bileşenini import ettiğinizden emin olun

function VideoSection({ category }) {
  return (
    <div>
    
        <Box key={category.id} mb={1}>
          {/* Link bileşeni ile kategori başlığını slug ile linkleyin */}
          <Link href={category.path} passHref>
            <Typography variant="h6" sx={{textDecoration: 'none', color: 'primary.main', cursor: 'pointer' }}>
              {category.title}
            </Typography>
          </Link>
          <Divider sx={{ mb: 1 }} />

          {/* Her kategori için NewsList bileşenini render edin ve categoryId prop'una kategorinin ID'sini verin */}
          <NewsList categoryId={category.id} vertical={true} />
        </Box>
     
    </div>
  );
}

export default VideoSection;
