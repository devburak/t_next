 import ContentPageRenderer from '../../component/basic/ContentPageRenderer';

function PreviewPage({ htmlContent, data }) {
  return (
    <ContentPageRenderer
      htmlContent={htmlContent}
      data={data}
      canonicalPath={data?.slug ? `/${data.slug}` : ''}
      metaRobots="noindex,nofollow"
    />
  );
}

export async function getServerSideProps(context) {
  const { id } = context?.params;
  context.res.setHeader('Cache-Control', 'private, no-store');
  context.res.setHeader('Referrer-Policy', 'no-referrer');
  const token = context?.query?.preview;
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return { notFound: true };
  const apiBaseUrl = process.env.API_BASE_URL;

  try {
    const response = await fetch(`${apiBaseUrl}/contents/preview/${token}`, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error('Failed to fetch content');
    }

    const data = await response.json();
    if (String(data._id) !== id) return { notFound: true };
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
