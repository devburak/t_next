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
        width={600} // Maksimum genişlik
        height={450} // Maksimum yükseklik
        style={{
          objectFit: 'contain',
          maxWidth: '600px',
          maxHeight: '450px',
        }}
        layout="responsive" // Doğru oranda render alması için kullanılır
      />
    </Box>
  );
}

export default FeaturedImage;
