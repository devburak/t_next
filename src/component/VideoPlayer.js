import { videoEmbedUrl } from '../lib/video.mjs';

const VideoPlayer = ({ video }) => {
  const src = videoEmbedUrl(video);
  if (!src) return <p>Video oynatılamıyor.</p>;
  return (
    <div style={{ width: '100%', aspectRatio: '16 / 9' }}>
      <iframe
        src={src}
        title={video.title || 'Video'}
        style={{ width: '100%', height: '100%', border: 0 }}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      />
    </div>
  );
};

export default VideoPlayer;
