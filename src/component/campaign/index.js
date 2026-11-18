import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Dialog,
  DialogContent,
  IconButton,
  useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CampaignMedia from './CampaignMedia';
import PropTypes from 'prop-types';
import useCampaigns from './useCampaigns';

function Campaign({
  displayOnHome = false,
  displayOnDetail = false,
  pageType = 'all',
  placement = 'banner',
  layoutType = 'horizontal'
}) {
  const normalizedPageType = displayOnHome ? 'home' : displayOnDetail ? 'detail' : pageType;
  const { campaigns: filteredCampaigns, loading, error, popupCampaign: activePopup, dismissPopup: handlePopupClose } = useCampaigns({ pageType: normalizedPageType, placement });
  const isDesktopRail = useMediaQuery('(min-width:600px)');
  const imageSizes = placement === 'left_menu'
    ? '(max-width: 400px) calc(100vw - 40px), (max-width: 599.95px) calc(92vw - 8px), (max-width: 1000px) calc(23vw - 26px), (max-width: 1360px) calc(25vw - 46px), 294px'
    : '(max-width: 1000px) calc(100vw - 32px), (max-width: 1360px) calc(100vw - 80px), 1280px';
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          padding: 2
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

  if (!filteredCampaigns.length) {
    return null;
  }

  if (placement === 'popup') {
    if (!activePopup) return null;
    const popupMedia = activePopup.squareMedia?.url
      ? activePopup.squareMedia
      : activePopup.horizontalMedia;

    if (!popupMedia?.url) return null;

    return (
      <Dialog open onClose={handlePopupClose} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 1, position: 'relative' }}>
          <IconButton onClick={handlePopupClose} aria-label="Kampanya penceresini kapat"
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, bgcolor: 'rgba(255,255,255,.8)' }}>
            <CloseIcon />
          </IconButton>
          <Box sx={{ position: 'relative', width: '100%', height: { xs: 240, sm: 420 } }}>
            <CampaignMedia media={popupMedia} title={activePopup.title} link={activePopup.link}
              sizes="(max-width: 960px) calc(100vw - 80px), 880px" loading="eager" />
          </Box>
          {popupMedia.mediaType === 'video' && activePopup.link && <Button component="a" href={activePopup.link} target="_blank" rel="noopener noreferrer" sx={{ mt: 1 }}>Kampanyaya git</Button>}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      {filteredCampaigns.map((campaign, index) => {
        const preferred = layoutType === 'horizontal' ? campaign.horizontalMedia : campaign.squareMedia;
        const media = preferred?.url ? preferred : layoutType === 'horizontal' ? campaign.squareMedia : campaign.horizontalMedia;

        if (!media || !media.url) return null;

        // Only the first visible desktop rail images compete with the headline for LCP.
        const imageLoading = (placement === 'left_menu' && isDesktopRail && index < 2)
          || (placement === 'banner' && index === 0) ? 'eager' : 'lazy';

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
                paddingTop: layoutType === 'horizontal' ? (media.mediaType === 'video' ? { xs: '56.25%', sm: '25%' } : '25%') : '100%',
                minHeight: media.mediaType === 'video' ? 200 : undefined,
                overflow: 'hidden',
                borderRadius: 1
              }}
            >
              <CampaignMedia media={media} title={campaign.title} link={campaign.link} sizes={imageSizes}
                loading={imageLoading} fit={layoutType === 'horizontal' ? 'contain' : 'fill'} />
            </Box>
            {media.mediaType === 'video' && campaign.link && <Button component="a" href={campaign.link} target="_blank" rel="noopener noreferrer" sx={{ mt: 1 }}>Kampanyaya git</Button>}
          </Box>
        );
      })}
    </>
  );
}

Campaign.propTypes = {
  displayOnHome: PropTypes.bool,
  displayOnDetail: PropTypes.bool,
  pageType: PropTypes.oneOf(['home', 'all', 'detail']),
  placement: PropTypes.oneOf(['popup', 'banner', 'footer', 'left_menu']),
  layoutType: PropTypes.oneOf(['horizontal', 'square'])
};

export default Campaign;
