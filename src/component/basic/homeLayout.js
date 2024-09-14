import React,{useState,useEffect} from 'react';
import { Grid, useTheme, useMediaQuery,Box,Typography ,Divider} from '@mui/material';
import Header from './header'; // Header bileşeninizin yolu
import Chambers from './chambers';
import Footer from './footer';
import LeftSide from './leftSide'
import TopMenu from './topMenu';
// import CustomCalendar from '../calendar'
import NewsSection from '../Lists/newsSection';
import VideoSection from '../Lists/videoSection'
import CustomSlider from './customSlider'
import Campaign from './campaign'
import TwitterFeed from './twitterFeed';
import dynamic from 'next/dynamic';
import Link from 'next/link'; // Link bileşenini import edin

import HomeSlider from '../HomeSlider';


const DynamicCalendar = dynamic(
    () => import('../calendar'), // Takvim bileşeninizin yolu
    { ssr: false } // Server-side rendering'i devre dışı bırak
  );
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
          <Grid container spacing={2}>
            <Grid item xs={6} >
            <div style={{ margin: '10px' }}>
                      <Campaign />
                  </div>
            </Grid>
            <Grid item xs={6} >
            <div style={{ margin: '10px' }}>
                      <Campaign />
                  </div>
            </Grid>
              <Grid item xs={12} sm={9} order={isMobile ? 1 : 2} sx={{ px: 2 }}>
                  {/* <div style={{ margin: '10px' }}>
                      <Campaign />
                  </div> */}
                  {/* <div style={{ padding: '5px' }}>
                      <CustomSlider categoryId="65bd799f6edf77b16ef450d3" limit={5} />
                  </div> */}
                    {/* Ana Sayfa Slider */}
                  <div style={{ padding: '5px', minHeight:250}}>
                      <HomeSlider slides={slides} />
                  </div>
                  <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                          <VideoSection category={videCat} />
                      </Grid>
                      <Grid item xs={12}  order={isMobile ? 2 : 1}>
                          <div style={{ padding: '10px' }}>
                              <NewsSection categories={categories} />
                          </div>
                      </Grid>
                  </Grid>
                  
              </Grid>
             
             
              <Grid item xs={12} sm={3} order={isMobile ? 3 : 3}>
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
                  </div>
              </Grid>
          </Grid>
          <Chambers />
          <Footer />
      </>
  );
}

export default HomePage;
