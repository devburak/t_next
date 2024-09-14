// components/ContentListItem.js
import { Card, CardMedia, CardContent, Typography, Box, Grid } from '@mui/material';
import Link from 'next/link';

const ContentListItem = ({ title, publishDate, featuredMedia, spot, link }) => {

   // Tarihi 'tr-TR' formatında formatla
   const formattedDate = new Date(publishDate).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <Card sx={{ display: 'flex', marginBottom: 2 }}>
      <Grid container>
        {/* Sol tarafta resim */}
        {featuredMedia?.url && (
          <Grid item xs={12} sm={4}>
            <CardMedia
              component="img"
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              image={featuredMedia.url}
              alt={title}
            />
          </Grid>
        )}
        
        {/* Sağ tarafta içerik */}
        <Grid item xs={12} sm={8}>
          <CardContent>
             {/* Tarih */}
            <Typography variant="body2" color="text.secondary" align="right">
              {formattedDate}
            </Typography>
            
            {/* Başlık */}
            <Link href={link} legacyBehavior>
              <a style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="h6" component="span" gutterBottom>
                  {title}
                </Typography>
              </a>
            </Link>
            
            {/* Spot */}
            {spot && (
              <Typography variant="body1" color="textPrimary" sx={{ fontSize: '12px' }} >
                {spot}
              </Typography>
            )}
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  );
};

export default ContentListItem;
