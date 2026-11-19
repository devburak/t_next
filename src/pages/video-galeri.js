import Layout from '../component/basic/layout';
import PageMetadata from '../component/basic/PageMetadata';
import VideoGrid from '../component/VideoGrid';
import { canonicalPagePath } from '../lib/pageMetadata.mjs';

function DynamicContentPage({ data, page, limit }) {
  return (
    <Layout>
        <PageMetadata title="Video Galeri" description="TMMOB açıklamaları, etkinlikleri ve çalışmalarından videoları izleyin." path={canonicalPagePath('/video-galeri', page)} />
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
