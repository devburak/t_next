import React from 'react';
import { Box } from '@mui/material';
import Image from 'next/image';

function Campaign({ horizontal = true, link = '', media, title = '' }) {
  const isImage = media?.mediaType === 'image';
console.log("media",media)
  const containerStyle = {
    position: 'relative', // `fill` özelliği için gerekli
    display: 'flex',
    flexDirection: horizontal ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', // Parent genişliği kadar genişlik
    height: horizontal ? '150px' : '500px', // Yatayda 150px, karede 500px yükseklik
    overflow: 'hidden', // Taşan kısımları gizle
  };

  const iframeStyle = {
    height: horizontal ? '150px' : '500px', // Yatayda 150px, karede 500px
    width: '100%', // Genişlik tam olarak parent genişliği
  };

  return (
    <Box sx={containerStyle}>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer">
          {isImage ? (
            <Image
              src={media?.url}
              alt={title} // Kampanya başlığı alt bilgisi olarak eklendi
              fill // `fill` ile container'a sığdır
              style={{ objectFit: horizontal ? 'contain' : 'fill' }} // Görseli ortala ve sığdır
            />
          ) : (
            <iframe
              src={media?.url}
              title={title} // Kampanya başlığı video için de başlık olarak kullanıldı
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={iframeStyle}
            />
          )}
        </a>
      ) : isImage ? (
        <Image
          src={media?.url}
          alt={title} // Kampanya başlığı alt bilgisi olarak eklendi
          fill // `fill` ile container'a sığdır
          style={{ objectFit: horizontal ? 'contain' : 'fill' }} // Görseli ortala ve sığdır
        />
      ) : (
        <iframe
          src={media?.url}
          title={title} // Kampanya başlığı video için de başlık olarak kullanıldı
          allow="autoplay; encrypted-media"
          allowFullScreen
          style={iframeStyle}
        />
      )}
    </Box>
  );
}

export default Campaign;
