import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Pagination, Typography, Grid } from '@mui/material';
import Head from 'next/head';
import ContentListItem from '../ContentListItem';
import Layout from './layout';
import PeriodComponent from '../PeriodComponent';
import { buildCanonicalUrl, buildMetaDescription } from '../../lib/seo';
import { getCategoryDisplayName, getCategoryHeading } from '../../lib/categoryText';
import { buildSectionPagePath, buildSectionPath } from '../../lib/sectionRouting';

export default function SectionCategoryListPage({
  section,
  slug = '',
  category,
  initialContents,
  initialTotalPages,
  allowPeriodFilter = true,
  categoryPathOverride = '',
}) {
  const router = useRouter();
  const [contents, setContents] = useState(initialContents);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [page, setPage] = useState(parseInt(router.query.page, 10) || 1);
  const [periodId, setPeriodId] = useState(
    allowPeriodFilter ? router.query.periodId || null : null
  );

  const routePath = buildSectionPagePath(section, slug);
  const categoryPath = String(categoryPathOverride || '').trim() || buildSectionPath(section, slug);
  const categoryName = getCategoryDisplayName(category?.name || slug || section);
  const categoryHeading = getCategoryHeading(category?.name || slug || section);
  const canonicalUrl = buildCanonicalUrl(routePath);
  const description = buildMetaDescription(
    `${categoryName} kategorisindeki içerikleri keşfedin.`
  );
  const keywords = `${categoryName}, TMMOB, içerikler, mühendislik, mimarlık`;

  const fetchContents = async () => {
    const queryParams = new URLSearchParams({
      page: String(page),
      ...(allowPeriodFilter && periodId ? { periodId } : {}),
    });

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/contents/category/${categoryPath}?${queryParams.toString()}`
      );
      const data = await res.json();
      setContents(data.contents || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Veri çekme hatası:', error);
    }
  };

  useEffect(() => {
    fetchContents();
    // eslint-disable-next-line
  }, [page, periodId, categoryPath, allowPeriodFilter]);

  const handlePageChange = (event, value) => {
    setPage(value);
    const nextQuery = {
      ...router.query,
      page: value,
    };

    if (!allowPeriodFilter) {
      delete nextQuery.periodId;
    }

    router.push(
      {
        pathname: router.pathname,
        query: nextQuery,
      },
      undefined,
      { shallow: true }
    );
  };

  const handlePeriodChange = (newPeriodId) => {
    if (!allowPeriodFilter) {
      return;
    }

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

  useEffect(() => {
    if (!allowPeriodFilter) {
      return;
    }

    handlePageChange(null, 1);
    handlePeriodChange(router.query.periodId);
    // eslint-disable-next-line
  }, [router.query.periodId, allowPeriodFilter]);

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
          {allowPeriodFilter ? (
            <Grid item xs={12} sm={3}>
              <PeriodComponent onPeriodChange={handlePeriodChange} />
            </Grid>
          ) : null}
        </Grid>

        {contents.map((content) => (
          <ContentListItem
            key={content.slug}
            title={content.title}
            publishDate={content.publishDate}
            featuredMedia={content.featuredMedia}
            spot={content.spot}
            link={`/${section}/${content.slug}`}
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
}
