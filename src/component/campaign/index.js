// components/Campaign.js

import React, { useContext } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import Image from 'next/image';
import PropTypes from 'prop-types';
import { CampaignContext } from './CampaignContext';

function Campaign({
  displayOnHome = false,
  displayOnDetail = false,
  layoutType = 'horizontal', // 'horizontal' or 'square'
}) {
  const { campaigns, loading, error } = useContext(CampaignContext);

  // Filter campaigns based on props
  const filteredCampaigns = campaigns.filter((campaign) => {
    if (displayOnHome && !campaign.displayOnHome) return false;
    if (displayOnDetail && !campaign.displayOnDetail) return false;
    return true;
  });

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          padding: 2,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', color: 'error.main', padding: 2 }}>
        <Typography variant="h6">Error loading campaigns.</Typography>
      </Box>
    );
  }

  if (filteredCampaigns.length === 0) {
    return null; // Do not render anything if no campaigns match the criteria
  }

  return (
    <>
      {filteredCampaigns.map((campaign) => {
        // Select media based on layoutType
        const media = layoutType === 'horizontal' ? campaign.horizontalMedia : campaign.squareMedia;

        if (!media || !media.url) return null; // Skip if media is missing

        const isImage = media.mediaType === 'image';

        // Dynamically set the sizes attribute based on layoutType
        const imageSizes =
          layoutType === 'horizontal' ? '100vw' : '100vw'; // Both layouts use full width

        return (
          <Box key={campaign._id} sx={{ mb: 2, width: '100%' }}>
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: layoutType === 'horizontal' ? 'row' : 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                // Use padding-top to maintain aspect ratio
                // For horizontal: approximate 4:1 aspect ratio
                // For square: 1:1 aspect ratio
                paddingTop: layoutType === 'horizontal' ? '25%' : '100%',
                overflow: 'hidden',
                borderRadius: 1,
              }}
            >
              {campaign.link ? (
                <a
                  href={campaign.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                >
                  {isImage ? (
                    <Image
                      src={media.url}
                      alt={campaign.title}
                      layout="fill"
                      objectFit={layoutType === 'horizontal' ? 'contain' : 'fill'}
                      sizes={imageSizes}
                    />
                  ) : (
                    <iframe
                      src={media.url}
                      title={campaign.title}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      style={{ width: '100%', height: '100%', border: 'none' }}
                    />
                  )}
                </a>
              ) : isImage ? (
                <Image
                  src={media.url}
                  alt={campaign.title}
                  layout="fill"
                  objectFit={layoutType === 'horizontal' ? 'contain' : 'fill'}
                  sizes={imageSizes}
                />
              ) : (
                <iframe
                  src={media.url}
                  title={campaign.title}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              )}
            </Box>
          </Box>
        );
      })}
    </>
  );
}

Campaign.propTypes = {
  displayOnHome: PropTypes.bool,
  displayOnDetail: PropTypes.bool,
  layoutType: PropTypes.oneOf(['horizontal', 'square']),
};

export default Campaign;
