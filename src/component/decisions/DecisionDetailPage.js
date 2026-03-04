import Head from 'next/head';
import {
  Box,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
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
import { getDecisionDisplayTitle, getDecisionTypeLabel } from '../../lib/decisionText';

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

function buildMetaItems(decision) {
  return [
    { label: 'Karar Kategorisi', value: decision?.decisionCategory?.name || '' },
    { label: 'Karar Türü', value: getDecisionTypeLabel(decision?.decisionType) },
    { label: 'Dönem', value: decision?.period?.name || '' },
    { label: 'Çalışma Grubu', value: decision?.workGroup?.name || '' },
    { label: 'Toplantı No', value: decision?.meetingNo || '' },
    { label: 'Toplantı Tarihi', value: formatDate(decision?.meetingDate) },
    { label: 'Toplantı Saati', value: decision?.meetingTime || '' },
    { label: 'Toplantı Yeri', value: decision?.meetingLocation || '' },
  ].filter((item) => item.value);
}

export default function DecisionDetailPage({ decision }) {
  if (!decision) {
    return null;
  }

  const displayTitle = getDecisionDisplayTitle(decision);
  const canonicalUrl = buildCanonicalUrl(`/belgeler/${decision.slug || decision._id}`);
  const description = buildMetaDescription(
    decision.spot || decision.bodyHtml || decision.title,
    DEFAULT_META_DESCRIPTION
  );
  const imageUrl = decision?.featuredMedia?.url || DEFAULT_OG_IMAGE;
  const publishedTime = toIsoDate(decision?.publishDate);
  const modifiedTime = toIsoDate(decision?.updatedAt || decision?.publishDate);
  const metaItems = buildMetaItems(decision);
  const shareTitle = displayTitle ? `${displayTitle} | TMMOB` : 'TMMOB';
  const hasFeaturedImage = Boolean(decision?.featuredMedia?.url);
  const keywords = [
    'TMMOB',
    'karar',
    decision?.decisionCategory?.name || '',
    getDecisionTypeLabel(decision?.decisionType),
    decision?.period?.name || '',
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
        <meta property="og:image:alt" content={decision.title || 'TMMOB karar'} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
        <meta name="twitter:title" content={shareTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        {decision?.decisionCategory?.name ? (
          <meta property="article:section" content={decision.decisionCategory.name} />
        ) : null}
        {publishedTime ? <meta property="article:published_time" content={publishedTime} /> : null}
        {modifiedTime ? <meta property="article:modified_time" content={modifiedTime} /> : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': publishedTime ? 'Article' : 'WebPage',
              headline: displayTitle || 'TMMOB karar',
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
            <FeaturedImage url={decision?.featuredMedia?.url} alt={decision.title} />
          </Box>

          {hasFeaturedImage ? <ContentShareBar title={displayTitle} url={canonicalUrl} /> : null}

          <Box className="content-print-date">
            <PublishDate date={decision.publishDate} />
          </Box>

          {decision.spot ? (
            <Box className="content-print-spot">
              <SpotText text={decision.spot} />
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

          {Array.isArray(decision.attendees) && decision.attendees.length > 0 ? (
            <Paper variant="outlined" sx={{ mb: 2, borderRadius: 2 }} data-print-exclude="true">
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Katılım
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ad Soyad</TableCell>
                      <TableCell>Birim</TableCell>
                      <TableCell>Odası</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {decision.attendees.map((attendee, index) => (
                      <TableRow key={`${attendee.firstName}-${attendee.lastName}-${index}`}>
                        <TableCell>{`${attendee.firstName} ${attendee.lastName}`}</TableCell>
                        <TableCell>{attendee.unit || '-'}</TableCell>
                        <TableCell>{attendee.chamber || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ) : null}

          <Box className="content-print-body" sx={{ overflowX: 'auto', pt: 2 }}>
            <div dangerouslySetInnerHTML={{ __html: decision.bodyHtml || '' }} />
          </Box>
        </Box>
      </Container>
    </Layout>
  );
}
