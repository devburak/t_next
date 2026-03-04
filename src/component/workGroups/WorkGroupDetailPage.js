import Link from 'next/link';
import Head from 'next/head';
import {
  Box,
  Chip,
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
import { buildCanonicalUrl, buildMetaDescription, DEFAULT_OG_IMAGE } from '../../lib/seo';
import { getReportDisplayTitle } from '../../lib/reportText';
import { getDecisionDisplayTitle } from '../../lib/decisionText';

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

function formatChamberLabel(chamber) {
  if (!chamber) {
    return '-';
  }

  if (typeof chamber === 'string') {
    const value = String(chamber).trim();
    return value || '-';
  }

  const readText = (value) => {
    if (value === null || value === undefined) {
      return '';
    }

    const isInvalidObjectLiteralString = (input) => {
      const normalized = String(input || '').trim().toLowerCase();
      return normalized === '[object object]' || normalized === 'object object';
    };

    if (typeof value === 'string' || typeof value === 'number') {
      const normalized = String(value).trim();
      return isInvalidObjectLiteralString(normalized) ? '' : normalized;
    }

    if (typeof value === 'object') {
      const candidates = [value.name, value.short, value.label, value.title, value.text];
      for (const candidate of candidates) {
        if (typeof candidate === 'string' || typeof candidate === 'number') {
          const normalized = String(candidate).trim();
          if (normalized && !isInvalidObjectLiteralString(normalized)) {
            return normalized;
          }
        }
      }
    }

    return '';
  };

  const short = readText(chamber.short) || readText(chamber.code);
  const name =
    readText(chamber.name) ||
    readText(chamber.label) ||
    (chamber.chamber && typeof chamber.chamber === 'object' ? readText(chamber.chamber.name) : '');

  if (short && name && short !== name) {
    return `${short} - ${name}`;
  }

  return short || name || '-';
}

export default function WorkGroupDetailPage({
  workGroup,
  reports = [],
  decisions = [],
  canonicalPath = '',
}) {
  if (!workGroup) {
    return null;
  }

  const canonicalUrl = buildCanonicalUrl(canonicalPath);
  const description = buildMetaDescription(
    workGroup.description || `${workGroup.name} çalışma grubu detayları.`
  );
  const keywords = [
    workGroup.name || '',
    'TMMOB',
    'çalışma grubu',
    workGroup?.period?.name || '',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Layout>
      <Head>
        <title>{`${workGroup.name} | TMMOB`}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={workGroup.name} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      </Head>

      <Container maxWidth="lg">
        <Paper variant="outlined" sx={{ p: 2.5, mb: 2.5 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {workGroup.name}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.2 }}>
            {workGroup?.period?.name ? <Chip size="small" label={`Dönem: ${workGroup.period.name}`} /> : null}
            <Chip size="small" variant="outlined" label={`Üye: ${workGroup.memberCount || 0}`} />
            <Chip size="small" variant="outlined" label={`Rapor: ${workGroup.reportCount || reports.length}`} />
            <Chip size="small" variant="outlined" label={`Karar: ${workGroup.decisionCount || decisions.length}`} />
          </Box>
          {workGroup.description ? (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: 1.5, whiteSpace: 'pre-line' }}
            >
              {workGroup.description}
            </Typography>
          ) : null}
        </Paper>

        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <Paper variant="outlined">
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Üyeler
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ad Soyad</TableCell>
                      <TableCell>Nitelik</TableCell>
                      <TableCell>Birim</TableCell>
                      <TableCell>Odası</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(workGroup.members || []).map((member, index) => (
                      <TableRow key={`${member.firstName}-${member.lastName}-${index}`}>
                        <TableCell>{`${member.firstName} ${member.lastName}`}</TableCell>
                        <TableCell>{member.role || '-'}</TableCell>
                        <TableCell>{member.unit || '-'}</TableCell>
                        <TableCell>{formatChamberLabel(member.chamber)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                İlişkili Raporlar
              </Typography>
              {reports.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Bu çalışma grubuna bağlı rapor bulunmuyor.
                </Typography>
              ) : (
                <Box sx={{ display: 'grid', gap: 1.25 }}>
                  {reports.map((report) => (
                    <Box key={report._id || report.slug}>
                      <Link
                        href={`/belgeler/${report.slug}`}
                        style={{ color: 'var(--tmmob-red)', textDecoration: 'none', fontWeight: 600 }}
                      >
                        {getReportDisplayTitle(report)}
                      </Link>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {report?.period?.name || 'Dönem yok'} • {formatDate(report.publishDate)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                İlişkili Kararlar
              </Typography>
              {decisions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Bu çalışma grubuna bağlı karar bulunmuyor.
                </Typography>
              ) : (
                <Box sx={{ display: 'grid', gap: 1.25 }}>
                  {decisions.map((decision) => (
                    <Box key={decision._id || decision.slug}>
                      <Link
                        href={`/belgeler/${decision.slug}`}
                        style={{ color: 'var(--tmmob-red)', textDecoration: 'none', fontWeight: 600 }}
                      >
                        {getDecisionDisplayTitle(decision)}
                      </Link>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {decision?.period?.name || 'Dönem yok'} • {formatDate(decision.publishDate)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
}
