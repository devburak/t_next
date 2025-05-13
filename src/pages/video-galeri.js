import Layout from '../component/basic/layout';  // Layout bileşeninin yolu
import ContentContainer from '../component/ContentContainer';
import Script from 'next/script';
import Head from 'next/head';
import dayjs from 'dayjs';
import ContentPageRenderer from '../component/basic/ContentPageRenderer';
import VideoGrid from '../component/VideoGrid';

function DynamicContentPage({ data, page, limit }) {
  return (
    <Layout>
        <h1>Video Galeri</h1>
         <VideoGrid videos={data.videos} page={page} limit={limit} /> 
    </Layout>
  );
}

const apiBaseUrl = process.env.API_BASE_URL;

export async function getServerSideProps({ query }) {
  const { search = '', page = 1, limit = 20 } = query;
  
  try {
    
    // API'den veri çekme işlemi
    const res = await fetch(`${apiBaseUrl}/videos?search=${search}&page=${page}&limit=${limit}`);
    if (!res.ok) {
      // İçerik bulunamazsa veya hata alırsa 404 sayfasına yönlendirilir
      return {
        notFound: true,
      };
    }

    const data = await res.json();
    console.log(data);
    return {
      props: { data, page, limit },  // Sayfa bileşenine veriyi aktar
    };
  } catch (error) {
    console.error("Veri çekme hatası:", error);
    return {
      notFound: true,
    };
  }
}

export default DynamicContentPage;
