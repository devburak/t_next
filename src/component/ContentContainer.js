import React from 'react';
import { Typography, Box } from '@mui/material';
import FeaturedImage from './basic/FeaturedImage';
import PublishDate from './basic/PublishDate';
import ContentShareBar from './basic/ContentShareBar';
import SpotText from './basic/SpotText';

function ContentContainer({
  title,
  featuredMedia,
  publishDate,
  spot,
  htmlContent,
  showPublishDate = true,
  shareUrl = '',
}) {
  const hasFeaturedImage = Boolean(featuredMedia?.url);

  return (
    <Box
      className="content-print-root"
      sx={{ maxWidth: '100%', overflow: 'hidden', padding: 2, backgroundColor: '#fff' }}
    >
      <Typography
        className="content-print-title"
        component="h1"
        style={{fontWeight:600, fontSize:'1.3rem' , margin:"10px 0",lineHeight:"30px"}}
      >
        {title}
      </Typography>
      {!hasFeaturedImage ? <ContentShareBar title={title} url={shareUrl} /> : null}
      <Box className="content-print-featured">
        <FeaturedImage url={featuredMedia?.url} alt={title} />
      </Box>
      {hasFeaturedImage ? <ContentShareBar title={title} url={shareUrl} /> : null}
      {showPublishDate ? <Box className="content-print-date"><PublishDate date={publishDate} /></Box> : null}
      <Box className="content-print-spot">
        <SpotText text={spot} />
      </Box>
      <Box className="content-print-body" sx={{ overflowX: 'auto', paddingTop: 2 }}>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </Box>
    </Box>
  );
}

export default ContentContainer;
