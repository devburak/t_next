import React from 'react';
import Link from 'next/link'; // Link bileşenini import edin
import { Box, Typography, Divider } from '@mui/material';
import NewsList from './newsList'; // NewsList bileşenini import ettiğinizden emin olun
import CategoryContentList from './CategoryContentList';

function NewsSection({ categories }) {
  return (
    <div>
      {categories.map((category) => (
        <Box key={category.id} mb={1}>
          {/* Link bileşeni ile kategori başlığını slug ile linkleyin */}
          <Link href={'/kategori'+category.slug} passHref>
            <Typography variant="h6" sx={{textDecoration: 'none', color: 'primary.main', cursor: 'pointer' }}>
              {category.title}
            </Typography>
          </Link>
          <Divider sx={{ m: 1 }} />

          {/* Her kategori için NewsList bileşenini render edin ve categoryId prop'una kategorinin ID'sini verin */}
          {/* <NewsList categoryId={category.id} /> */}
          <CategoryContentList category={category.slug} limit={2} />
        </Box>
      ))}
    </div>
  );
}

export default NewsSection;
