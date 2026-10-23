import { Box } from '@mui/material';
import AspectRatioMedia from './AspectRatioMedia';

function FeaturedImage({ url, alt }) {
  if (!url) return null;

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 600,
        mx: 'auto',
        my: 2,
      }}
    >
      <AspectRatioMedia
        src={url}
        alt={alt || 'Featured Image'}
        objectFit="contain"
        sx={{ bgcolor: 'transparent' }}
        sizes="(max-width: 600px) calc(100vw - 74px), (max-width: 1000px) calc(69vw - 48px), 600px"
        priority
      />
    </Box>
  );
}

export default FeaturedImage;
