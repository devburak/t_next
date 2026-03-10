import { Global, css } from '@emotion/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../component/basic/layout';
import { Container, Typography, Grid, Box } from '@mui/material';
import PeriodComponent from '../../component/PeriodComponent';
import ContentShareBar from '../../component/basic/ContentShareBar';
import Head from 'next/head';
import { buildCanonicalUrl, buildMetaDescription, DEFAULT_OG_IMAGE } from '../../lib/seo';

const CATEGORY_SLUG = 'denetleme-kurulu';

const DenetlemeKuruluPage = ({ initialContent, initialPeriods, initialPeriodId }) => {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [periods, setPeriods] = useState(initialPeriods);
  const [periodId, setPeriodId] = useState(initialPeriodId);

  useEffect(() => {
    if (router.query.periodId && router.query.periodId !== periodId) {
      setPeriodId(router.query.periodId);
    }
    // eslint-disable-next-line
  }, [router.query.periodId]);

  useEffect(() => {
    const fetchContent = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/contents/fullcategory/${CATEGORY_SLUG}?periodId=${periodId}`
      );
      const data = await res.json();
      setContent(data.contents?.[0] || null);
    };
    if (periodId) fetchContent();
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

  const title = content?.title || 'Denetleme Kurulu';
  const description = buildMetaDescription(
    content?.spot || content?.bodyHtml || 'TMMOB Denetleme Kurulu üyeleri ve bilgileri.'
  );
  const canonicalUrl = buildCanonicalUrl('/tmmob/denetleme-kurulu');
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
        <meta name="keywords" content="TMMOB, denetleme kurulu, dönem, denetim" />
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
              periods={periods}
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
            <Typography color="text.secondary">İçerik bulunamadı.</Typography>
          )}
        </Box>
      </Container>
    </Layout>
  );
};

export async function getServerSideProps({ query }) {
  let periods = [];
  try {
    const periodRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/periods`);
    const p = await periodRes.json();
    periods = p.periods || [];
  } catch (err) {
    periods = [];
  }

  const periodId = query.periodId || (periods.length > 0 ? periods[0]._id : null);

  let content = null;
  try {
    if (periodId) {
      const contentRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/contents/fullcategory/denetleme-kurulu?periodId=${periodId}`
      );
      const data = await contentRes.json();
      content = data.contents?.[0] || null;
    }
  } catch (err) {
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

export default DenetlemeKuruluPage;
