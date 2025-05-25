// src/pages/yayin/[id].js

import React from 'react';
import { Container, Typography, Grid, Box, Link as MuiLink, Button, Stack } from '@mui/material';
import Layout from '../../component/basic/layout';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import Head from 'next/head';

export default function PublicationDetailPage({ publication }) {
  if (!publication) return <Layout><Container>Bulunamadı</Container></Layout>;

  // SEO/OG için tanımlar
  const seoTitle = publication.title || 'Yayın Detayı | TMMOB';
  const seoDescription = (publication.bodyText || '').substring(0, 140) + '...';
  const seoImage = publication.coverFile?.url || 'https://storage.ikon-x.com.tr/default.png';
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/yayin/${publication._id}`;

  return (
    <Layout>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={`TMMOB, yayın, dergi, bülten, ${publication.title || ''}`} />
        <link rel="canonical" href={canonicalUrl} />
        {/* OG tags */}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={seoImage} />
      </Head>

      <Container maxWidth="md" sx={{ mt: 6 }}>
        {/* Başlık */}
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          {publication.title}
        </Typography>

        {/* Responsive grid */}
        <Grid container spacing={4}>
          {/* Sol Kolon: Kapak + Dosyalar */}
          <Grid item xs={12} md={4}>
            {publication.coverFile?.url && (
              <Box sx={{ mb: 2, textAlign: 'center' }}>
                <img
                  src={publication.coverFile.url}
                  alt={publication.title}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: 8,
                    boxShadow: '0 2px 12px #eee'
                  }}
                />
              </Box>
            )}
            {/* Dosya listesi */}
            {publication.files?.length > 0 && (
              <Stack spacing={1} alignItems="flex-start" sx={{ mt: 2 }}>
                {publication.files.map((file) => {
                  // Dosya türüne göre ikon seçimi
                  let fileIcon = <DescriptionIcon />;
                  if (file.type === 'application/pdf') fileIcon = <PictureAsPdfIcon color="error" />;
                  // Word dosya tipleri
                  if (file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                    fileIcon = <DescriptionIcon color="primary" />;

                  return (
                    <Button
                      key={file._id}
                      component={MuiLink}
                      href={file.link}
                      download
                      target="_blank"
                      rel="noopener"
                      variant="contained"
                      size="small"
                      color="secondary"
                      startIcon={fileIcon}
                      sx={{ textTransform: 'none' }}
                    >
                      {file.label || file.name || 'Dosya İndir'}
                    </Button>
                  );
                })}
              </Stack>
            )}
          </Grid>
          {/* Sağ Kolon: bodyText */}
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                fontSize: 16,
                lineHeight: 1.7,
                whiteSpace: 'pre-line',
                wordBreak: 'break-word',
              }}
            >
              {publication.bodyText}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
}

// SSR Data Fetch
export async function getServerSideProps({ params }) {
  const { id } = params;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/publication/${id}`);
    if (!res.ok) return { notFound: true };
    const publication = await res.json();
    return {
      props: { publication },
    };
  } catch (error) {
    console.error('Yayın detayı çekilemedi:', error);
    return { notFound: true };
  }
}