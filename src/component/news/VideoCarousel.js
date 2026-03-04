// components/VideoCarousel.js
import * as React from 'react';
import { useState, useEffect } from 'react';
import Carousel from 'react-material-ui-carousel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Dialog from '@mui/material/Dialog';
import useMediaQuery from '@mui/material/useMediaQuery';
import VideoCard from './VideoCard';

export default function VideoCarousel({ limit = 3 }) {
  const [videoData, setVideoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const matches = useMediaQuery('(max-width:600px)');
  const isMobile = matches;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/videos?limit=${limit}`);
        const data = await response.json();

        setVideoData(data.videos || []);
        setLoading(false);
      } catch (error) {
        console.error("Video verisi çekilirken hata oluştu:", error);
        setLoading(false);
      }
    }
    fetchData();
  }, [limit]); 

  if (loading) return <Typography>Yükleniyor...</Typography>;
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

  const renderVideoEmbed = (video) => {
    if (video.provider === "youtube" && video.videoId) {
      return (
        <iframe
          width="100%"
          height="360"
          src={`https://www.youtube.com/embed/${video.videoId}`}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      );
    }
    return <Typography>Video oynatılamıyor</Typography>;
  };

  return (
    <Box sx={{ width: '100%', padding: 1 }}>
      <Carousel navButtonsAlwaysVisible={false} autoPlay={false}>
        

              {videoData.map((video) => (
                  <Box key={video._id} sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                      <VideoCard
                          image={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                          title={video.title}
                          publishDate={video.createdAt}
                          onClick={() => handleOpen(video)}
                      />
                  </Box>
              ))}
      </Carousel>

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
    </Box>
  );
}
