// components/VideoCarousel.js
import * as React from 'react';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import VideoCard from './VideoCard';
import VideoPlayer from '../VideoPlayer';
import { videoThumbnail } from '../../lib/video.mjs';
import { DEFAULT_OG_IMAGE } from '../../lib/seo';
import CardCarouselFrame, { CAROUSEL_ITEM_HEIGHT } from '../basic/CardCarouselFrame';

const Carousel = dynamic(() => import('react-material-ui-carousel'), { ssr: false });

export default function VideoCarousel({
  limit = 3,
  initialVideos = null,
  deferCarousel = false,
  disableCarousel = false,
}) {
  const hasInitialVideos = Array.isArray(initialVideos);
  const [videoData, setVideoData] = useState(hasInitialVideos ? initialVideos : []);
  const [loading, setLoading] = useState(!hasInitialVideos);
  const [open, setOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [carouselReady, setCarouselReady] = useState(!(deferCarousel || disableCarousel));

  useEffect(() => {
    if (hasInitialVideos) {
      return undefined;
    }

    const controller = new AbortController();

    async function fetchData() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/videos?limit=${limit}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Video API error: ${response.status}`);
        }
        const data = await response.json();

        if (controller.signal.aborted) {
          return;
        }

        setVideoData(data.videos || []);
        setLoading(false);
      } catch (error) {
        if (error?.name === 'AbortError') {
          return;
        }
        console.error("Video verisi çekilirken hata oluştu:", error);
        setLoading(false);
      }
    }
    fetchData();

    return () => {
      controller.abort();
    };
  }, [limit, hasInitialVideos]); 

  useEffect(() => {
    if (!deferCarousel || disableCarousel) {
      return undefined;
    }

    let timeoutId = null;
    let idleId = null;

    const markReady = () => setCarouselReady(true);

    if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(markReady, { timeout: 2000 });
    } else {
      timeoutId = setTimeout(markReady, 800);
    }

    return () => {
      if (idleId && typeof window !== 'undefined' && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [deferCarousel, disableCarousel]);

  if (loading) return (
    <CardCarouselFrame controls={!disableCarousel}>
      <Box role="status" aria-label="Videolar yükleniyor" sx={{ height: '100%', bgcolor: 'grey.100' }} />
    </CardCarouselFrame>
  );
  if (!videoData || videoData.length === 0)
    return <Typography>Video bulunamadı.</Typography>;

  const handleOpen = (video) => {
    setSelectedVideo(video);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedVideo(null);
  };

  const renderVideoEmbed = (video) => <VideoPlayer video={video} />;

  const renderVideoItem = (video, key) => (
    <Box key={key} sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <VideoCard
        image={videoThumbnail(video, DEFAULT_OG_IMAGE)}
        title={video.title}
        publishDate={video.createdAt}
        onClick={() => handleOpen(video)}
      />
    </Box>
  );

  const shouldRenderStatic = disableCarousel || !carouselReady;
  const firstVideo = videoData[0];

  return (
    <>
      <CardCarouselFrame controls={!disableCarousel}>
      {shouldRenderStatic ? (
        <Box sx={{ height: disableCarousel ? '100%' : CAROUSEL_ITEM_HEIGHT, overflow: 'hidden' }}>
          {firstVideo ? renderVideoItem(firstVideo, 'video-static') : null}
        </Box>
      ) : (
        <Carousel height={CAROUSEL_ITEM_HEIGHT} sx={{ height: '100%' }} navButtonsAlwaysVisible={false} autoPlay={false}>
          {videoData.map((video) => renderVideoItem(video, video._id || video.videoId))}
        </Carousel>
      )}
      </CardCarouselFrame>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ style: { background: "transparent", boxShadow: "none" } }}
      >
        <Box sx={{ p: 2, background: "#000" }}>
          {selectedVideo && renderVideoEmbed(selectedVideo)}
        </Box>
      </Dialog>
    </>
  );
}
