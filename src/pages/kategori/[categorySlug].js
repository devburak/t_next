// pages/[categorySlug].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Pagination, Typography, Grid } from '@mui/material';
import ContentListItem from '../../component/ContentListItem';
import Layout from '../../component/basic/layout';
import PeriodComponent from '../../component/PeriodComponent';
import Head from 'next/head';
import { buildCanonicalUrl, buildMetaDescription } from '../../lib/seo';
import { getCategoryDisplayName, getCategoryHeading } from '../../lib/categoryText';

const CategoryPage = ({ categorySlug, initialContents, initialTotalPages, category }) => {
  const router = useRouter();
  const [contents, setContents] = useState(initialContents);
  const [totalPages, setTotalPages] = useState(initialTotalPages); // Başlangıç değeri SSR'dan gelen değer
  const [page, setPage] = useState(parseInt(router.query.page) || 1);
  const [periodId, setPeriodId] = useState(router.query.periodId || null);
  const categoryName = getCategoryDisplayName(category.name || categorySlug);
  const categoryHeading = getCategoryHeading(category.name || categorySlug);

  const canonicalUrl = buildCanonicalUrl(`/kategori/${categorySlug}`);
  const description = buildMetaDescription(`${categoryName} kategorisindeki içerikleri keşfedin.`);
  const keywords = `${categoryName}, TMMOB, içerikler, mühendislik, mimarlık`;

  // Fetch içerikleri
  const fetchContents = async () => {
    const queryParams = new URLSearchParams({
      page,
      ...(periodId && { periodId }),
    });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/contents/category/${categorySlug}?${queryParams}`);
      const data = await res.json();
      setContents(data.contents);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Veri çekme hatası:', error);
    }
  };

  // URL'den gelen parametreleri oku ve fetch işlemini tetikle
  useEffect(() => {
    fetchContents();
  }, [ page, periodId]);

  // Sayfa değiştirildiğinde shallow routing
  const handlePageChange = (event, value) => {
    setPage(value);

    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, page: value },
      },
      undefined,
      { shallow: true }
    );
  };

  useEffect(() => {
  
    handlePageChange(null, 1);
    handlePeriodChange(router.query.periodId)
  },
    [router.query.periodId]);

  // Period değiştirildiğinde shallow routing
  const handlePeriodChange = (newPeriodId) => {
    setPage(1); // Sayfa numarasını sıfırla
    setPeriodId(newPeriodId);
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, periodId: newPeriodId || undefined }, // Eğer periodId boşsa query'den kaldır
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <Layout>
      {/* Head Meta Tags */}
      <Head>
        <title>{categoryName} | TMMOB</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={categoryName} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://storage.ikon-x.com.tr/default.png" />
      </Head>

      <Container maxWidth="md">
        {/* Başlık ve PeriodComponent */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={9}>
            <Typography variant="h4" component="h1" gutterBottom>
              {categoryHeading}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <PeriodComponent onPeriodChange={handlePeriodChange} />
          </Grid>
        </Grid>

        {/* İçerik Listesi */}
        {contents.map((content) => (
          <ContentListItem
            key={content.slug}
            title={content.title}
            publishDate={content.publishDate}
            featuredMedia={content.featuredMedia}
            spot={content.spot}
            link={`/${content.slug}`}
          />
        ))}

        {/* Sayfalama */}
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          sx={{ marginTop: 4, display: 'flex', justifyContent: 'center' }}
        />
      </Container>
    </Layout>
  );
};

// Server-Side Rendering
export async function getServerSideProps({ params, query }) {
  const { categorySlug } = params;
  const page = parseInt(query.page) || 1;
  const periodId = query.periodId || null;

  const queryParams = new URLSearchParams({
    page,
    ...(periodId && { periodId }),
  });

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/contents/category/${categorySlug}?${queryParams}`);

    if (!res.ok) {
      return { notFound: true };
    }

    const data = await res.json();

    return {
      props: {
        category: data.category || {},
        categorySlug,
        initialContents: data.contents || [],
        initialTotalPages: data.totalPages || 1,
      },
    };
  } catch (error) {
    console.error('Veri çekme hatası:', error);
    return { notFound: true };
  }
}

export default CategoryPage;
