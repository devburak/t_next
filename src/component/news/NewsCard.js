// components/NewsCard.js
import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
import Link from 'next/link'; // Next.js Link bileşenini import et
import {formattedDate} from '../utils'
import AspectRatioMedia from '../basic/AspectRatioMedia';

const TITLE_CLAMP_SX = {
  fontSize: 12,
  fontWeight: 'bold',
  lineHeight: 1.5,
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 3,
  overflow: 'hidden',
  minHeight: '4.5em',
  maxHeight: '4.5em'
};

export default function NewsCard({ image, title, url,publishDate }) {
    return (
        <Link href={url} passHref>
          <Card
            sx={{
              maxWidth: 345,
              width: '100%',
              height: '100%',
              margin: '0 auto',
              cursor: 'pointer', // Kartın tıklanabilir olduğunu gösterir
              textDecoration: 'none', // Link'in altını kaldırmak için
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ position: 'relative' }}> {/* Relative pozisyonlandırma için bir Box eklendi */}
              <AspectRatioMedia
                  src={image}
                  alt={title}
                  sizes="(max-width: 600px) 100vw, 345px"
                  sx={{ maxHeight: 260, bgcolor: 'grey.50' }}
                  objectFit="contain"
              />
              {/* Tarih etiketi */}
              <Box
                sx={{
                  position: 'absolute', // Mutlak pozisyonlandırma
                  bottom: -4,
                  right: 0,
                  width: '50%',
                  bgcolor: 'rgba(0, 0, 0, 0.4)', // Karartılmış arka plan
                  color: 'white',
                  textAlign: 'center',
                  padding: '2px 0', // İçerik boşluğu
                }}
              >
                <Typography variant="caption" sx={{ fontSize: 12 }}>
                  {formattedDate(publishDate)}
                </Typography>
              </Box>
            </Box>
            <CardContent sx={{ minHeight: 96, maxHeight: 96, p: 1.5, display: 'flex', alignItems: 'flex-start' }}>
              <Typography
                variant="h6"
                component="div"
                sx={TITLE_CLAMP_SX}
              >
                {title}
              </Typography>
            </CardContent>
          </Card>
        </Link>
      );
}
