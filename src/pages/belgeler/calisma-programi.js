import { Global, css } from '@emotion/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../component/basic/layout';
import { Container, Typography, Grid, Box } from '@mui/material';
import PeriodComponent from '../../component/PeriodComponent';
import ContentShareBar from '../../component/basic/ContentShareBar';
import Head from 'next/head';
import { buildCanonicalUrl, buildMetaDescription, DEFAULT_OG_IMAGE } from '../../lib/seo';

const CATEGORY_PATH_CANDIDATES = ['belgeler/calisma-programi', 'calisma-programi'];

async function fetchCalismaProgramiContent(apiBaseUrl, periodId) {
  for (const categoryPath of CATEGORY_PATH_CANDIDATES) {
    try {
      const queryParams = new URLSearchParams();
      if (periodId) {
        queryParams.set('periodId', String(periodId));
      }

      const response = await fetch(
        `${apiBaseUrl}/contents/fullcategory/${categoryPath}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      );

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const content = data?.contents?.[0] || null;
      if (content) {
        return content;
      }
    } catch (error) {
      // Try the next category path candidate.
    }
  }

  return null;
}

const CalismaProgramiPage = ({ initialContent, initialPeriods, initialPeriodId }) => {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [periodId, setPeriodId] = useState(initialPeriodId);

  useEffect(() => {
    if (router.query.periodId && router.query.periodId !== periodId) {
      setPeriodId(router.query.periodId);
    }
    // eslint-disable-next-line
  }, [router.query.periodId]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await fetchCalismaProgramiContent(
          process.env.NEXT_PUBLIC_API_BASE_URL,
          periodId
        );
        setContent(data);
      } catch (error) {
        console.error('Calisma programi icerigi alinamadi:', error);
        setContent(null);
      }
    };

    if (periodId) {
      fetchContent();
    }
    // eslint-disable-next-line
  }, [periodId]);

  const handlePeriodChange = (newPeriodId) => {
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

  const title = content?.title || 'Calisma Programi';
  const description = buildMetaDescription(
    content?.spot || content?.bodyHtml || 'TMMOB Calisma Programi icerikleri.'
  );
  const canonicalUrl = buildCanonicalUrl('/belgeler/calisma-programi');
  const ogImage = DEFAULT_OG_IMAGE;
  const imageUrl = content?.featuredMedia?.url || ogImage;
  const shareTitle = `${title} | TMMOB`;

  return (
    <Layout>
      <Global
        styles={css`
          body {
            margin: 0;
            color: rgba(0, 0, 0, 0.87);
            font-size: 0.7rem;
            font-weight: 400;
            line-height: 1rem;
            letter-spacing: 0.00938em;
            background-color: #ffffff;
          }
        `}
      />
      <Head>
        <title>{shareTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="TMMOB, calisma programi, donem, belgeler" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:site_name" content="TMMOB" />
        <meta property="og:locale" content="tr_TR" />
        <meta property="og:title" content={shareTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:alt" content={title || 'TMMOB içerik'} />
        <meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
        <meta name="twitter:title" content={shareTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:image:alt" content={title || 'TMMOB içerik'} />
      </Head>
      <Container maxWidth="md" sx={{ mt: 6 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={9}>
            <Typography variant="h4" component="h1" gutterBottom>
              {title}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <PeriodComponent
              periods={initialPeriods}
              value={periodId}
              onPeriodChange={handlePeriodChange}
            />
          </Grid>
        </Grid>
        <ContentShareBar title={title} url={canonicalUrl} />
        <Box sx={{ mt: 4 }}>
          {content?.bodyHtml ? (
            <div dangerouslySetInnerHTML={{ __html: content.bodyHtml }} />
          ) : (
            <Typography color="text.secondary">Icerik bulunamadi.</Typography>
          )}
        </Box>
      </Container>
    </Layout>
  );
};

export async function getServerSideProps({ query }) {
  const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

  let periods = [];
  try {
    const periodResponse = await fetch(`${apiBaseUrl}/periods`);
    const payload = await periodResponse.json();
    periods = payload.periods || [];
  } catch (error) {
    periods = [];
  }

  const periodId = query.periodId || (periods.length > 0 ? periods[0]._id : null);

  let content = null;
  try {
    if (periodId) {
      content = await fetchCalismaProgramiContent(apiBaseUrl, periodId);
    }
  } catch (error) {
    content = null;
  }

  return {
    props: {
      initialContent: content,
      initialPeriods: periods,
      initialPeriodId: periodId,
    },
  };
}

export default CalismaProgramiPage;
