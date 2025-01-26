import React from 'react';
import { Typography, Box } from '@mui/material';
import FeaturedImage from './basic/FeaturedImage';
import PublishDate from './basic/PublishDate';
import SpotText from './basic/SpotText';

function ContentContainer({ title, featuredMedia, publishDate, spot, htmlContent }) {
  return (
    <Box sx={{ maxWidth: '100%', overflow: 'hidden', padding: 2 }}>
      <Typography  component="h1" style={{fontWeight:600, fontSize:'1.3rem' , margin:"10px 0",lineHeight:"30px"}}>{title}</Typography>
      <FeaturedImage url={featuredMedia?.url} alt={title} />
      <PublishDate date={publishDate} />
      <SpotText text={spot} />
      <Box sx={{ overflowX: 'auto', paddingTop: 2 }}>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </Box>
    </Box>
  );
}

export default ContentContainer;
