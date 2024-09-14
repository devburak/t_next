import Layout from '../../component/basic/layout'
import { serialize } from '../../component/LX/NewRichTextParser'; 

function IcerikPage({ htmlContent,data }) {
  return (
    <Layout>
      <h1>{data.title}</h1>
      {data.images[0] && data.images[0].fileUrl && (
        <img src={data.images[0].fileUrl} alt={data.title} style={{ maxWidth: '100%' }} />
      )}
      <div>
        {htmlContent.map((htmlContentItem, index) => (
          <div key={index} dangerouslySetInnerHTML={{ __html: htmlContentItem }} />
        ))}
      </div>
    </Layout>
  );
}
const apiBaseUrl = process.env.API_BASE_URL;
export async function getServerSideProps(context) {
  // API'den veri çekme
  const res = await fetch(`${apiBaseUrl}/content/slug/${context.params.slug}`);
  const data = await res.json();

  // `data.root.children`'ı serialize fonksiyonu ile işleme
  const htmlContent = serialize(data.root.children);
  
  // HTML içeriğini props olarak döndürme
  return { props: { htmlContent ,data } };
}

export default IcerikPage;