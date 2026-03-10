import React from 'react';
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

function HomePage({
  initialSlides = [],
  initialMainMenuItems = null,
  initialRightMenuItems = null,
  initialNewsData = {},
  initialPublicationData = {},
  initialVideoData = null,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const slides = Array.isArray(initialSlides) ? initialSlides : [];
  const mainMenuItems = Array.isArray(initialMainMenuItems) ? initialMainMenuItems : null;
  const rightMenuItems = Array.isArray(initialRightMenuItems) ? initialRightMenuItems : null;
  const newsDataByCategory = initialNewsData && typeof initialNewsData === 'object' ? initialNewsData : {};
  const publicationData = initialPublicationData && typeof initialPublicationData === 'object'
    ? initialPublicationData
    : {};
  const videos = Array.isArray(initialVideoData) ? initialVideoData : null;

  return (
    <>
      <Header />
      <TopMenu
        initialMenuItems={mainMenuItems}
        disableClientFetch={Boolean(mainMenuItems?.length)}
      />
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
              <NewsCarousel
                categorySlug={"haberler"}
                initialNewsData={newsDataByCategory.haberler}
                deferCarousel
              />
            </Grid>
            <Grid item xs={12}>
              <TitleComponent icon={<FeedIcon />} title={'Basın Açıklamaları'} link={'/kategori/basin-aciklamalari'} />
              <NewsCarousel
                categorySlug={"basin-aciklamalari"}
                initialNewsData={newsDataByCategory["basin-aciklamalari"]}
                deferCarousel
              />
            </Grid>
            <Grid item xs={12}>
              <TitleComponent icon={<ExtensionIcon />} title={'Oda Haberleri'} link={'/kategori/oda-haberleri'} />
              <NewsCarousel
                categorySlug={"oda-haberleri"}
                initialNewsData={newsDataByCategory["oda-haberleri"]}
                deferCarousel
              />
            </Grid>
            <Grid item xs={12}>
              <TitleComponent icon={<EditNotificationsSharpIcon />} title={'İKK Haberleri'} link={'/kategori/ikk-haberleri'} />
              <NewsCarousel
                categorySlug={"ikk-haberleri"}
                initialNewsData={newsDataByCategory["ikk-haberleri"]}
                deferCarousel
              />
            </Grid>
          </Grid>

        </Grid>


        <Grid item xs={12} sm={3} order={isMobile ? 3 : 3} sx={{paddingTop:"1px"}}>
          <SidebarRail
            pageType="home"
            initialRightMenuItems={rightMenuItems}
            disableRightMenuFetch={Boolean(rightMenuItems?.length)}
          />
        </Grid>
      </Grid>

      {/* Görüşler ve Konuşmalar - Tam Genişlik */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6}>
          <TitleComponent icon={<RecordVoiceOverIcon />} title={'Görüşler'} link={'/kategori/gorusler'} />
          <NewsCarousel
            categorySlug={"gorusler"}
            itemsPerSlide={2}
            initialNewsData={newsDataByCategory.gorusler}
            disableCarousel
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TitleComponent icon={<ForumIcon />} title={'Açılış Konuşmaları'} link={'/kategori/etkinlik-acilis-konusmalari'} />
          <NewsCarousel
            categorySlug={"etkinlik-acilis-konusmalari"}
            itemsPerSlide={2}
            initialNewsData={newsDataByCategory["etkinlik-acilis-konusmalari"]}
            disableCarousel
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={4}>
          <TitleComponent icon={<NewspaperIcon />} title={'Birlik Haberleri'} link={'/yayin-turu/birlik-haberleri'} />
          <PublicationCarousel
            one={true}
            categorySlug={"birlik-haberleri"}
            initialData={publicationData["birlik-haberleri"] || null}
            disableCarousel
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TitleComponent icon={<MenuBookIcon />} title={'TMMOB Kitapları'} link={'/yayin-turu/kitap'} />
          <PublicationCarousel
            one={true}
            categorySlug={"kitap"}
            initialData={publicationData.kitap || null}
            disableCarousel
          />
        </Grid>
        <Grid item xs={12} sm={4}>
        <TitleComponent icon={<OndemandVideoIcon />} title={'Videolar'} link={'/video-galeri'} />
        <VideoCarousel initialVideos={videos} disableCarousel />
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
