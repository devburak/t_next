import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import Image from 'next/image';
import { parseCampaignVideoUrl } from '../../lib/campaignVideo.cjs';

function CampaignVideo({ media, title }) {
  const [playing, setPlaying] = useState(false);
  const video = parseCampaignVideoUrl(media.url);
  const nativeVideo = !video && media.mediaId && /^https:\/\//i.test(media.url);
  if (!video && !nativeVideo) return null;
  const provider = video ? video.provider === 'youtube' ? 'YouTube' : 'Vimeo' : 'Video';
  const src = video ? new URL(video.embedUrl) : null;
  if (playing && src) src.searchParams.set('autoplay', '1');
  return (
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#0f172a', color: 'white' }}>
      {!playing ? (
        <Button
          aria-label={`${title || provider} videosunu oynat`}
          onClick={() => setPlaying(true)}
          sx={{ width: '100%', height: '100%', minHeight: 100, color: 'inherit', display: 'flex', flexDirection: 'column', gap: 1, p: 2, textTransform: 'none' }}
        >
          <PlayCircleOutlineIcon sx={{ fontSize: 48 }} />
          <Typography component="span" variant="body2">{provider} videosunu oynat</Typography>
          {title && <Typography component="span" variant="caption" sx={{ maxWidth: '100%' }}>{title}</Typography>}
        </Button>
      ) : video ? (
        <iframe
          src={src.href}
          title={title || `${provider} videosu`}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          style={{ width: '100%', height: '100%', border: 0 }}
        />
      ) : (
        <video src={media.url} title={title} controls autoPlay playsInline preload="none" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      )}
    </Box>
  );
}

export default function CampaignMedia({ media, title = '', link = '', sizes = '100vw', loading = 'lazy', fit = 'contain' }) {
  if (!media?.url) return null;
  if (media.mediaType === 'video') return <CampaignVideo key={media.url} media={media} title={title} />;
  const image = <Image src={media.url} alt={title} fill sizes={sizes} loading={loading} style={{ objectFit: fit }} />;
  return link ? <a href={link} target="_blank" rel="noopener noreferrer" style={{ position: 'absolute', inset: 0 }}>{image}</a> : image;
}
