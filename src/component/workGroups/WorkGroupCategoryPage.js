import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Box, Button, Card, CardContent, Container, Grid, MenuItem, Paper, TextField, Typography } from '@mui/material';
import Layout from '../basic/layout';
import { buildCanonicalUrl, buildMetaDescription, DEFAULT_OG_IMAGE } from '../../lib/seo';

export default function WorkGroupCategoryPage({ slug = 'calisma-gruplari', category, workGroups = [], periods = [], selectedPeriodId = '' }) {
  const router = useRouter();
  const title = category?.name || 'Çalışma Grupları';
  return <Layout>
    <Head><title>{`${title} | TMMOB`}</title><meta name="description" content={buildMetaDescription(category?.description || title)} /><link rel="canonical" href={buildCanonicalUrl(`/belgeler/${slug}`)} /><meta name="keywords" content="TMMOB, çalışma grupları" /><meta property="og:title" content={title} /><meta property="og:description" content={buildMetaDescription(category?.description || title)} /><meta property="og:type" content="website" /><meta property="og:url" content={buildCanonicalUrl(`/belgeler/${slug}`)} /><meta property="og:image" content={DEFAULT_OG_IMAGE} /></Head>
    <Container maxWidth="lg">
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}><Typography variant="h4" component="h1" fontWeight={700}>{title}</Typography>
          {category?.description && <Typography sx={{ mt: 1 }}>{category.description}</Typography>}</Grid>
        <Grid item xs={12} md={4}><TextField select label="Dönem" value={selectedPeriodId} fullWidth size="small" onChange={event => router.push({ pathname: `/belgeler/${slug}`, query: event.target.value ? { periodId: event.target.value } : {} })}>
          <MenuItem value="">Tüm dönemler</MenuItem>{periods.map(period => <MenuItem key={period._id} value={period._id}>{period.name}</MenuItem>)}
        </TextField></Grid>
      </Grid>
      {!workGroups.length ? <Paper sx={{ p: 3 }}>Bu dönem için çalışma grubu bulunmuyor.</Paper> : <Grid container spacing={2}>
        {workGroups.map(group => <Grid item xs={12} sm={6} lg={4} key={group._id}>
          <Card variant="outlined" sx={{ height: '100%' }}><CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 1.5 }}>
            <Typography variant="h6" component="h2" fontWeight={700}>{group.name}</Typography>
            {group.description && <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{group.description}</Typography>}
            <Typography variant="body2" color="text.secondary">{group.periodCount || group.periods?.length || 0} dönem</Typography>
            <Box sx={{ mt: 'auto' }}><Button component={Link} href={`/belgeler/calisma-gruplari/${group.slug}${selectedPeriodId ? `?periodId=${encodeURIComponent(selectedPeriodId)}` : ''}`} variant="contained" size="small">Dönemleri ve üyeleri gör</Button></Box>
          </CardContent></Card>
        </Grid>)}
      </Grid>}
    </Container>
  </Layout>;
}
