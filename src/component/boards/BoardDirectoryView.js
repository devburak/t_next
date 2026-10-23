import Head from "next/head";
import { useRouter } from "next/router";
import {
  Alert,
  Container,
  Grid,
  Pagination,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Layout from "../basic/layout";
import ContentShareBar from "../basic/ContentShareBar";
import BoardCard from "./BoardCard";
import BoardHistory from "./BoardHistory";
import { getEntityId } from "../../lib/boardDirectory";
import {
  buildCanonicalUrl,
  buildMetaDescription,
  DEFAULT_OG_IMAGE,
} from "../../lib/seo";

export default function BoardDirectoryView({
  title,
  description,
  canonicalPath,
  boards,
  terms,
  boardTypes,
  chambers,
  initialFilters,
  fixedChamber,
  total,
  totalPages,
  page,
  missingCount,
  latestTerm,
  unavailable,
}) {
  const router = useRouter();
  const { chamberId, typeId, donem, donemsiz } = initialFilters;
  const updateQuery = (nextValues) => {
    const query = { ...router.query, ...nextValues };
    // Eski TMMOB dönem URL'leri oda filtrelerine taşınmaz.
    delete query.periodId;
    for (const field of ["typeId", "chamberId", "donem", "donemsiz", "page"])
      if (!query[field]) delete query[field];
    if (fixedChamber) delete query.chamberId;
    router.push({ pathname: router.pathname, query });
  };
  const canonicalQuery = new URLSearchParams();
  if (donem) canonicalQuery.set("donem", donem);
  if (donemsiz) canonicalQuery.set("donemsiz", "1");
  if (typeId) canonicalQuery.set("typeId", typeId);
  if (!fixedChamber && chamberId) canonicalQuery.set("chamberId", chamberId);
  if (page > 1) canonicalQuery.set("page", String(page));
  const canonicalUrl = buildCanonicalUrl(
    `${canonicalPath}${canonicalQuery.size ? `?${canonicalQuery}` : ""}`,
  );
  const shareTitle = `${title} | TMMOB`;
  return (
    <Layout>
      <Head>
        <title>{shareTitle}</title>
        <meta name="description" content={buildMetaDescription(description)} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:site_name" content="TMMOB" />
        <meta property="og:locale" content="tr_TR" />
        <meta property="og:title" content={shareTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta property="og:image:alt" content={title} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={shareTitle} />
        <meta name="twitter:description" content={description} />
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
        {unavailable && (
          <Alert severity="error" sx={{ my: 2 }}>
            Kurul bilgilerine şu anda ulaşılamıyor. Lütfen daha sonra tekrar
            deneyin.
          </Alert>
        )}
        <Grid container spacing={2} sx={{ mt: 1, mb: 3 }}>
          {!fixedChamber && (
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Oda"
                fullWidth
                size="small"
                SelectProps={{ native: true }}
                InputLabelProps={{ shrink: true }}
                value={chamberId}
                onChange={(event) =>
                  updateQuery({ chamberId: event.target.value, page: "" })
                }
              >
                <option value="">Tümü</option>
                {[...chambers]
                  .sort((a, b) => a.name.localeCompare(b.name, "tr"))
                  .map((chamber) => (
                    <option key={chamber._id} value={chamber._id}>
                      {chamber.name}
                    </option>
                  ))}
              </TextField>
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Kurul türü"
              fullWidth
              size="small"
              SelectProps={{ native: true }}
              InputLabelProps={{ shrink: true }}
              value={typeId}
              onChange={(event) =>
                updateQuery({ typeId: event.target.value, page: "" })
              }
            >
              <option value="">Tümü</option>
              {[...boardTypes]
                .sort(
                  (a, b) =>
                    (a.sortWeight ?? 100) - (b.sortWeight ?? 100) ||
                    a.name.localeCompare(b.name, "tr"),
                )
                .map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.name}
                  </option>
                ))}
            </TextField>
          </Grid>
        </Grid>
        {fixedChamber && !unavailable && (
          <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
            {latestTerm ? "Güncel kurullar" : "Dönem belirtilmemiş kurullar"}
          </Typography>
        )}
        {!unavailable && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Toplam {total} kurul bulundu.
          </Typography>
        )}
        <Stack spacing={2}>
          {boards.map((board) => (
            <BoardCard
              key={board._id}
              board={board}
              showChamber={!fixedChamber}
              heading={fixedChamber ? "h3" : "h2"}
            />
          ))}
          {!unavailable && !boards.length && (
            <Paper sx={{ p: 3 }}>
              <Typography>
                Seçilen filtrelere uygun kurul bulunamadı.
              </Typography>
            </Paper>
          )}
        </Stack>
        {totalPages > 1 && (
          <Pagination
            sx={{ mt: 3 }}
            count={totalPages}
            page={page}
            onChange={(_, value) =>
              updateQuery({ page: value === 1 ? "" : String(value) })
            }
          />
        )}
        {fixedChamber && !unavailable && (
          <BoardHistory
            key={`${getEntityId(fixedChamber)}-${typeId}-${donem}-${donemsiz}`}
            chamberId={getEntityId(fixedChamber)}
            terms={terms}
            latestTerm={latestTerm}
            missingCount={missingCount}
            typeId={typeId}
            requestedTerm={donem}
            requestedMissing={Boolean(donemsiz)}
          />
        )}
      </Container>
    </Layout>
  );
}
