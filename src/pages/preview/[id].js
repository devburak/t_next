 import ContentPageRenderer from '../../component/basic/ContentPageRenderer';

function PreviewPage({ htmlContent, data }) {
  return <ContentPageRenderer htmlContent={htmlContent} data={data} />;
}

export async function getServerSideProps(context) {
  const { id } = context?.params;
  const token = context?.query?.token || '';
  const apiBaseUrl = process.env.API_BASE_URL;

//   if (!token) {
//     return {
//       notFound: true,
//     };
//   }
console.log("url",`${apiBaseUrl}/contents/${id}`)
  try {
    const response = await fetch(`${apiBaseUrl}/contents/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch content');
    }

    const data = await response.json();
    const htmlContent = data.bodyHtml || '';

    return {
      props: {
        htmlContent,
        data,
      },
    };
  } catch (error) {
    console.error('Error fetching content:', error);
    return {
      notFound: true,
    };
  }
}

export default PreviewPage;
