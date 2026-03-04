// components/ContentListItem.js
import { Card, CardContent, Typography, Grid } from '@mui/material';
import Link from 'next/link';
import AspectRatioMedia, { getMediaUrl } from './basic/AspectRatioMedia';

const ContentListItem = ({ title, publishDate, featuredMedia, spot, link }) => {
  const mediaUrl = getMediaUrl(featuredMedia, { preferThumbnail: true }) || getMediaUrl(featuredMedia);

   // Tarihi 'tr-TR' formatında formatla
   const formattedDate = new Date(publishDate).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <Card sx={{ display: 'flex', marginBottom: 2, width: '100%', overflow: 'hidden' }} >
      <Grid container spacing={2} alignItems="stretch" >
        {/* Sol tarafta resim */}
        {mediaUrl && (
          <Grid item xs={12} sm={4}>
            <AspectRatioMedia
              src={mediaUrl}
              alt={title}
              sizes="(max-width: 600px) 100vw, 33vw"
              sx={{
                width: '100%',
                height: '100%',
                minHeight: {
                  xs: 220,
                  sm: 180,
                },
              }}
              objectFit="contain"
            />
          </Grid>
        )}
        
        {/* Sağ tarafta içerik */}
        <Grid item xs={12} sm={mediaUrl ? 8 : 12}>
          <CardContent  sx={{ minHeight: 200, width: '100%' }}>
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
