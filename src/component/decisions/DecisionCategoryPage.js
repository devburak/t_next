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
import { getDecisionDisplayTitle, getDecisionTypeLabel } from '../../lib/decisionText';

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

function groupDecisionsByPeriod(decisions = []) {
  const groups = [];
  const map = new Map();

  decisions.forEach((decision) => {
    const key = String(decision?.period?._id || 'none');

    if (!map.has(key)) {
      const group = {
        key,
        label: decision?.period?.name || 'Dönem Bilgisi Yok',
        items: [],
      };
      map.set(key, group);
      groups.push(group);
    }

    map.get(key).items.push(decision);
  });

  return groups;
}

export default function DecisionCategoryPage({
  slug,
  category,
  decisions = [],
  totalPages = 1,
  page = 1,
  periods = [],
  selectedPeriodId = '',
  selectedDecisionType = '',
  lockDecisionType = false,
  workGroups = [],
  selectedWorkGroupSlug = '',
}) {
  const router = useRouter();
  const categoryName = getCategoryDisplayName(category?.name || slug);
  const categoryHeading = getCategoryHeading(category?.name || slug);
  const groupedDecisions = groupDecisionsByPeriod(decisions);
  const canonicalQuery = new URLSearchParams();

  if (selectedPeriodId) {
    canonicalQuery.set('periodId', selectedPeriodId);
  }

  if (selectedDecisionType && !lockDecisionType) {
    canonicalQuery.set('decisionType', selectedDecisionType);
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
    category?.description || `${categoryName} kararlarını keşfedin.`
  );
  const keywords = `${categoryName}, kararlar, TMMOB`;

  const handlePageChange = (event, value) => {
    router.push({
      pathname: `/belgeler/${slug}`,
      query: {
        ...(selectedPeriodId ? { periodId: selectedPeriodId } : {}),
        ...(selectedDecisionType && !lockDecisionType ? { decisionType: selectedDecisionType } : {}),
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
        ...(selectedDecisionType && !lockDecisionType ? { decisionType: selectedDecisionType } : {}),
        ...(selectedWorkGroupSlug ? { workGroupSlug: selectedWorkGroupSlug } : {}),
      },
    });
  };

  const handleDecisionTypeChange = (event) => {
    if (lockDecisionType) {
      return;
    }

    const value = String(event.target.value || '').trim();
    router.push({
      pathname: `/belgeler/${slug}`,
      query: {
        ...(selectedPeriodId ? { periodId: selectedPeriodId } : {}),
        ...(value ? { decisionType: value } : {}),
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
        ...(selectedDecisionType && !lockDecisionType ? { decisionType: selectedDecisionType } : {}),
        ...(value ? { workGroupSlug: value } : {}),
      },
    });
  };

  const showWorkGroupFilter = selectedDecisionType === 'work-group' || selectedWorkGroupSlug;
  const showTypeAndWorkGroupColumns = !lockDecisionType;
  const showPublishDateColumn = !lockDecisionType;
  const headingGridMd = lockDecisionType ? 9 : showWorkGroupFilter ? 3 : 5;
  const periodGridSx = lockDecisionType
    ? {
        display: 'flex',
        justifyContent: { xs: 'flex-start', md: 'flex-end' },
      }
    : undefined;

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
          <Grid item xs={12} md={headingGridMd}>
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
          <Grid item xs={12} md={3} sx={periodGridSx}>
            <TextField
              select
              label="Dönem"
              value={selectedPeriodId}
              onChange={handlePeriodChange}
              fullWidth
              size="small"
              sx={lockDecisionType ? { maxWidth: { xs: '100%', md: 260 } } : undefined}
            >
              <MenuItem value="">Tüm Dönemler</MenuItem>
              {periods.map((period) => (
                <MenuItem key={period._id} value={period._id}>
                  {period.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {!lockDecisionType ? (
            <Grid item xs={12} md={showWorkGroupFilter ? 3 : 4}>
              <TextField
                select
                label="Karar Türü"
                value={selectedDecisionType}
                onChange={handleDecisionTypeChange}
                fullWidth
                size="small"
              >
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value="management-board">Yönetim Kurulu</MenuItem>
                <MenuItem value="audit-board">Denetleme Kurulu</MenuItem>
                <MenuItem value="honor-board">Onur Kurulu</MenuItem>
                <MenuItem value="work-group">Çalışma Grubu</MenuItem>
              </TextField>
            </Grid>
          ) : null}
          {showWorkGroupFilter ? (
            <Grid item xs={12} md={2}>
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
          ) : null}
        </Grid>

        {groupedDecisions.length === 0 ? (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Bu kategoride karar bulunmuyor.
            </Typography>
          </Paper>
        ) : (
          groupedDecisions.map((group) => (
            <Box key={group.key} sx={{ mb: 3.5 }}>
              <Typography variant="h5" component="h2" sx={{ mb: 1.5, fontWeight: 700 }}>
                {group.label}
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Başlık</TableCell>
                      {showTypeAndWorkGroupColumns ? <TableCell>Tür</TableCell> : null}
                      {showTypeAndWorkGroupColumns ? <TableCell>Çalışma Grubu</TableCell> : null}
                      <TableCell>Toplantı No</TableCell>
                      <TableCell>Toplantı Tarihi</TableCell>
                      <TableCell>Toplantı Saati</TableCell>
                      <TableCell>Toplantı Yeri</TableCell>
                      {showPublishDateColumn ? <TableCell>Yayın Tarihi</TableCell> : null}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.items.map((decision) => (
                      <TableRow key={decision._id || decision.slug} hover>
                        <TableCell sx={{ minWidth: 280 }}>
                          <Link
                            href={`/belgeler/${decision.slug}`}
                            style={{
                              color: 'var(--tmmob-red)',
                              fontWeight: 600,
                              textDecoration: 'none',
                            }}
                          >
                            {getDecisionDisplayTitle(decision)}
                          </Link>
                          {decision.spot ? (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.75, whiteSpace: 'pre-line' }}
                            >
                              {decision.spot}
                            </Typography>
                          ) : null}
                        </TableCell>
                        {showTypeAndWorkGroupColumns ? (
                          <TableCell>{getDecisionTypeLabel(decision.decisionType)}</TableCell>
                        ) : null}
                        {showTypeAndWorkGroupColumns ? (
                          <TableCell>{decision?.workGroup?.name || '-'}</TableCell>
                        ) : null}
                        <TableCell>{decision.meetingNo || '-'}</TableCell>
                        <TableCell>{formatDate(decision.meetingDate)}</TableCell>
                        <TableCell>{decision.meetingTime || '-'}</TableCell>
                        <TableCell>{decision.meetingLocation || '-'}</TableCell>
                        {showPublishDateColumn ? (
                          <TableCell>{formatDate(decision.publishDate)}</TableCell>
                        ) : null}
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
