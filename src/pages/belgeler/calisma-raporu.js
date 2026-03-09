import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../component/basic/layout';
import { Container, Typography, Grid, Box } from '@mui/material';
import PeriodComponent from '../../component/PeriodComponent';
import Head from 'next/head';
import { buildCanonicalUrl, buildMetaDescription, DEFAULT_OG_IMAGE } from '../../lib/seo';

const CATEGORY_PATH_CANDIDATES = ['belgeler/calisma-raporu', 'calisma-raporu'];
const DEFAULT_TITLE = 'Calisma Raporu';
const DEFAULT_DESCRIPTION = 'TMMOB calisma raporlarina bu sayfadan ulasabilirsiniz.';

function normalizePeriodId(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function extractPeriodId(content) {
  if (!content?.period) {
    return '';
  }

  if (typeof content.period === 'object') {
    return normalizePeriodId(content.period._id || content.period.id);
  }

  return normalizePeriodId(content.period);
}

async function fetchCategoryContent({
  apiBaseUrl,
  periodId = '',
  allowNoPeriodFallback = false,
}) {
  const normalizedApiBaseUrl = String(apiBaseUrl || '').trim();
  if (!normalizedApiBaseUrl) {
    return { content: null, periodId: normalizePeriodId(periodId) };
  }

  const normalizedPeriodId = normalizePeriodId(periodId);
  const periodCandidates = normalizedPeriodId
    ? allowNoPeriodFallback
      ? [normalizedPeriodId, '']
      : [normalizedPeriodId]
    : [''];

  for (const categoryPath of CATEGORY_PATH_CANDIDATES) {
    for (const candidatePeriodId of periodCandidates) {
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '1',
        ...(candidatePeriodId ? { periodId: candidatePeriodId } : {}),
      });

      try {
        const res = await fetch(
          `${normalizedApiBaseUrl}/contents/fullcategory/${categoryPath}?${queryParams.toString()}`
        );

        if (!res.ok) {
          continue;
        }

        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          continue;
        }

        const data = await res.json();
        const content = Array.isArray(data?.contents) ? data.contents[0] : null;
        if (content) {
          return {
            content,
            periodId: candidatePeriodId || extractPeriodId(content),
          };
        }
      } catch (error) {
        // Try the next category path candidate.
      }
    }
  }

  return { content: null, periodId: normalizedPeriodId };
}

const CalismaRaporuPage = ({ initialContent, initialPeriods, initialPeriodId }) => {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [periodId, setPeriodId] = useState(normalizePeriodId(initialPeriodId));

  useEffect(() => {
    const queryPeriodId = normalizePeriodId(router.query.periodId);
    if (queryPeriodId && queryPeriodId !== periodId) {
      setPeriodId(queryPeriodId);
    }
  }, [periodId, router.query.periodId]);

  useEffect(() => {
    let isCancelled = false;

    const fetchContent = async () => {
      const result = await fetchCategoryContent({
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
        periodId,
        // If query has no explicit period, fall back to the latest available content.
        allowNoPeriodFallback: !normalizePeriodId(router.query.periodId),
      });

      if (isCancelled) {
        return;
      }

      setContent(result.content || null);

      if (!normalizePeriodId(router.query.periodId) && result.periodId && result.periodId !== periodId) {
        setPeriodId(result.periodId);
      }
    };

    fetchContent();

    return () => {
      isCancelled = true;
    };
  }, [periodId, router.query.periodId]);

  const handlePeriodChange = (newPeriodId) => {
    const normalizedNewPeriodId = normalizePeriodId(newPeriodId);
    setPeriodId(normalizedNewPeriodId);
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, periodId: normalizedNewPeriodId || undefined },
      },
      undefined,
      { shallow: true }
    );
  };

  const title = content?.title || DEFAULT_TITLE;
  const description = buildMetaDescription(
    content?.spot || content?.bodyHtml || DEFAULT_DESCRIPTION
  );
  const canonicalUrl = buildCanonicalUrl('/belgeler/calisma-raporu');

  return (
    <Layout>
      <Head>
        <title>{title} | TMMOB</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="TMMOB, calisma raporu, donem, belgeler" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${title} | TMMOB`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
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
    const periodRes = await fetch(`${apiBaseUrl}/periods`);
    const payload = periodRes.ok ? await periodRes.json() : {};
    periods = Array.isArray(payload?.periods)
      ? payload.periods
      : Array.isArray(payload?.data)
      ? payload.data
      : [];
  } catch (error) {
    periods = [];
  }

  const periodId =
    normalizePeriodId(query?.periodId) || normalizePeriodId(periods[0]?._id);

  let result;
  if (normalizePeriodId(query?.periodId)) {
    result = await fetchCategoryContent({
      apiBaseUrl,
      periodId,
      allowNoPeriodFallback: false,
    });
  } else {
    result = await fetchCategoryContent({
      apiBaseUrl,
      periodId,
      allowNoPeriodFallback: true,
    });
  }

  if (!result?.content && periodId) {
    result = await fetchCategoryContent({
      apiBaseUrl,
      periodId,
      allowNoPeriodFallback: false,
    });
  }

  return {
    props: {
      initialContent: result?.content || null,
      initialPeriods: periods,
      initialPeriodId: result?.periodId || periodId || '',
    },
  };
}

export default CalismaRaporuPage;
