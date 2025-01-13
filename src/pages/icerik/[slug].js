
import ContentPageRenderer from '../../component/basic/ContentPageRenderer';

function IcerikPage({ htmlContent,data }) {

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

  return (
    <ContentPageRenderer htmlContent={htmlContent} data={data}  />
  );
}
const apiBaseUrl = process.env.API_BASE_URL;
export async function getServerSideProps(context) {
  // API'den veri çekme
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