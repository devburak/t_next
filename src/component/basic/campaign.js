import React from 'react';
import { Box } from '@mui/material';

function Campaign({ vertical = false, link = '',fileUrl="https://www.tmmob.org.tr/sites/default/files/haydi_2.png" }) {
  const imageStyle = {
    height: '50%',
    width: '100%',
    objectFit: 'cover', // Resmin oranını koruyarak kutuya sığmasını sağlar
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: vertical ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: vertical ? 'auto' : '100%', // Dikey modda yüksekliği otomatik ayarla
        width: vertical ? '100%' : 'auto', // Dikey modda genişliği tam yap
      }}
    >
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer">
          <img
            src={fileUrl}
            alt="Kampanya"
            style={imageStyle}
          />
        </a>
      ) : (
        <img
        src={fileUrl}
          alt="Kampanya"
          style={imageStyle}
        />
      )}
    </Box>
  );
}

export default Campaign;
