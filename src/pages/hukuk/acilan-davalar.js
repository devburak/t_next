function buildQueryString(query = {}) {
  const params = new URLSearchParams();

  Object.entries(query || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== null && item !== undefined && String(item).trim() !== '') {
          params.append(key, String(item));
        }
      });
      return;
    }

    if (value !== null && value !== undefined && String(value).trim() !== '') {
      params.append(key, String(value));
    }
  });

  return params.toString();
}

export async function getServerSideProps({ query }) {
  const queryString = buildQueryString(query);

  return {
    redirect: {
      destination: `/kategori/acilan-davalar${queryString ? `?${queryString}` : ''}`,
      permanent: true,
    },
  };
}

export default function HukukAcilanDavalarRedirectPage() {
  return null;
}
