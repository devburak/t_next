import Layout from '../../component/basic/layout'
import { Typography, Box } from '@mui/material';  


function IcerikPage({ htmlContent,data }) {

  const formattedDate = new Date(data.publishDate).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <Layout RigthSide={true}>
      <h1>{data.title}</h1>
      {data.featuredMedia && data.featuredMedia.url && (
        <img src={data.featuredMedia.url} alt={data.title} style={{ maxWidth: '100%' }} />
      )}
     
      {/* Yayınlanma Tarihi */}
      <Typography variant="body2" align="right" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
        {formattedDate}
      </Typography>
     
      <div>
        <div key={data.title} dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </Layout>
  );
}
const apiBaseUrl = process.env.API_BASE_URL;
export async function getServerSideProps(context) {
  // API'den veri çekme
  console.log(`${apiBaseUrl}/contents/slug/icerik/${context.params.slug}`)
  const res = await fetch(`${apiBaseUrl}/contents/slug/icerik/${context.params.slug}`);
  const data = await res.json();

  // `data.root.children`'ı serialize fonksiyonu ile işleme
  // const htmlContent = serialize(data.bodyHtml);
  console.log("data",data)
  const htmlContent = data.bodyHtml;
  
  // HTML içeriğini props olarak döndürme
  return { props: { htmlContent ,data } };
}

export default IcerikPage;