import Image from 'next/image';
import { Box } from '@mui/material';

function FeaturedImage({ url, alt }) {
  if (!url) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: 2,
        marginBottom: 2,
      }}
    >
      <Image
        src={url}
        alt={alt || 'Featured Image'}
        width={550} // İstediğiniz genişlik
        height={400} // İstediğiniz yükseklik
        style={{
          objectFit: 'contain', // Görselin içeriği "contain" olacak şekilde düzenlenir
        }}
      />
    </Box>
  );
}

export default FeaturedImage;
