const apiBaseUrl = process.env.API_BASE_URL;

export async function getServerSideProps({ params, query }) {
  try {
    const slug = String(params?.slug || '').trim();

    if (!slug) {
      return {
        notFound: true,
      };
    }

    const res = await fetch(`${apiBaseUrl}/contents/slug/${slug}`);

    if (!res.ok) {
      return {
        notFound: true,
      };
    }

    const data = await res.json();
    const searchParams = new URLSearchParams(query || {});
    const queryString = searchParams.toString();

    return {
      redirect: {
        destination: `/${data?.slug || slug}${queryString ? `?${queryString}` : ''}`,
        permanent: true,
      },
    };
  } catch (error) {
    console.error('Icerik page redirect error:', error);
    return {
      notFound: true,
    };
  }
}

export default function IcerikRedirectPage() {
  return null;
}
