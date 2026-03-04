import SectionCategoryListPage from '../../component/basic/SectionCategoryListPage';
import { fetchSectionCategoryPayload } from '../../lib/sectionRouting';

const apiBaseUrl = process.env.API_BASE_URL;
const SECTION = 'tmmob';

export default function TmmobCategoryIndex({
  category,
  initialContents,
  initialTotalPages,
}) {
  return (
    <SectionCategoryListPage
      section={SECTION}
      category={category}
      initialContents={initialContents}
      initialTotalPages={initialTotalPages}
    />
  );
}

export async function getServerSideProps({ query }) {
  try {
    const categoryPayload = await fetchSectionCategoryPayload({
      apiBaseUrl,
      section: SECTION,
      query,
    });

    if (!categoryPayload?.category?._id) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        category: categoryPayload.category || {},
        initialContents: categoryPayload.contents || [],
        initialTotalPages: categoryPayload.totalPages || 1,
      },
    };
  } catch (error) {
    console.error('TMMOB category index fetch error:', error);
    return {
      notFound: true,
    };
  }
}
