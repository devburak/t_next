import React from 'react';
import Header from './header'; // Header bileşeninizin yolu
import Chambers from './chambers';
import Footer from './footer';
import LeftSide from './leftSide'
import TopMenu from './topMenu';
import { Grid, useTheme, useMediaQuery, Box, Typography, Divider } from '@mui/material';
// import CustomCalendar from '../calendar'
import NewsSection from '../Lists/newsSection';
import TwitterFeed from './twitterFeed';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const DynamicCalendar = dynamic(
  () => import('../calendar'), // Takvim bileşeninizin yolu
  { ssr: false } // Server-side rendering'i devre dışı bırak
);

// Kategorilerinizi içeren array
const categories = [
  { id: "65bd78b36edf77b16ef450a0", title: "BASIN AÇIKLAMALARI", path: "/basin-aciklamalari" },
  { id: "65bd78f86edf77b16ef450b1", title: "HABERLER", path: "/haberler" },
  { id: "65bd790e6edf77b16ef450b6", title: "ODA HABERLERİ", path: "/oda-haberleri" },
  { id: "65bd79296edf77b16ef450bb", title: "İKK HABERLERİ", path: "/ikk-haberleri" },
  { id: "65bd78f86edf77b16ef450b1", title: "KONUŞMALAR", path: "/konusmalar" },
  { id: "65bd78f86edf77b16ef450b1", title: "GÖRÜŞLER", path: "/gorusler" }
];

function Layout({ children , LeftSide , RigthSide}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <div>
      <Header />
      <TopMenu />
      <Grid container spacing={2}>
        {<Grid item xs={12} sm={3} order={isMobile ? 2 : 1}>{LeftSide ? LeftSide :
          <div style={{ padding: '10px', position: 'sticky', top: 0, zIndex: 1000 }}>
            <NewsSection categories={categories} />
          </div>}
        </Grid>}
        <Grid item xs={12} sm={RigthSide? 6:9} order={isMobile ? 1 : 2} sx={{ px: 2 }}>
          <div style={{ padding: '5px' }}>
            {children}
          </div>
        </Grid>
        <Grid item xs={12} sm={3} order={isMobile ? 3 : 3}>
        {RigthSide &&<>
          <div style={{ backgroundColor: 'inherit', padding: '16px' }}>
            <Box mb={1}>
              <img
                src="https://storage.ikon-x.com.tr/2024/02/bosunamiokuduk.png" // Görselin yolu
                alt="Kampanya"
                style={{ maxWidth: '100%', height: 'auto', marginBottom: '20px' }} // Stilleri ayarlayın
              />
            </Box>

            <Box mb={1}>

              <Link href={"Etkinlikler"} passHref>
                <Typography variant="h6" sx={{ textDecoration: 'none', color: 'primary.main', cursor: 'pointer' }}>
                  ETKİNLLİKLER
                </Typography>
              </Link>
              <Divider sx={{ mb: 1 }} />

              <DynamicCalendar />
            </Box>

          </div>
          <div style={{ backgroundColor: 'inherit', padding: '16px' }}>
            <TwitterFeed username="TMMOB1954" />
          </div></>
          }
        </Grid>
      </Grid>
      <Chambers />
      <Footer />
    </div>
  );
}

export default Layout;
