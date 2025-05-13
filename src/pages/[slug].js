import Layout from '../component/basic/layout';  // Layout bileşeninin yolu
import ContentContainer from '../component/ContentContainer';
import Script from 'next/script';
import Head from 'next/head';
import dayjs from 'dayjs';
import ContentPageRenderer from '../component/basic/ContentPageRenderer';
function DynamicContentPage({ htmlContent, data, jsonContent = null }) {



  return (

      <ContentPageRenderer htmlContent={htmlContent} data={data} />

  );
}

const apiBaseUrl = process.env.API_BASE_URL;

export async function getServerSideProps({ params }) {
  const { slug } = params;  // URL'den 'slug' parametresini al
  // Eğer 'takvim' slug'ı gelirse, takvim rotasına yönlendir

  if (slug === 'takvim') {
    const currentYear = dayjs().year(); // Geçerli yılı al
    const currentMonth = dayjs().month() + 1; // Geçerli ayı al (0-11 aralığında olduğu için +1 ekliyoruz)

    return {
      redirect: {
        destination: `/takvim/${currentYear}/${currentMonth}`,
        permanent: false,
      },
    };
  }
  // Eğer slug "video-galeri" ise, statik sayfaya yönlendir
  if (slug === 'video-galeri') {
    return {
      redirect: {
        destination: '/video-galeri',
        permanent: false,
      },
    };
  }
  try {
    // API'den veri çekme işlemi
    const res = await fetch(`${apiBaseUrl}/contents/slug/${slug}`);
    if (!res.ok) {
      // İçerik bulunamazsa veya hata alırsa 404 sayfasına yönlendirilir
      return {
        notFound: true,
      };
    }

    const data = await res.json();

    // HTML içeriğini serialize ederek dönüştür
    // const htmlContent = serialize(data.bodyHtml);
    const htmlContent = data.bodyHtml || '';
    return {
      props: { htmlContent, data },  // Sayfa bileşenine veriyi aktar
    };
  } catch (error) {
    console.error("Veri çekme hatası:", error);
    return {
      notFound: true,
    };
  }
}

export default DynamicContentPage;
