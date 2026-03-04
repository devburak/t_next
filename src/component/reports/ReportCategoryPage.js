import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Grid,
  MenuItem,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import Layout from '../basic/layout';
import { buildCanonicalUrl, buildMetaDescription, DEFAULT_OG_IMAGE } from '../../lib/seo';
import { getCategoryDisplayName, getCategoryHeading } from '../../lib/categoryText';
import { getReportDisplayTitle } from '../../lib/reportText';

function formatDate(value) {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return parsed.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function groupReportsByPeriod(reports = []) {
  const groups = [];
  const map = new Map();

  reports.forEach((report) => {
    const key = String(report?.period?._id || 'none');

    if (!map.has(key)) {
      const group = {
        key,
        label: report?.period?.name || 'Dönem Bilgisi Yok',
        items: [],
      };
      map.set(key, group);
      groups.push(group);
    }

    map.get(key).items.push(report);
  });

  return groups;
}

export default function ReportCategoryPage({
  slug,
  category,
  reports = [],
  totalPages = 1,
  page = 1,
  periods = [],
  selectedPeriodId = '',
  workGroups = [],
  selectedWorkGroupSlug = '',
}) {
  const router = useRouter();
  const categoryName = getCategoryDisplayName(category?.name || slug);
  const categoryHeading = getCategoryHeading(category?.name || slug);
  const groupedReports = groupReportsByPeriod(reports);
  const canonicalQuery = new URLSearchParams();

  if (selectedPeriodId) {
    canonicalQuery.set('periodId', selectedPeriodId);
  }

  if (selectedWorkGroupSlug) {
    canonicalQuery.set('workGroupSlug', selectedWorkGroupSlug);
  }

  if (page > 1) {
    canonicalQuery.set('page', String(page));
  }

  const canonicalUrl = buildCanonicalUrl(
    `/belgeler/${slug}${canonicalQuery.toString() ? `?${canonicalQuery.toString()}` : ''}`
  );
  const description = buildMetaDescription(
    category?.description || `${categoryName} raporlarini kesfedin.`
  );
  const keywords = `${categoryName}, raporlar, TMMOB`;

  const handlePageChange = (event, value) => {
    router.push({
      pathname: `/belgeler/${slug}`,
      query: {
        ...(selectedPeriodId ? { periodId: selectedPeriodId } : {}),
        ...(selectedWorkGroupSlug ? { workGroupSlug: selectedWorkGroupSlug } : {}),
        ...(value > 1 ? { page: value } : {}),
      },
    });
  };

  const handlePeriodChange = (event) => {
    const value = String(event.target.value || '').trim();
    router.push({
      pathname: `/belgeler/${slug}`,
      query: {
        ...(value ? { periodId: value } : {}),
        ...(selectedWorkGroupSlug ? { workGroupSlug: selectedWorkGroupSlug } : {}),
      },
    });
  };

  const handleWorkGroupChange = (event) => {
    const value = String(event.target.value || '').trim();
    router.push({
      pathname: `/belgeler/${slug}`,
      query: {
        ...(selectedPeriodId ? { periodId: selectedPeriodId } : {}),
        ...(value ? { workGroupSlug: value } : {}),
      },
    });
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
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      </Head>

      <Container maxWidth="lg">
        <Grid container spacing={2} alignItems="end" sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              {categoryHeading}
            </Typography>
            {category?.description ? (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mt: 1, maxWidth: 820, whiteSpace: 'pre-line' }}
              >
                {category.description}
              </Typography>
            ) : null}
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              label="Dönem"
              value={selectedPeriodId}
              onChange={handlePeriodChange}
              fullWidth
              size="small"
            >
              <MenuItem value="">Tüm Dönemler</MenuItem>
              {periods.map((period) => (
                <MenuItem key={period._id} value={period._id}>
                  {period.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              label="Çalışma Grubu"
              value={selectedWorkGroupSlug}
              onChange={handleWorkGroupChange}
              fullWidth
              size="small"
            >
              <MenuItem value="">Tümü</MenuItem>
              {workGroups.map((workGroup) => (
                <MenuItem key={workGroup._id || workGroup.slug} value={workGroup.slug}>
                  {workGroup.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {groupedReports.length === 0 ? (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Bu kategoride rapor bulunmuyor.
            </Typography>
          </Paper>
        ) : (
          groupedReports.map((group) => (
            <Box key={group.key} sx={{ mb: 3.5 }}>
              <Typography variant="h5" component="h2" sx={{ mb: 1.5, fontWeight: 700 }}>
                {group.label}
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Başlık</TableCell>
                      <TableCell>Çalışma Grubu</TableCell>
                      <TableCell>Toplantı No</TableCell>
                      <TableCell>Toplantı Tarihi</TableCell>
                      <TableCell>Toplantı Yeri</TableCell>
                      <TableCell>Yayın Tarihi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.items.map((report) => (
                      <TableRow key={report._id || report.slug} hover>
                        <TableCell sx={{ minWidth: 280 }}>
                          <Link
                            href={`/belgeler/${report.slug}`}
                            style={{
                              color: 'var(--tmmob-red)',
                              fontWeight: 600,
                              textDecoration: 'none',
                            }}
                          >
                            {getReportDisplayTitle(report)}
                          </Link>
                          {report.spot ? (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.75, whiteSpace: 'pre-line' }}
                            >
                              {report.spot}
                            </Typography>
                          ) : null}
                        </TableCell>
                        <TableCell>{report?.workGroup?.name || '-'}</TableCell>
                        <TableCell>{report.meetingNo || '-'}</TableCell>
                        <TableCell>{formatDate(report.meetingDate)}</TableCell>
                        <TableCell>{report.meetingLocation || '-'}</TableCell>
                        <TableCell>{formatDate(report.publishDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))
        )}

        {totalPages > 1 ? (
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}
          />
        ) : null}
      </Container>
    </Layout>
  );
}
