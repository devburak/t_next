import { Global, css } from '@emotion/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../component/basic/layout';
import { Container, Typography, Grid, Box } from '@mui/material';
import PeriodComponent from '../../component/PeriodComponent';
import Head from 'next/head';
import { buildCanonicalUrl, buildMetaDescription, DEFAULT_OG_IMAGE } from '../../lib/seo';


const CATEGORY_SLUG = 'yonetim-kurulu';

const YonetimKuruluPage = ({ initialContent, initialPeriods, initialPeriodId }) => {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [periods, setPeriods] = useState(initialPeriods);
  const [periodId, setPeriodId] = useState(initialPeriodId);

  // Period değiştiğinde içerik fetchle
  useEffect(() => {
    // URL'deki periodId parametresi değişirse veya history ile gelinirse trigger et!
    if (router.query.periodId && router.query.periodId !== periodId) {
      setPeriodId(router.query.periodId);
    }
    // eslint-disable-next-line
  }, [router.query.periodId]);

  useEffect(() => {
    // İlk yüklemede tekrar fetch yapmaya gerek yok
    //if (periodId === initialPeriodId && content) return;

    const fetchContent = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/contents/fullcategory/${CATEGORY_SLUG}?periodId=${periodId}`
      );
      const data = await res.json();
      // API'den dizi dönse de, tek içerik gelecek!
      setContent(data.contents?.[0] || null);
    };
    if (periodId) fetchContent();
    // eslint-disable-next-line
  }, [periodId]);

  // Period değiştiğinde shallow routing ile URL'i güncelle
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

  // "Geri" ile gelince, useEffect router.query.periodId'i dinliyor ve trigger ediyor!

  const title = content?.title || "Yönetim Kurulu";
  const description = buildMetaDescription(content?.spot || content?.bodyHtml || "TMMOB Yönetim Kurulu üyeleri ve bilgileri.");
  const canonicalUrl = buildCanonicalUrl('/tmmob/yonetim-kurulu');
  const ogImage = DEFAULT_OG_IMAGE;

  return (
    <Layout>
          <Global styles={css`
  body {
    margin: 0;
    color: rgba(0, 0, 0, 0.87);
    font-size: 0.7rem;
    font-weight: 400;
    line-height: 1rem;
    letter-spacing: 0.00938em;
    background-color: #ffffff;
  }
`} />
      <Head>
        <title>{title} | TMMOB</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={`TMMOB, yönetim kurulu, dönem, yönetim`} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={title + " | TMMOB"} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
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
    // 1. Periodları çek
    let periods = [];
    try {
      const periodRes =  await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/periods`);
    const  p = await periodRes.json();
        periods = p.periods || [];
        
    } catch (err) {
      // Hata olsa da sayfa çökmemeli
      periods = [];
    }
 
    // 2. Default periodId: url'den yoksa periods[0]._id
    let periodId = query.periodId || (periods.length > 0 ? periods[0]._id : null);

    // 3. Yönetim Kurulu içeriğini çek
    let content = null;
    try {
      if (periodId) {
        const contentRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/contents/fullcategory/yonetim-kurulu?periodId=${periodId}`
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

export default YonetimKuruluPage;
