import SectionCategoryListPage from '../../component/basic/SectionCategoryListPage';
import { fetchSectionCategoryPayload } from '../../lib/sectionRouting';

const apiBaseUrl = process.env.API_BASE_URL;
const SECTION = 'hukuk';
const ROUTE_SLUG = 'yonetmelikler';
const CATEGORY_PATH_OVERRIDE = 'yonetmelikler';

export default function HukukYonetmeliklerPage({
  category,
  initialContents,
  initialTotalPages,
}) {
  return (
    <SectionCategoryListPage
      section={SECTION}
      slug={ROUTE_SLUG}
      category={category}
      initialContents={initialContents}
      initialTotalPages={initialTotalPages}
      allowPeriodFilter={false}
      categoryPathOverride={CATEGORY_PATH_OVERRIDE}
    />
  );
}

export async function getServerSideProps({ query }) {
  try {
    let categoryPayload = await fetchSectionCategoryPayload({
      apiBaseUrl,
      section: SECTION,
      slug: ROUTE_SLUG,
      query,
      includePeriod: false,
      categoryPathOverride: CATEGORY_PATH_OVERRIDE,
    });

    // Fallback: if category tree is nested as hukuk/yonetmelikler.
    if (!categoryPayload?.category?._id) {
      categoryPayload = await fetchSectionCategoryPayload({
        apiBaseUrl,
        section: SECTION,
        slug: ROUTE_SLUG,
        query,
        includePeriod: false,
      });
    }

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
    console.error('Hukuk yonetmelikler fetch error:', error);
    return {
      notFound: true,
    };
  }
}
