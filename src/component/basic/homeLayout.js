import React, { useState, useEffect } from 'react';
import { Grid, useTheme, useMediaQuery, Box, Typography, Divider } from '@mui/material';
import Header from './header'; // Header bileşeninizin yolu
import Chambers from './chambers';
import Footer from './footer';
import LeftSide from './leftSide'
import TopMenu from './topMenu';
// import CustomCalendar from '../calendar'
import NewsSection from '../Lists/newsSection';
import VideoSection from '../Lists/videoSection'
import CustomSlider from './customSlider'
// import Campaign from '../campaign'
import TwitterFeed from './twitterFeed';
import dynamic from 'next/dynamic';
import Link from 'next/link'; // Link bileşenini import edin
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
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import QuickAccessMenu from '../QuickAccessMenu';
import AltMenu from '../Altmenu';
const DynamicCalendar = dynamic(
  () => import('../calendar'), // Takvim bileşeninizin yolu
  { ssr: false } // Server-side rendering'i devre dışı bırak
);

// Dynamically import Campaign with SSR disabled
const Campaign = dynamic(() => import('../campaign'), { ssr: false });
// Kategorilerinizi içeren array
const categories = [
  { id: "65bd78b36edf77b16ef450a0", title: "BASIN AÇIKLAMALARI", slug: "basin-aciklamalari" },
  { id: "65bd78f86edf77b16ef450b1", title: "HABERLER", slug: "haberler" },
  { id: "65bd790e6edf77b16ef450b6", title: "ODA HABERLERİ", slug: "oda-haberleri" },
  { id: "65bd79296edf77b16ef450bb", title: "İKK HABERLERİ", slug: "ikk-haberleri" },
  { id: "65bd78f86edf77b16ef450b1", title: "KONUŞMALAR", slug: "konusmalar" },
  { id: "65bd78f86edf77b16ef450b1", title: "GÖRÜŞLER", slug: "gorusler" }
];
const videCat = { id: "65bd78f86edf77b16ef450b1", title: "VİDEOLAR", path: "/videolar" }

function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [slides, setSlides] = useState([]); // Slider verisi için state

  const [horizontalCampaigns, setHorizontalCampaigns] = useState([]);
  const [squareCampaigns, setSquareCampaigns] = useState([]);

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
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/campaigns/active`);
        if (!response.ok) throw new Error('Kampanyalar yüklenemedi');
        const data = await response.json();
        console.log('Kampanyalar:', data);
        // `displayOnHome` ve `isActive` koşullarını filtreleyin
        const filteredCampaigns = data.filter(
          (campaign) => campaign.displayOnHome && campaign.isActive
        );
        console.log('Filtrelenmiş kampanyalar:', filteredCampaigns);
        // Yatay ve kare kampanyaları ayırın
        setHorizontalCampaigns(filteredCampaigns.filter((campaign) => campaign.horizontalMedia));
        setSquareCampaigns(filteredCampaigns.filter((campaign) => campaign.squareMedia));
        console.log('Kampanyalar:', squareCampaigns, horizontalCampaigns);
      } catch (error) {
        console.error('Kampanyalar alınırken hata oluştu:', error);
      }
    };

    fetchCampaigns();
    fetchSlides(); // Veri çekme işlemini başlat

  }, []); // Component mount olduğunda çalışır

  return (
    <>
      <Header />
      <TopMenu />
      <Grid container spacing={1}>
        <Grid item xs={12} >
        <Campaign displayOnHome layoutType="horizontal" />
        </Grid>
       
        <Grid item xs={12} sm={9} order={isMobile ? 1 : 2} sx={{ px: 1 }}>
          <div style={{ padding: '8px', minHeight: 250 }}>
            <HomeSlider slides={slides} />
            <AltMenu />
          </div>
          <Grid container spacing={2} sx={{ px: 1 }}>
            <Grid item xs={12} sx={{ marginLeft: 1, marginRight: 1, marginTop: 0, marginBottom: 0 }}>
              <TitleComponent icon={<NewspaperIcon />} title={'Haberler'} link={'/kategori/haberler'} />
              <NewsCarousel categorySlug={"haberler"} />
            </Grid>
            <Grid item xs={12} sx={{ marginLeft: 1, marginRight: 1, marginTop: 0, marginBottom: 0 }}>
              <TitleComponent icon={<FeedIcon />} title={'Basın Açıklamaları'} link={'/kategori/basin-aciklamalari'} />
              <NewsCarousel categorySlug={"basin-aciklamalari"} />
            </Grid>
            <Grid item xs={12} sx={{ marginLeft: 1, marginRight: 1, marginTop: 0, marginBottom: 0 }}>
              <TitleComponent icon={<ExtensionIcon />} title={'Oda Haberleri'} link={'/kategori/oda-haberleri'} />
              <NewsCarousel categorySlug={"oda-haberleri"} />
            </Grid>
            <Grid item xs={12} sx={{ marginLeft: 1, marginRight: 1, marginTop: 0, marginBottom: 0 }}>
              <TitleComponent icon={<EditNotificationsSharpIcon />} title={'İKK Haberleri'} link={'/kategori/ikk'} />
              <NewsCarousel categorySlug={"ikk"} />
            </Grid>
            <Grid item xs={12} sx={{ marginLeft: 1, marginRight: 1, marginTop: 0, marginBottom: 0 }}>
              <TitleComponent icon={<CampaignIcon />} title={'Görüş ve Konuşmalar'} link={'/kategori/gorusler-ve-konusmalar'} />
              <NewsCarousel categorySlug={"Görüş ve Konuşmalar"} />
            </Grid>
          </Grid>

        </Grid>


        <Grid item xs={12} sm={3} order={isMobile ? 3 : 3} sx={{paddingTop:"1px"}}>
          <div style={{ backgroundColor: 'inherit', padding: '4px' }}>
         {/* Kare Kampanyalar */}
         <Campaign displayOnHome layoutType="square" />
            <Box mb={1}>
              <TitleComponent icon={<CalendarMonthIcon />} title={'Etkinlikler'} link={'/takvim'} />
              <DynamicCalendar />
            </Box>

          </div>
          <div style={{ backgroundColor: 'inherit', padding: '16px' }}>
            <QuickAccessMenu />
            </div>
          {/* <div style={{ backgroundColor: 'inherit', padding: '16px' }}>
            <TwitterFeed username="TMMOB1954" />
          </div> */}
        </Grid>

      </Grid>
      <Grid container spacing={2} sx={{ px: 2 }}>
        <Grid item xs={12} sm={4}>
          <TitleComponent icon={<NewspaperIcon />} title={'Birlik Haberleri'} link={'/kategori/birlik-haberleri'} />
          <NewsCarousel categorySlug={"birlik-haberleri"} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TitleComponent icon={<MenuBookIcon />} title={'TMMOB Kitapları'} link={'/kategori/kitap'} />
          <NewsCarousel categorySlug={"kitap"} />
        </Grid>
        <Grid item xs={12} sm={4}>
        <TitleComponent icon={<OndemandVideoIcon />} title={'Videolar'} link={'/kategori/videolar'} />
        <NewsCarousel categorySlug={"kitap"} />
        </Grid>
      </Grid>
      <Chambers />
      <Footer />
    </>
  );
}

export default HomePage;
