import ContentPageRenderer from '../../component/basic/ContentPageRenderer';
import SectionCategoryListPage from '../../component/basic/SectionCategoryListPage';
import {
  fetchSectionCategoryPayload,
  shouldResolveSectionCategory,
} from '../../lib/sectionRouting';

const apiBaseUrl = process.env.API_BASE_URL;
const SECTION = 'hukuk';

function HukukContentPage({
  pageType = 'content',
  htmlContent,
  data,
  slug = '',
  category = {},
  initialContents = [],
  initialTotalPages = 1,
}) {
  if (pageType === 'category') {
    return (
      <SectionCategoryListPage
        section={SECTION}
        slug={slug}
        category={category}
        initialContents={initialContents}
        initialTotalPages={initialTotalPages}
      />
    );
  }

  return (
    <ContentPageRenderer
      htmlContent={htmlContent}
      data={data}
      canonicalPath={data?.slug ? `/hukuk/${data.slug}` : ''}
      showPublishDate={false}
    />
  );
}

export async function getServerSideProps({ params, query }) {
  try {
    const slug = String(params?.slug || '').trim();

    if (!slug) {
      return {
        notFound: true,
      };
    }

    if (shouldResolveSectionCategory(SECTION, slug)) {
      const categoryPayload = await fetchSectionCategoryPayload({
        apiBaseUrl,
        section: SECTION,
        slug,
        query,
      });

      if (categoryPayload?.category?._id) {
        return {
          props: {
            pageType: 'category',
            slug,
            category: categoryPayload.category || {},
            initialContents: categoryPayload.contents || [],
            initialTotalPages: categoryPayload.totalPages || 1,
          },
        };
      }
    }

    const res = await fetch(`${apiBaseUrl}/contents/slug/${slug}`);
    if (!res.ok) {
      return {
        notFound: true,
      };
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return {
        notFound: true,
      };
    }

    const data = await res.json();
    const htmlContent = data?.bodyHtml || '';

    return {
      props: {
        htmlContent,
        data,
      },
    };
  } catch (error) {
    console.error('Hukuk content fetch error:', error);
    return {
      notFound: true,
    };
  }
}

export default HukukContentPage;
