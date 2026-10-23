import { useEffect, useId, useRef, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Collapse,
  Pagination,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HistoryIcon from "@mui/icons-material/History";
import BoardCard from "./BoardCard";
import { formatTermDateRange, getArchiveTerms } from "../../lib/boardDirectory";

function ArchiveTerm({
  term,
  chamberId,
  typeId,
  expanded,
  onChange,
  reducedMotion,
}) {
  const id = useId();
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState({ status: "idle" });
  const cache = useRef(new Map());
  useEffect(() => {
    if (!expanded) return;
    if (cache.current.has(page)) {
      setResult(cache.current.get(page));
      return;
    }
    const controller = new AbortController();
    const params = new URLSearchParams({
      chamber: chamberId,
      page: String(page),
    });
    if (term.missing) params.set("termMissing", "true");
    else params.set("term", term.name);
    if (typeId) params.set("type", typeId);
    setResult({ status: "loading" });
    fetch(`/api/boards/archive?${params}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Arşiv yüklenemedi.");
        const payload = await response.json();
        if (!Array.isArray(payload.data)) throw new Error("Arşiv yüklenemedi.");
        if (controller.signal.aborted) return;
        const loaded = { ...payload, status: "ready" };
        cache.current.set(page, loaded);
        setResult(loaded);
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ status: "error" });
      });
    return () => controller.abort();
  }, [expanded, page, retry, chamberId, typeId, term.name, term.missing]);
  const dates = formatTermDateRange(term);
  return (
    <Accordion
      disableGutters
      elevation={0}
      expanded={expanded}
      onChange={onChange}
      TransitionProps={{ timeout: reducedMotion ? 0 : "auto" }}
      sx={{
        border: 1,
        borderColor: "divider",
        "&:before": { display: "none" },
        "&.Mui-expanded": { mt: 0 },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        id={`${id}-summary`}
        aria-controls={`${id}-details`}
        sx={{ px: { xs: 2, sm: 3 }, py: 1, bgcolor: "action.hover" }}
      >
        <Stack spacing={0.5}>
          <Typography component="h3" variant="subtitle1" fontWeight={700}>
            Oda dönemi: {term.missing ? "Dönem belirtilmemiş" : term.name}
          </Typography>
          {dates && (
            <Typography variant="body2" color="text.secondary">
              {dates}
            </Typography>
          )}
        </Stack>
      </AccordionSummary>
      <AccordionDetails
        id={`${id}-details`}
        aria-labelledby={`${id}-summary`}
        sx={{ p: { xs: 2, sm: 3 } }}
      >
        {expanded && (
          <Stack spacing={2}>
            {term.datesConflicted && (
              <Alert severity="info">
                Bu döneme ait kayıtların tarihleri farklı. Bilinen tarihler
                ilgili kurulda gösterilir.
              </Alert>
            )}
            {["idle", "loading"].includes(result.status) && (
              <Box role="status" aria-label="Geçmiş kurullar yükleniyor">
                <Skeleton variant="rounded" height={112} />
                <Skeleton sx={{ mt: 1 }} width="70%" />
                <Skeleton width="45%" />
              </Box>
            )}
            {result.status === "error" && (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    onClick={() => setRetry((value) => value + 1)}
                  >
                    Yeniden dene
                  </Button>
                }
              >
                {typeof navigator !== "undefined" && navigator.onLine === false
                  ? "İnternet bağlantınızı kontrol edip yeniden deneyin."
                  : "Geçmiş kurullar yüklenemedi. Lütfen yeniden deneyin."}
              </Alert>
            )}
            {result.status === "ready" &&
              (result.data.length ? (
                result.data.map((board) => (
                  <BoardCard
                    key={board._id}
                    board={board}
                    heading="h4"
                    archived
                  />
                ))
              ) : (
                <Typography color="text.secondary">
                  Bu dönemde seçilen kurul türüne ait kayıt bulunamadı.
                </Typography>
              ))}
            {result.status === "ready" && result.totalPages > 1 && (
              <Pagination
                aria-label={`${term.name || "Dönem belirtilmemiş"} kurul sayfaları`}
                size="small"
                count={result.totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
              />
            )}
          </Stack>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

// UI Token Contract: MUI background.paper / text.primary / text.secondary /
// primary.main / divider / shape.borderRadius; theme spacing (8px, 4px yarımlar).
export default function BoardHistory({
  chamberId,
  terms,
  latestTerm,
  missingCount,
  typeId,
  requestedTerm = "",
  requestedMissing = false,
}) {
  const id = useId();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const archives = getArchiveTerms(terms, latestTerm, missingCount);
  const requestedKey = requestedMissing
    ? "missing"
    : requestedTerm && requestedTerm !== latestTerm
      ? `term:${requestedTerm}`
      : "";
  const [visible, setVisible] = useState(Boolean(requestedKey));
  const [expanded, setExpanded] = useState(requestedKey);
  const unknown =
    requestedTerm && !terms.some((term) => term.name === requestedTerm);
  if (!archives.length && !unknown) return null;
  return (
    <Box
      component="section"
      aria-labelledby={`${id}-title`}
      sx={{ mt: 5, pt: 3, borderTop: 1, borderColor: "divider" }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography id={`${id}-title`} component="h2" variant="h6">
            Geçmiş kurullar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Önceki oda dönemlerindeki kurul ve görevliler.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<HistoryIcon />}
          endIcon={
            <ExpandMoreIcon
              sx={{ transform: visible ? "rotate(180deg)" : undefined }}
            />
          }
          aria-expanded={visible}
          aria-controls={`${id}-content`}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? "Geçmiş kurulları gizle" : "Geçmiş kurulları göster"}
        </Button>
      </Stack>
      <Collapse in={visible} timeout={reducedMotion ? 0 : "auto"}>
        <Stack id={`${id}-content`} spacing={1.5}>
          {unknown && (
            <Alert severity="info">
              Bağlantıdaki oda dönemi bulunamadı. Güncel kurullar yukarıda,
              kayıtlı geçmiş dönemler aşağıda gösteriliyor.
            </Alert>
          )}
          {archives.map((term) => {
            const key = term.missing ? "missing" : `term:${term.name}`;
            return (
              <ArchiveTerm
                key={key}
                term={term}
                reducedMotion={reducedMotion}
                chamberId={chamberId}
                typeId={typeId}
                expanded={visible && expanded === key}
                onChange={(_, open) => setExpanded(open ? key : "")}
              />
            );
          })}
        </Stack>
      </Collapse>
    </Box>
  );
}
