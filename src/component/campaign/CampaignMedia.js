import React from 'react';
import { Box } from '@mui/material';
import Image from 'next/image';
import { parseCampaignVideoUrl } from '../../lib/campaignVideo.cjs';

function CampaignVideo({ media, title }) {
  const video = parseCampaignVideoUrl(media.url);
  const nativeVideo = !video && media.mediaId && /^https:\/\//i.test(media.url);
  if (!video && !nativeVideo) return null;
  const provider = video ? video.provider === 'youtube' ? 'YouTube' : 'Vimeo' : 'Video';
  return (
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#0f172a', color: 'white' }}>
      {video ? (
        <iframe
          src={video.embedUrl}
          title={title || `${provider} videosu`}
          loading="lazy"
          allow="encrypted-media; fullscreen; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          style={{ width: '100%', height: '100%', border: 0 }}
        />
      ) : (
        <video src={media.url} title={title} controls playsInline preload="none" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      )}
    </Box>
  );
}

export default function CampaignMedia({ media, title = '', link = '', sizes = '100vw', loading = 'lazy', fit = 'contain' }) {
  if (!media?.url) return null;
  if (media.mediaType === 'video') return <CampaignVideo key={media.url} media={media} title={title} />;
  const image = <Image src={media.url} alt={title} fill quality={90} sizes={sizes} loading={loading} style={{ objectFit: fit }} />;
  return link ? <a href={link} target="_blank" rel="noopener noreferrer" style={{ position: 'absolute', inset: 0 }}>{image}</a> : image;
}
