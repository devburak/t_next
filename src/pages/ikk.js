// pages/ikk.js

import React from 'react';
import { Chip, Container, Typography, Box, Link, Stack, Divider } from '@mui/material';
import Layout from '@/component/basic/layout';

// SSR ile tüm IKK'ları çekiyoruz
export async function getServerSideProps() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ikk`);
  const ikkList = await res.json();
  return { props: { ikkList } };
}

const socialList = [
  { key: 'twitter', label: 'Twitter' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'telegram', label: 'Telegram' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'bluesky', label: 'Bluesky' },
  { key: 'other', label: 'Diğer' }
];

export default function IKKPage({ ikkList }) {
  return (
    <Layout>
      <Container maxWidth="md" sx={{ mt: 6 }}>
        {ikkList.map((ikk, idx) => (
          <Box key={ikk._id} sx={{ mb: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
              {ikk.title}
            </Typography>
            {/* Sekreter isimleri ve oda chip'leri */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 , fontSize: '1.1rem' }}>
              {ikk.secretaries?.map((sec, i) => (
                <span key={i}>
                  {sec.name}
                  {sec.chamber?.name && (
                    <>
                      {" "}
                      <Chip
                        label={sec.chamber.name}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mx: 0.5 }}
                      />
                    </>
                  )}
                  {i < ikk.secretaries.length - 1 ? ', ' : ''}
                </span>
              ))}
            </Typography>
           
            <Typography variant="body1" sx={{ my: 1, fontSize: '1rem' }}>
              {ikk.address}
            </Typography>
            <Box sx={{ my: 1 }}>
              <Typography component="span" sx={{ mr: 2 }}>
                <b>Tel:</b> {ikk.contact?.phone}
              </Typography>
              {ikk.contact?.fax && (
                <Typography component="span" sx={{ mr: 2 }}>
                  <b>Faks:</b> {ikk.contact?.fax}
                </Typography>
              )}
                {ikk.contact?.website && (
                    <Typography component="span">
                    <b>Web:</b>{' '}
                    <Link href={ikk.contact.website} target="_blank" rel="noopener noreferrer">
                        {ikk.contact.website}
                    </Link>
                    </Typography>
                )}
            </Box>
            <Box sx={{ my: 1 }}>
              <Typography component="span" sx={{ mr: 1 }}>
                <b>e-Posta:</b>
              </Typography>
              <Link href={`mailto:${ikk.contact?.email?.trim()}`}>
                {ikk.contact?.email}
              </Link>
               {/* Sosyal medya chipleri */}
            <Stack direction="row" spacing={1} my={1}>
              {socialList
                .filter(soc => ikk.contact?.social?.[soc.key])
                .map(soc => (
                  <Chip
                    key={soc.key}
                    label={soc.label}
                    component="a"
                    href={ikk.contact.social[soc.key]}
                    target="_blank"
                    clickable
                    color="info"
                    variant="outlined"
                    size="small"
                  />
                ))}
            </Stack>
            </Box>
            {idx < ikkList.length - 1 && <Divider sx={{ my: 1 }} />}
          </Box>
        ))}
      </Container>
    </Layout>
  );
}