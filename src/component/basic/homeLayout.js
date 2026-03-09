import React, { useState, useEffect } from 'react';
import { Grid, useTheme, useMediaQuery, Box } from '@mui/material';
import Header from './header'; // Header bileşeninizin yolu
import Chambers from './chambers';
import Footer from './footer';
import TopMenu from './topMenu';
// import CustomCalendar from '../calendar'
import VideoCarousel from '../news/VideoCarousel';
// import Campaign from '../campaign'
import dynamic from 'next/dynamic';
import TitleComponent from './TitleComponent';
import HomeSlider from '../HomeSlider';
import NewsCarousel from '../news/NewsCarousel';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import FeedIcon from '@mui/icons-material/Feed';
import EditNotificationsSharpIcon from '@mui/icons-material/EditNotificationsSharp';
import CampaignIcon from '@mui/icons-material/Campaign';
import ExtensionIcon from '@mui/icons-material/Extension';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ForumIcon from '@mui/icons-material/Forum';
import AltMenu from '../Altmenu';
import PublicationCarousel from '../publications/PublicationCarusel';
import SidebarRail from './SidebarRail';

// Dynamically import Campaign with SSR disabled
const Campaign = dynamic(() => import('../campaign'), { ssr: false });

function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [slides, setSlides] = useState([]); // Slider verisi için state

  useEffect(() => {
    // İstemci tarafında veri çekme
    const fetchSlides = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/contents/category/slide?limit=5`); // İstemci tarafı için env değişkeni
        if (!res.ok) {
          console.error('Sunucudan veri alınırken hata oluştu:', res.statusText);
          return;
        }
        const data = await res.json();
        setSlides(data.contents || []); // Gelen verileri state'e ata
      } catch (error) {
        console.error('Veri çekme hatası:', error.message);
      }
    };
    fetchSlides(); // Veri çekme işlemini başlat

  }, []); // Component mount olduğunda çalışır

  return (
    <>
      <Header />
      <TopMenu />
      <Box className="site-shell site-shell--content">
      <Grid container spacing={3}>
        <Grid item xs={12} >
        <Campaign pageType="home" placement="banner" layoutType="horizontal" />
        <Campaign pageType="home" placement="popup" />
        </Grid>
       
        <Grid item xs={12} sm={9} order={isMobile ? 1 : 2}>
          <div style={{ padding: '8px', minHeight: 250 }}>
            <HomeSlider slides={slides} />
            <AltMenu />
          </div>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TitleComponent icon={<NewspaperIcon />} title={'Haberler'} link={'/kategori/haberler'} />
              <NewsCarousel categorySlug={"haberler"} />
            </Grid>
            <Grid item xs={12}>
              <TitleComponent icon={<FeedIcon />} title={'Basın Açıklamaları'} link={'/kategori/basin-aciklamalari'} />
              <NewsCarousel categorySlug={"basin-aciklamalari"} />
            </Grid>
            <Grid item xs={12}>
              <TitleComponent icon={<ExtensionIcon />} title={'Oda Haberleri'} link={'/kategori/oda-haberleri'} />
              <NewsCarousel categorySlug={"oda-haberleri"} />
            </Grid>
            <Grid item xs={12}>
              <TitleComponent icon={<EditNotificationsSharpIcon />} title={'İKK Haberleri'} link={'/kategori/ikk-haberleri'} />
              <NewsCarousel categorySlug={"ikk-haberleri"} />
            </Grid>
          </Grid>

        </Grid>


        <Grid item xs={12} sm={3} order={isMobile ? 3 : 3} sx={{paddingTop:"1px"}}>
          <SidebarRail pageType="home" />
        </Grid>
      </Grid>

      {/* Görüşler ve Konuşmalar - Tam Genişlik */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6}>
          <TitleComponent icon={<RecordVoiceOverIcon />} title={'Görüşler'} link={'/kategori/gorusler'} />
          <NewsCarousel categorySlug={"gorusler"} itemsPerSlide={2} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TitleComponent icon={<ForumIcon />} title={'Açılış Konuşmaları'} link={'/kategori/etkinlik-acilis-konusmalari'} />
          <NewsCarousel categorySlug={"etkinlik-acilis-konusmalari"} itemsPerSlide={2} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={4}>
          <TitleComponent icon={<NewspaperIcon />} title={'Birlik Haberleri'} link={'/yayin-turu/birlik-haberleri'} />
          <PublicationCarousel one={true} categorySlug={"birlik-haberleri"} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TitleComponent icon={<MenuBookIcon />} title={'TMMOB Kitapları'} link={'/yayin-turu/kitap'} />
          <PublicationCarousel one={true} categorySlug={"kitap"} />
        </Grid>
        <Grid item xs={12} sm={4}>
        <TitleComponent icon={<OndemandVideoIcon />} title={'Videolar'} link={'/video-galeri'} />
        <VideoCarousel />
        </Grid>
      </Grid>
      </Box>
      <Campaign pageType="home" placement="footer" layoutType="horizontal" />
      <Chambers />
      <Footer />
    </>
  );
}

export default HomePage;
