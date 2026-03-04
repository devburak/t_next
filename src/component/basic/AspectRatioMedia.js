import { Box } from '@mui/material';
import Image from 'next/image';
import { DEFAULT_OG_IMAGE } from '../../lib/seo';

export const MAIN_MEDIA_RATIO = '4 / 3';

export function getMediaUrl(media, { preferThumbnail = false } = {}) {
  if (!media) {
    return '';
  }

  if (typeof media === 'string') {
    return media;
  }

  if (preferThumbnail && Array.isArray(media.thumbnails)) {
    const thumbnail = media.thumbnails.find(Boolean);
    if (typeof thumbnail === 'string') {
      return thumbnail;
    }
    if (thumbnail && typeof thumbnail === 'object' && thumbnail.url) {
      return thumbnail.url;
    }
  }

  return media.url || '';
}

function AspectRatioMedia({
  src,
  alt,
  ratio = MAIN_MEDIA_RATIO,
  objectFit = 'cover',
  objectPosition = 'center',
  sizes = '100vw',
  priority = false,
  fallbackSrc = DEFAULT_OG_IMAGE,
  sx = {},
  imageStyle = {},
  imageProps = {}
}) {
  const resolvedSrc = src || fallbackSrc;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: ratio,
        overflow: 'hidden',
        bgcolor: 'grey.100',
        ...sx
      }}
    >
      <Image
        src={resolvedSrc}
        alt={alt || ''}
        fill
        priority={priority}
        sizes={sizes}
        style={{
          objectFit,
          objectPosition,
          ...imageStyle
        }}
        {...imageProps}
      />
    </Box>
  );
}

export default AspectRatioMedia;
