import Layout from '../../component/basic/layout';  // Layout bileşeninin yolu
import { Typography, Box } from '@mui/material';  

function DynamicContentPage({ htmlContent, data }) {
  return (
    <Layout>
      <h1>{data.title}</h1>
      {data.featuredMedia && data.featuredMedia.url && (
        <img src={data.featuredMedia.url} alt={data.title} style={{ maxWidth: '100%' }} />
      )}
       {/* Spot (Kalın Metin) */}
       {data.spot && (
        <Typography variant="h6" component="p" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>
          {data.spot}
        </Typography>
      )}

      <div>
        <div key={data.title} dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </Layout>
  );
}

const apiBaseUrl = process.env.API_BASE_URL;

export async function getServerSideProps({ params }) {
  const { slug } = params;  // URL'den 'slug' parametresini al

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
    const htmlContent = data.bodyHtml ||'';
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
