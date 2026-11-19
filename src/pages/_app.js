import React from 'react';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from '../lib/createEmotionCache';
import Head from 'next/head';
import { buildCanonicalUrl } from '../lib/seo';
import { CampaignProvider } from '../component/campaign/CampaignContext';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme';
import "@/styles/globals.css";
import "../styles/custom.css";
const clientEmotionCache = createEmotionCache();

export default function App({ Component, pageProps, emotionCache = clientEmotionCache }) {
  return (
    <CacheProvider value={emotionCache}>
    <ThemeProvider theme={theme}>
      <Head><meta name="viewport" content="width=device-width, initial-scale=1" /><meta property="og:site_name" content="TMMOB" /><meta property="og:locale" content="tr_TR" /><meta name="twitter:card" content="summary_large_image" /><link rel="icon" href="/favicon.ico" /><link rel="alternate" type="application/rss+xml" title="TMMOB RSS" href={buildCanonicalUrl('/rss.xml')} /></Head>
      <CampaignProvider initialCampaigns={pageProps.campaigns}>
      {/* CssBaseline, tarayıcı stil sıfırlaması ve temel stilleri ekler */}
      <CssBaseline enableColorScheme />
      <Component {...pageProps} />
      </CampaignProvider>
    </ThemeProvider>
    </CacheProvider>
  );
}
