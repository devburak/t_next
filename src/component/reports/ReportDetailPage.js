import Head from 'next/head';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import Layout from '../basic/layout';
import ContentShareBar from '../basic/ContentShareBar';
import FeaturedImage from '../basic/FeaturedImage';
import PublishDate from '../basic/PublishDate';
import SpotText from '../basic/SpotText';
import {
  buildCanonicalUrl,
  buildMetaDescription,
  DEFAULT_META_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  toIsoDate,
} from '../../lib/seo';
import { getReportDisplayTitle } from '../../lib/reportText';

function formatDate(value) {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function buildMetaItems(report) {
  return [
    { label: 'Rapor Kategorisi', value: report?.reportCategory?.name || '' },
    { label: 'Dönem', value: report?.period?.name || '' },
    { label: 'Çalışma Grubu', value: report?.workGroup?.name || '' },
    { label: 'Toplantı No', value: report?.meetingNo || '' },
    { label: 'Toplantı Tarihi', value: formatDate(report?.meetingDate) },
    { label: 'Toplantı Yeri', value: report?.meetingLocation || '' },
  ].filter((item) => item.value);
}

export default function ReportDetailPage({ report }) {
  if (!report) {
    return null;
  }

  const displayTitle = getReportDisplayTitle(report);
  const canonicalUrl = buildCanonicalUrl(`/belgeler/${report.slug || report._id}`);
  const description = buildMetaDescription(
    report.spot || report.bodyHtml || report.title,
    DEFAULT_META_DESCRIPTION
  );
  const imageUrl = report?.featuredMedia?.url || DEFAULT_OG_IMAGE;
  const publishedTime = toIsoDate(report?.publishDate);
  const modifiedTime = toIsoDate(report?.updatedAt || report?.publishDate);
  const metaItems = buildMetaItems(report);
  const shareTitle = displayTitle ? `${displayTitle} | TMMOB` : 'TMMOB';
  const hasFeaturedImage = Boolean(report?.featuredMedia?.url);
  const keywords = [
    'TMMOB',
    'rapor',
    report?.reportCategory?.name || '',
    report?.period?.name || '',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Layout RigthSide={true}>
      <Head>
        <title>{shareTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:site_name" content="TMMOB" />
        <meta property="og:locale" content="tr_TR" />
        <meta property="og:type" content={publishedTime ? 'article' : 'website'} />
        <meta property="og:title" content={shareTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:alt" content={report.title || 'TMMOB rapor'} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
        <meta name="twitter:title" content={shareTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        {report?.reportCategory?.name ? (
          <meta property="article:section" content={report.reportCategory.name} />
        ) : null}
        {publishedTime ? <meta property="article:published_time" content={publishedTime} /> : null}
        {modifiedTime ? <meta property="article:modified_time" content={modifiedTime} /> : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': publishedTime ? 'Article' : 'WebPage',
              headline: displayTitle || 'TMMOB rapor',
              description,
              url: canonicalUrl,
              image: imageUrl,
              datePublished: publishedTime,
              dateModified: modifiedTime,
              author: {
                '@type': 'Organization',
                name: 'TMMOB',
                url: 'https://tmmob.org.tr',
              },
            }),
          }}
        />
      </Head>

      <Container maxWidth="md">
        <Box className="content-print-root" sx={{ backgroundColor: '#fff', p: 2, overflow: 'hidden' }}>
          <Typography
            className="content-print-title"
            component="h1"
            sx={{ fontWeight: 700, fontSize: '1.9rem', lineHeight: 1.25, mb: 1.5 }}
          >
            {displayTitle}
          </Typography>

          {!hasFeaturedImage ? <ContentShareBar title={displayTitle} url={canonicalUrl} /> : null}

          <Box className="content-print-featured">
            <FeaturedImage url={report?.featuredMedia?.url} alt={report.title} />
          </Box>

          {hasFeaturedImage ? <ContentShareBar title={displayTitle} url={canonicalUrl} /> : null}

          <Box className="content-print-date">
            <PublishDate date={report.publishDate} />
          </Box>

          {report.spot ? (
            <Box className="content-print-spot">
              <SpotText text={report.spot} />
            </Box>
          ) : null}

          {metaItems.length > 0 ? (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                backgroundColor: 'rgba(17, 24, 39, 0.02)',
              }}
            >
              <Grid container spacing={2}>
                {metaItems.map((item) => (
                  <Grid item xs={12} sm={6} key={item.label}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {item.value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          ) : null}

          <Box className="content-print-body" sx={{ overflowX: 'auto', pt: 2 }}>
            <div dangerouslySetInnerHTML={{ __html: report.bodyHtml || '' }} />
          </Box>
        </Box>
      </Container>
    </Layout>
  );
}
