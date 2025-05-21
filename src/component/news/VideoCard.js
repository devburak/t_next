// components/VideoCard.js
import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
import { formattedDate } from '../utils';

export default function VideoCard({ image, title, publishDate, onClick }) {
  return (
    <Card
      sx={{
        maxWidth: 345,
        margin: '0 auto',
        cursor: 'pointer',
        textDecoration: 'none',
      }}
      onClick={onClick}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          sx={{ height: 140, maxHeight: 140, objectFit: 'cover' }}
          image={image}
          title={title}
        />
        {/* Oynat tuşu overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 56,
            opacity: 0.7,
            pointerEvents: 'none', // Click olayını engellemesin
          }}
        >
          ▶
        </Box>
        {/* Tarih etiketi */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -4,
            right: 0,
            width: '50%',
            bgcolor: 'rgba(0, 0, 0, 0.4)',
            color: 'white',
            textAlign: 'center',
            padding: '2px 0',
          }}
        >
          <Typography variant="caption" sx={{ fontSize: 12 }}>
            {formattedDate(publishDate)}
          </Typography>
        </Box>
      </Box>
      <CardContent sx={{ height: 100, maxHeight: 100, p: 1 }}>
        <Typography
          gutterBottom
          variant="h6"
          component="div"
          sx={{ fontSize: 12, fontWeight: 'bold', lineHeight: '1.5' }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
}