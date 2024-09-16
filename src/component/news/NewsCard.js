// components/NewsCard.js
import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
import Link from 'next/link'; // Next.js Link bileşenini import et
import {formattedDate} from '../utils'

export default function NewsCard({ image, title, url,publishDate }) {
    return (
        <Link href={url} passHref>
          <Card
            sx={{
              maxWidth: 345,
              margin: '0 auto',
              cursor: 'pointer', // Kartın tıklanabilir olduğunu gösterir
              textDecoration: 'none', // Link'in altını kaldırmak için
            }}
          >
            <Box sx={{ position: 'relative' }}> {/* Relative pozisyonlandırma için bir Box eklendi */}
              <CardMedia
                sx={{ height: 190, maxHeight: 190, objectFit: 'cover' }} // Sabit yükseklik ve max yükseklik ayarı
                image={image}
                title={title}
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
            <CardContent sx={{ height: 100, maxHeight: 100, p: 1 }}> {/* Sabit yükseklik */}
              <Typography
                gutterBottom
                variant="h6"
                component="div"
                sx={{ fontSize: 12, fontWeight: 'bold', lineHeight: '1.5' }} // Başlık için font ve stil ayarı
              >
                {title}
              </Typography>
            </CardContent>
          </Card>
        </Link>
      );
}
