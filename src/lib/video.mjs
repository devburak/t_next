export function videoEmbedUrl(video) {
  const id = String(video?.videoId || '');
  if (video?.provider === 'youtube' && /^[A-Za-z0-9_-]{11}$/.test(id)) {
    return `https://www.youtube.com/embed/${id}`;
  }
  if (video?.provider === 'youtube-playlist' && /^[A-Za-z0-9_-]{10,150}$/.test(id)) {
    return `https://www.youtube.com/embed/videoseries?list=${id}`;
  }
  if (video?.provider === 'vimeo' && /^\d+$/.test(id)) {
    return `https://player.vimeo.com/video/${id}`;
  }
  return null;
}

export function videoThumbnail(video, fallback) {
  if (video?.thumbnailUrl && /^https:\/\//.test(video.thumbnailUrl)) return video.thumbnailUrl;
  if (video?.provider === 'youtube' && /^[A-Za-z0-9_-]{11}$/.test(String(video.videoId))) {
    return `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;
  }
  return fallback;
}
