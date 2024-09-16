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
import TitleComponent from './TitleComponent';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NewsCarousel from '../news/NewsCarousel';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import FeedIcon from '@mui/icons-material/Feed';
import EditNotificationsSharpIcon from '@mui/icons-material/EditNotificationsSharp';
import CampaignIcon from '@mui/icons-material/Campaign';
import ExtensionIcon from '@mui/icons-material/Extension';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import MenuBookIcon from '@mui/icons-material/MenuBook';

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
        <Grid item xs={12} sm={3} order={isMobile ? 2 : 1} sx={{ pl: 2 }}>{LeftSide ? LeftSide :
          <div style={{ padding: '8px', position: 'sticky', top: 0, zIndex: 1000 }}>
            <Grid container>
             
              <Grid item xs={12} sx={{ marginLeft: 1, marginRight: 1, marginTop: 0, marginBottom: 0 }}>
              <TitleComponent icon={<NewspaperIcon />} title={'Haberler'} link={'/kategori/haberler'} />
              <NewsCarousel categorySlug={"haberler"} one={true} />
            </Grid>
      
            </Grid>
          </div>}
        </Grid>
        <Grid item xs={12} sm={RigthSide ? 6:9} order={isMobile ? 1 : 2} sx={{ px: 2 }}>
          <div style={{ padding: '5px' }}>
            {children}
          </div>
        </Grid>
        <Grid item xs={12} sm={3} order={isMobile ? 3 : 3} sx={{pr:2}}>
        {RigthSide &&<>
          <div style={{ backgroundColor: 'inherit' }}>
            <Box mb={1}>
              <img
                src="https://storage.ikon-x.com.tr/2024/02/bosunamiokuduk.png" // Görselin yolu
                alt="Kampanya"
                style={{ maxWidth: '100%', height: 'auto', marginBottom: '20px' }} // Stilleri ayarlayın
              />
            </Box>
            <Box mb={1}>
              <TitleComponent icon={<CalendarMonthIcon />} title={'Etkinlikler'} link={'/kategori/etkinlikler'} />
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
