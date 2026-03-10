import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Layout from '../basic/layout';
import ContentShareBar from '../basic/ContentShareBar';
import {
  filterBoards,
  getEntityId,
  getEntityName,
  normalizeFilterValue,
  sortBoardTypesByWeight,
  sortBoardsForDisplay,
  sortByLocalizedName,
} from '../../lib/boardDirectory';
import { buildCanonicalUrl, buildMetaDescription, DEFAULT_OG_IMAGE } from '../../lib/seo';

function BoardDirectoryView({
  title,
  description,
  canonicalPath,
  initialBoards,
  initialPeriods,
  initialBoardTypes,
  initialChambers,
  initialFilters,
  fixedChamber = null,
}) {
  const router = useRouter();
  const [periodId, setPeriodId] = useState(initialFilters.periodId || '');
  const [typeId, setTypeId] = useState(initialFilters.typeId || '');
  const [chamberId, setChamberId] = useState(initialFilters.chamberId || '');

  const fixedChamberId = getEntityId(fixedChamber);
  const showTypeFilter = !fixedChamber;
  const showChamberFilter = !fixedChamber;

  useEffect(() => {
    const nextPeriodId = normalizeFilterValue(router.query.periodId) || initialFilters.periodId || '';
    if (nextPeriodId !== periodId) {
      setPeriodId(nextPeriodId);
    }

    if (showTypeFilter) {
      const nextTypeId = normalizeFilterValue(router.query.typeId);
      if (nextTypeId !== typeId) {
        setTypeId(nextTypeId);
      }
    }

    if (showChamberFilter) {
      const nextChamberId = normalizeFilterValue(router.query.chamberId);
      if (nextChamberId !== chamberId) {
        setChamberId(nextChamberId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.periodId, router.query.typeId, router.query.chamberId, showTypeFilter, showChamberFilter]);

  const periods = initialPeriods;
  const boardTypes = useMemo(
    () => sortBoardTypesByWeight(initialBoardTypes),
    [initialBoardTypes]
  );
  const chambers = useMemo(
    () => sortByLocalizedName(initialChambers, (chamber) => getEntityName(chamber, '')),
    [initialChambers]
  );

  const effectiveFilters = useMemo(
    () => ({
      periodId,
      typeId: showTypeFilter ? typeId : '',
      chamberId: fixedChamberId || (showChamberFilter ? chamberId : ''),
    }),
    [periodId, typeId, chamberId, showTypeFilter, showChamberFilter, fixedChamberId]
  );

  const filteredBoards = useMemo(
    () => sortBoardsForDisplay(filterBoards(initialBoards, effectiveFilters), boardTypes),
    [initialBoards, effectiveFilters, boardTypes]
  );

  const updateQuery = (nextValues) => {
    const query = {
      ...router.query,
      ...nextValues,
    };

    if (!query.periodId) {
      delete query.periodId;
    }
    if (!query.typeId) {
      delete query.typeId;
    }
    if (!query.chamberId || fixedChamberId) {
      delete query.chamberId;
    }

    router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true }
    );
  };

  const handlePeriodChange = (event) => {
    const nextPeriodId = event.target.value;
    setPeriodId(nextPeriodId);
    updateQuery({ periodId: nextPeriodId });
  };

  const handleTypeChange = (event) => {
    const nextTypeId = event.target.value;
    setTypeId(nextTypeId);
    updateQuery({ typeId: nextTypeId });
  };

  const handleChamberChange = (event) => {
    const nextChamberId = event.target.value;
    setChamberId(nextChamberId);
    updateQuery({ chamberId: nextChamberId });
  };

  const shareTitle = `${title} | TMMOB`;
  const canonicalUrl = buildCanonicalUrl(canonicalPath);
  const pageDescription = buildMetaDescription(description);

  return (
    <Layout>
      <Head>
        <title>{shareTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:site_name" content="TMMOB" />
        <meta property="og:locale" content="tr_TR" />
        <meta property="og:title" content={shareTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta property="og:image:alt" content={title} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={shareTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
      </Head>

      <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
        <ContentShareBar title={title} url={canonicalUrl} />

        <Grid container spacing={2} alignItems="center" sx={{ mt: 1, mb: 3 }}>
          <Grid item xs={12} md={showTypeFilter || showChamberFilter ? 4 : 3} sx={!showTypeFilter && !showChamberFilter ? { ml: { md: 'auto' } } : undefined}>
            <TextField
              select
              label="Dönem"
              size="small"
              fullWidth
              value={periodId}
              onChange={handlePeriodChange}
              InputLabelProps={{ shrink: true }}
              SelectProps={{ native: true }}
            >
              {periods.map((period) => {
                const value = getEntityId(period);
                return (
                  <option key={value} value={value}>
                    {getEntityName(period, '')}
                  </option>
                );
              })}
            </TextField>
          </Grid>

          {showTypeFilter ? (
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Kurul Türü"
                size="small"
                fullWidth
                value={typeId}
                onChange={handleTypeChange}
                InputLabelProps={{ shrink: true }}
                SelectProps={{ native: true }}
              >
                <option value="">Tümü</option>
                {boardTypes.map((boardType) => {
                  const value = getEntityId(boardType);
                  return (
                    <option key={value} value={value}>
                      {getEntityName(boardType, '')}
                    </option>
                  );
                })}
              </TextField>
            </Grid>
          ) : null}

          {showChamberFilter ? (
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Oda"
                size="small"
                fullWidth
                value={chamberId}
                onChange={handleChamberChange}
                InputLabelProps={{ shrink: true }}
                SelectProps={{ native: true }}
              >
                <option value="">Tümü</option>
                {chambers.map((chamber) => {
                  const value = getEntityId(chamber);
                  return (
                    <option key={value} value={value}>
                      {getEntityName(chamber, '')}
                    </option>
                  );
                })}
              </TextField>
            </Grid>
          ) : null}
        </Grid>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Toplam {filteredBoards.length} kurul bulundu.
        </Typography>

        <Stack spacing={2}>
          {filteredBoards.map((board) => {
            const boardId = getEntityId(board);
            const boardType = getEntityName(board?.type, 'Kurul Türü Belirtilmemiş');
            const boardChamber = getEntityName(board?.chamber, 'Oda Belirtilmemiş');
            const boardPeriod = getEntityName(board?.period, 'Dönem Belirtilmemiş');
            const chamberPeriod = String(board?.chamberPeriod || '').trim();
            const members = Array.isArray(board?.members) ? board.members : [];

            return (
              <Paper key={boardId || board.name} elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                  {board?.name || 'Kurul'}
                </Typography>
                {fixedChamber ? (
                  chamberPeriod ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      <strong>Oda Dönemi:</strong> {chamberPeriod}
                    </Typography>
                  ) : null
                ) : (
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: '#f3f4f6' }}>
                      {boardType}
                    </Typography>
                    <Typography variant="caption" sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: '#f3f4f6' }}>
                      {boardChamber}
                    </Typography>
                    <Typography variant="caption" sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: '#f3f4f6' }}>
                      {boardPeriod}
                    </Typography>
                    {chamberPeriod ? (
                      <Typography variant="caption" sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: '#f3f4f6' }}>
                        Oda Dönemi: {chamberPeriod}
                      </Typography>
                    ) : null}
                  </Stack>
                )}
                <Divider sx={{ mb: 1.5 }} />
                {members.length > 0 ? (
                  <Stack spacing={0.5}>
                    {members.map((member, index) => (
                      <Typography key={`${boardId}-member-${index}`} variant="body2">
                        {member?.title ? (
                          <Typography component="span" sx={{ fontWeight: 700 }}>
                            {member.title}:
                          </Typography>
                        ) : null}
                        {member?.title ? ' ' : ''}
                        {member?.name || '-'}
                      </Typography>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Üye bilgisi bulunamadı.
                  </Typography>
                )}
              </Paper>
            );
          })}

          {filteredBoards.length === 0 ? (
            <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb' }}>
              <Typography color="text.secondary">
                Seçilen filtrelere uygun kurul bulunamadı.
              </Typography>
            </Paper>
          ) : null}
        </Stack>
      </Container>
    </Layout>
  );
}

export default BoardDirectoryView;
