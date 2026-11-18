import React from 'react';
import { Box, Button } from '@mui/material';
import CampaignMedia from '../campaign/CampaignMedia';

export default function Campaign({ horizontal = true, link = '', media, title = '' }) {
  if (!media?.url) return null;
  return (
    <Box>
      <Box sx={{ position: 'relative', width: '100%', height: horizontal ? (media.mediaType === 'video' ? 200 : 150) : 500, overflow: 'hidden' }}>
        <CampaignMedia media={media} title={title} link={link} fit={horizontal ? 'contain' : 'fill'} />
      </Box>
      {media.mediaType === 'video' && link && <Button component="a" href={link} target="_blank" rel="noopener noreferrer" sx={{ mt: 1 }}>Kampanyaya git</Button>}
    </Box>
  );
}
