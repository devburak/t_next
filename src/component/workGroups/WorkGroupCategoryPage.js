import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import Layout from '../basic/layout';
import { buildCanonicalUrl, buildMetaDescription, DEFAULT_OG_IMAGE } from '../../lib/seo';
import { getCategoryDisplayName, getCategoryHeading } from '../../lib/categoryText';

function groupWorkGroupsByPeriod(workGroups = []) {
  const groups = [];
  const map = new Map();

  workGroups.forEach((workGroup) => {
    const key = String(workGroup?.period?._id || 'none');
    if (!map.has(key)) {
      const group = {
        key,
        label: workGroup?.period?.name || 'Dönem Bilgisi Yok',
        items: [],
      };
      map.set(key, group);
      groups.push(group);
    }

    map.get(key).items.push(workGroup);
  });

  return groups;
}

function buildWorkGroupDetailHref(workGroup, selectedPeriodId = '') {
  const slug = String(workGroup?.slug || '').trim();
  if (!slug) {
    return '/belgeler/calisma-gruplari';
  }

  const periodId = selectedPeriodId || workGroup?.period?._id || '';
  if (!periodId) {
    return `/belgeler/calisma-gruplari/${slug}`;
  }

  return `/belgeler/calisma-gruplari/${slug}?periodId=${encodeURIComponent(periodId)}`;
}

export default function WorkGroupCategoryPage({
  slug = 'calisma-gruplari',
  category,
  workGroups = [],
  periods = [],
  selectedPeriodId = '',
}) {
  const router = useRouter();
  const categoryName = getCategoryDisplayName(category?.name || slug);
  const categoryHeading = getCategoryHeading(category?.name || slug);
  const groupedWorkGroups = groupWorkGroupsByPeriod(workGroups);
  const canonicalUrl = buildCanonicalUrl(
    `/belgeler/${slug}${selectedPeriodId ? `?periodId=${encodeURIComponent(selectedPeriodId)}` : ''}`
  );
  const description = buildMetaDescription(
    category?.description || `${categoryName} listesini keşfedin.`
  );
  const keywords = `${categoryName}, çalışma grupları, TMMOB`;

  const handlePeriodChange = (event) => {
    const value = String(event.target.value || '').trim();
    router.push({
      pathname: `/belgeler/${slug}`,
      query: value ? { periodId: value } : {},
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
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              {categoryHeading}
            </Typography>
            {category?.description ? (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mt: 1, maxWidth: 840, whiteSpace: 'pre-line' }}
              >
                {category.description}
              </Typography>
            ) : null}
          </Grid>
          <Grid item xs={12} md={4}>
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
        </Grid>

        {groupedWorkGroups.length === 0 ? (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Bu dönemde çalışma grubu bulunmuyor.
            </Typography>
          </Paper>
        ) : (
          groupedWorkGroups.map((group) => (
            <Box key={group.key} sx={{ mb: 3.5 }}>
              <Typography variant="h5" component="h2" sx={{ mb: 1.5, fontWeight: 700 }}>
                {group.label}
              </Typography>
              <Grid container spacing={2}>
                {group.items.map((workGroup) => (
                  <Grid item xs={12} md={6} lg={4} key={workGroup._id || workGroup.slug}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          gap: 1.2,
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                          {workGroup.name}
                        </Typography>
                        {workGroup.description ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ whiteSpace: 'pre-line' }}
                          >
                            {workGroup.description}
                          </Typography>
                        ) : null}
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 0.75 }}>
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`Üye: ${workGroup.memberCount || 0}`}
                          />
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`Rapor: ${workGroup.reportCount || 0}`}
                          />
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`Karar: ${workGroup.decisionCount || 0}`}
                          />
                        </Stack>
                        <Box sx={{ mt: 'auto', pt: 1 }}>
                          <Button
                            component={Link}
                            href={buildWorkGroupDetailHref(workGroup, selectedPeriodId)}
                            variant="contained"
                            color="primary"
                            size="small"
                          >
                            Detayı Gör
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))
        )}
      </Container>
    </Layout>
  );
}
