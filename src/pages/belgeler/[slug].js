import Layout from '../../component/basic/layout';  // Dikkat: yol ../../ olacak
import dayjs from 'dayjs';
import ContentPageRenderer from '../../component/basic/ContentPageRenderer';

function BelgeContentPage({ htmlContent, data }) {
  return (

      <ContentPageRenderer htmlContent={htmlContent} data={data} />

  );
}

const apiBaseUrl = process.env.API_BASE_URL;

export async function getServerSideProps({ params }) {
  const { slug } = params;

  // Takvim ve video-galeri slug'ları /belgeler için mantıklı değil ama gene de filtre ekleyelim
  if (slug === 'takvim' || slug === 'video-galeri') {
    return {
      notFound: true,
    };
  }

  try {
    // /contents/category/belgeler/{slug} endpointi ile belgeyi getir
    const res = await fetch(`${apiBaseUrl}/contents/slug/${slug}`);
    if (!res.ok) {
      return { notFound: true };
    }

    const data = await res.json();
    const htmlContent = data.bodyHtml || '';

    return {
      props: { htmlContent, data },
    };
  } catch (error) {
    console.error("Veri çekme hatası:", error);
    return { notFound: true };
  }
}

export default BelgeContentPage;