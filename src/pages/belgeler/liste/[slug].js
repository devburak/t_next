// src/pages/belgeler/[slug].js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Pagination, Typography, Grid } from '@mui/material';
import ContentListItem from '../../../component/ContentListItem';
import Layout from '../../../component/basic/layout';
import PeriodComponent from '../../../component/PeriodComponent';
import Head from 'next/head';
import { buildCanonicalUrl, buildMetaDescription } from '../../../lib/seo';
import { getCategoryDisplayName, getCategoryHeading } from '../../../lib/categoryText';

const BelgelerCategoryPage = ({ slug, initialContents, initialTotalPages, category }) => {
  const router = useRouter();
  const [contents, setContents] = useState(initialContents);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [page, setPage] = useState(parseInt(router.query.page) || 1);
  const [periodId, setPeriodId] = useState(router.query.periodId || null);
  const categoryName = getCategoryDisplayName(category.name || slug);
  const categoryHeading = getCategoryHeading(category.name || slug);

  const canonicalUrl = buildCanonicalUrl(`/belgeler/liste/${slug}`);
  const description = buildMetaDescription(`${categoryName} kategorisindeki içerikleri keşfedin.`);
  const keywords = `${categoryName}, TMMOB, içerikler, mühendislik, mimarlık`;

  // İçerikleri getir
  const fetchContents = async () => {
    const queryParams = new URLSearchParams({
      page,
      ...(periodId && { periodId }),
    });
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/contents/category/belgeler/${slug}?${queryParams}`
      );
      const data = await res.json();
      setContents(data.contents);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Veri çekme hatası:', error);
    }
  };

  useEffect(() => {
    fetchContents();
    // eslint-disable-next-line
  }, [page, periodId, slug]);

  // Sayfa değişiminde shallow routing
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
    handlePeriodChange(router.query.periodId);
    // eslint-disable-next-line
  }, [router.query.periodId]);

  const handlePeriodChange = (newPeriodId) => {
    setPage(1);
    setPeriodId(newPeriodId);
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, periodId: newPeriodId || undefined },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <Layout>
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

        {contents.map((content) => (
          <ContentListItem
            key={content.slug}
            title={content.title}
            publishDate={content.publishDate}
            featuredMedia={content.featuredMedia}
            spot={content.spot}
            link={`/belgeler/${content.slug}`}
          />
        ))}

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

export async function getServerSideProps({ params, query }) {
  const { slug } = params;
  const page = parseInt(query.page) || 1;
  const periodId = query.periodId || null;

  const queryParams = new URLSearchParams({
    page,
    ...(periodId && { periodId }),
  });

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/contents/category/belgeler/${slug}?${queryParams}`
    );
    if (!res.ok) {
      return { notFound: true };
    }
    const data = await res.json();

    return {
      props: {
        category: data.category || {},
        slug,
        initialContents: data.contents || [],
        initialTotalPages: data.totalPages || 1,
      },
    };
  } catch (error) {
    console.error('Veri çekme hatası:', error);
    return { notFound: true };
  }
}

export default BelgelerCategoryPage;
