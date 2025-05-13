const VideoPlayer = ({ video }) => {
  if (video.provider === 'youtube') {
    return (
      <iframe
        width="400"
        height="265"
        src={`https://www.youtube.com/embed/${video.videoId}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    );
  } else {
    return (
      <div dangerouslySetInnerHTML={{ __html: video.embedCode }} />
    );
  }
};

export default VideoPlayer;
