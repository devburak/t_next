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
import QuickAccessMenu from '../QuickAccessMenu';
import UpcomingEvents from '../calendar/UpcomingEvents';

const DynamicCalendar = dynamic(
  () => import('../calendar'), // Takvim bileşeninizin yolu
  { ssr: false } // Server-side rendering'i devre dışı bırak
);

// Dynamically import Campaign with SSR disabled
const Campaign = dynamic(() => import('../campaign'), { ssr: false });


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
                <TitleComponent icon={<CampaignIcon />} title={'Basın Açıklamaları'} link={'/kategori/basin-aciklamalari'} />
                <NewsCarousel categorySlug={"basin-aciklamalari"} one={true} />
              </Grid>
              <Grid item xs={12} sx={{ marginLeft: 1, marginRight: 1, marginTop: 0, marginBottom: 0 }}>
                <TitleComponent icon={<NewspaperIcon />} title={'Haberler'} link={'/kategori/haberler'} />
                <NewsCarousel categorySlug={"haberler"} one={true} />
              </Grid>
              <Grid item xs={12} sx={{ marginLeft: 1, marginRight: 1, marginTop: 0, marginBottom: 0 }}>
                <TitleComponent icon={<NewspaperIcon />} title={'İKK Haberleri'} link={'/kategori/ikk-haberleri'} />
                <NewsCarousel categorySlug={"ikk-haberleri"} one={true} />
              </Grid>
              <Grid item xs={12} sx={{ marginLeft: 1, marginRight: 1, marginTop: 0, marginBottom: 0 }}>
                <TitleComponent icon={<NewspaperIcon />} title={'Oda Haberleri'} link={'/kategori/oda-haberleri'} />
                <NewsCarousel categorySlug={"oda-haberleri"} one={true} />
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
            <Box sx={{m:2 , p:'4px'}}>
            <Campaign displayOnDetail layoutType="square" />
            </Box>
            <Box sx={{m:1}}>
            <QuickAccessMenu />
            </Box>
            <Box mb={1}>
              <TitleComponent icon={<CalendarMonthIcon />} title={'Etkinlikler'} link={'/takvim'} />
              <DynamicCalendar />
              <Box sx={{ mt: 1 }}>
                <UpcomingEvents limit={10} />
              </Box>
            </Box>

          </div>
         
          <div style={{ backgroundColor: 'inherit', padding: '4px' , marginTop: '16px'}}>
            <TwitterFeed username="TMMOB1954" />
          </div>

          </>
          }
        </Grid>
      </Grid>
      <Chambers />
      <Footer />
    </div>
  );
}

export default Layout;
