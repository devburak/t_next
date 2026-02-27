import React, { useContext, useMemo, useState, useEffect } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Dialog,
  DialogContent,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';
import PropTypes from 'prop-types';
import { CampaignContext } from './CampaignContext';

const getCampaignPages = (campaign) => {
  if (Array.isArray(campaign?.targetPages) && campaign.targetPages.length > 0) {
    return campaign.targetPages;
  }

  const fallback = [];
  if (campaign?.displayOnHome) fallback.push('home');
  if (campaign?.displayOnDetail) fallback.push('detail');
  return fallback;
};

const shouldDisplayOnPage = (campaign, pageType) => {
  const pages = getCampaignPages(campaign);
  if (!pages.length) return false;
  if (pages.includes('all')) return true;
  return pages.includes(pageType);
};

const canShowPopup = (campaign) => {
  if (typeof window === 'undefined') return false;
  const frequency = campaign?.popupFrequency || 'every_login';
  const key = `campaign_popup_${campaign._id}`;

  if (frequency === 'every_login') {
    return sessionStorage.getItem(key) !== 'shown';
  }

  if (frequency === 'daily') {
    const lastShownAt = Number(localStorage.getItem(key) || 0);
    const oneDayMs = 24 * 60 * 60 * 1000;
    return !lastShownAt || Date.now() - lastShownAt >= oneDayMs;
  }

  if (frequency === 'once') {
    return localStorage.getItem(key) !== 'shown';
  }

  return true;
};

const markPopupAsShown = (campaign) => {
  if (typeof window === 'undefined') return;
  const frequency = campaign?.popupFrequency || 'every_login';
  const key = `campaign_popup_${campaign._id}`;

  if (frequency === 'every_login') {
    sessionStorage.setItem(key, 'shown');
    return;
  }

  if (frequency === 'daily') {
    localStorage.setItem(key, String(Date.now()));
    return;
  }

  if (frequency === 'once') {
    localStorage.setItem(key, 'shown');
  }
};

function Campaign({
  displayOnHome = false,
  displayOnDetail = false,
  pageType = 'all',
  placement = 'banner',
  layoutType = 'horizontal'
}) {
  const { campaigns, loading, error } = useContext(CampaignContext);
  const [activePopup, setActivePopup] = useState(null);

  const normalizedPageType = useMemo(() => {
    if (displayOnHome) return 'home';
    if (displayOnDetail) return 'detail';
    return pageType;
  }, [displayOnHome, displayOnDetail, pageType]);

  const filteredCampaigns = useMemo(() => {
    return (campaigns || []).filter((campaign) => {
      if (!campaign?.isActive) return false;
      if (!shouldDisplayOnPage(campaign, normalizedPageType)) return false;
      if ((campaign?.placement || 'banner') !== placement) return false;
      return true;
    });
  }, [campaigns, normalizedPageType, placement]);

  useEffect(() => {
    if (placement !== 'popup') return;
    const popupCandidate = filteredCampaigns.find((campaign) => canShowPopup(campaign));
    if (popupCandidate) {
      setActivePopup(popupCandidate);
    } else {
      setActivePopup(null);
    }
  }, [filteredCampaigns, placement]);

  const handlePopupClose = () => {
    if (activePopup) {
      markPopupAsShown(activePopup);
    }
    setActivePopup(null);
  };

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

    const isImage = popupMedia.mediaType === 'image';

    return (
      <Dialog open onClose={handlePopupClose} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 1, position: 'relative' }}>
          <IconButton
            onClick={handlePopupClose}
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, bgcolor: 'rgba(255,255,255,.8)' }}
          >
            <CloseIcon />
          </IconButton>
          {activePopup.link ? (
            <a href={activePopup.link} target="_blank" rel="noopener noreferrer">
              {isImage ? (
                <Box sx={{ position: 'relative', width: '100%', height: { xs: 240, sm: 420 } }}>
                  <Image
                    src={popupMedia.url}
                    alt={activePopup.title}
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes="100vw"
                  />
                </Box>
              ) : (
                <iframe
                  src={popupMedia.url}
                  title={activePopup.title}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  style={{ width: '100%', height: 420, border: 'none' }}
                />
              )}
            </a>
          ) : isImage ? (
            <Box sx={{ position: 'relative', width: '100%', height: { xs: 240, sm: 420 } }}>
              <Image src={popupMedia.url} alt={activePopup.title} fill style={{ objectFit: 'contain' }} sizes="100vw" />
            </Box>
          ) : (
            <iframe
              src={popupMedia.url}
              title={activePopup.title}
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{ width: '100%', height: 420, border: 'none' }}
            />
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      {filteredCampaigns.map((campaign) => {
        const media = layoutType === 'horizontal' ? campaign.horizontalMedia : campaign.squareMedia;

        if (!media || !media.url) return null;

        const isImage = media.mediaType === 'image';

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
                paddingTop: layoutType === 'horizontal' ? '25%' : '100%',
                overflow: 'hidden',
                borderRadius: 1
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
                      fill
                      style={{ objectFit: layoutType === 'horizontal' ? 'contain' : 'fill' }}
                      sizes="100vw"
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
                  fill
                  style={{ objectFit: layoutType === 'horizontal' ? 'contain' : 'fill' }}
                  sizes="100vw"
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
  pageType: PropTypes.oneOf(['home', 'all', 'detail']),
  placement: PropTypes.oneOf(['popup', 'banner', 'footer', 'left_menu']),
  layoutType: PropTypes.oneOf(['horizontal', 'square'])
};

export default Campaign;
