// components/TitleComponent.js
import * as React from 'react';
import Box from '@mui/material/Box';
import Link from 'next/link';

export default function TitleComponent({ icon, title, link }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#788590',
        padding: '8px', // İç kenar boşluğu
        lineHeight: '1.3',
        color: 'white',
        width: '100%', // Arka planın tamamını kapsaması için
      }}
    >
      {icon && (
        <Box sx={{ marginRight: 1 }}>
          {/* Eğer ikon varsa gösterilecek */}
          {icon}
        </Box>
      )}
      {/* Link bileşenini <a> etiketiyle birlikte kullanın */}
      <Link href={link} legacyBehavior>
        <a style={{ fontWeight: 'bold', color: 'white', fontSize: 14, textDecoration: 'none' }}>
          {title}
        </a>
      </Link>
    </Box>
  );
}
