const TURKISH_CHAR_MAP = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

function normalizeTurkishText(value = "") {
  return String(value)
    .split("")
    .map((char) => TURKISH_CHAR_MAP[char] || char)
    .join("");
}

export function slugifyText(value = "") {
  return normalizeTurkishText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getEntityId(entity) {
  if (!entity) {
    return "";
  }

  if (typeof entity === "string") {
    return entity;
  }

  return String(entity._id || entity.id || "");
}

export function getEntityName(entity, fallback = "") {
  if (!entity) {
    return fallback;
  }

  if (typeof entity === "string") {
    return entity;
  }

  return String(entity.name || entity.title || entity.label || fallback);
}

export function getChamberSlug(chamber) {
  const shortName = String(chamber?.short || "").trim();
  const chamberName = String(chamber?.name || "").trim();
  return slugifyText(shortName || chamberName);
}

export function normalizeFilterValue(value) {
  return typeof value === "string" ? value.trim() : "";
}
export function formatTermDates(term) {
  const start = term?.startDate?.slice(0, 4);
  const end = term?.endDate?.slice(0, 4);
  return start && end
    ? start === end
      ? start
      : `${start}–${end}`
    : start || end || "";
}
export function formatTermDateRange(term) {
  const format = (value) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || "");
    return match ? `${match[3]}.${match[2]}.${match[1]}` : "";
  };
  const start = format(term?.startDate);
  const end = format(term?.endDate);
  return start && end
    ? `${start} – ${end}`
    : start
      ? `Başlangıç: ${start}`
      : end
        ? `Bitiş: ${end}`
        : "";
}
export function toBoardView(board) {
  return {
    _id: board._id,
    name: board.name || "",
    term: board.term || null,
    chamber: board.chamber || null,
    type: board.type || null,
    members: Array.isArray(board.members) ? board.members : [],
  };
}
export function getArchiveTerms(terms, latestTerm, missingCount) {
  const archived = terms.filter((term) => term.name !== latestTerm);
  if (latestTerm && missingCount > 0)
    archived.push({ name: "", missing: true, boardCount: missingCount });
  return archived;
}
async function fetchJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("Kurul verisi alınamadı.");
  return response.json();
}
export async function loadBoardDirectory(
  apiBaseUrl,
  query = {},
  chamberSlug = "",
) {
  const empty = {
    boards: [],
    boardTypes: [],
    chambers: [],
    terms: [],
    missingCount: 0,
    latestTerm: null,
    fixedChamber: null,
    chamberSlug,
    total: 0,
    totalPages: 0,
    page: 1,
    initialFilters: { typeId: "", chamberId: "", donem: "", donemsiz: "" },
    unavailable: false,
  };
  if (!apiBaseUrl) return { props: { ...empty, unavailable: true } };
  try {
    const [boardTypes, chambersPayload] = await Promise.all([
      fetchJson(`${apiBaseUrl}/board-types`),
      fetchJson(`${apiBaseUrl}/chambers?page=1&limit=200`),
    ]);
    const chambers = chambersPayload.data || [];
    const fixedChamber = chamberSlug
      ? chambers.find((item) => getChamberSlug(item) === chamberSlug)
      : null;
    if (chamberSlug && !fixedChamber) return { notFound: true };
    const validId = (value, items) =>
      items.some((item) => getEntityId(item) === value) ? value : "";
    const chamberId =
      getEntityId(fixedChamber) ||
      validId(normalizeFilterValue(query.chamberId), chambers);
    const typeId = validId(normalizeFilterValue(query.typeId), boardTypes);
    const donem =
      fixedChamber && typeof query.donem === "string" && query.donem.trim()
        ? query.donem.slice(0, 120)
        : "";
    const donemsiz =
      fixedChamber && !donem && query.donemsiz === "1" ? "1" : "";
    const rawPage = normalizeFilterValue(query.page);
    const page =
      /^\d+$/.test(rawPage) && Number(rawPage) >= 1 && Number(rawPage) <= 100000
        ? Number(rawPage)
        : 1;
    // Geçmiş dönem bağlantısı üstteki güncel kurulları değiştirmez.
    const terms = fixedChamber
      ? await fetchJson(
          `${apiBaseUrl}/boards/terms?${new URLSearchParams({ chamber: chamberId })}`,
        )
      : { data: [], missingCount: 0 };
    const latestTerm = terms.latest || terms.data?.[0]?.name || null;
    const params = new URLSearchParams({ page: String(page), limit: "12" });
    if (chamberId) params.set("chamber", chamberId);
    if (typeId) params.set("type", typeId);
    if (fixedChamber) {
      if (latestTerm) params.set("term", latestTerm);
      else params.set("termMissing", "true");
    } else params.set("latest", "true");
    const result = await fetchJson(`${apiBaseUrl}/boards?${params}`);
    return {
      props: {
        ...empty,
        boards: (result.data || []).map(toBoardView),
        total: result.total || 0,
        totalPages: result.totalPages || 0,
        page,
        boardTypes,
        chambers,
        fixedChamber,
        latestTerm,
        terms: terms.data || [],
        missingCount: terms.missingCount || 0,
        initialFilters: { chamberId, typeId, donem, donemsiz },
      },
    };
  } catch {
    return { props: { ...empty, unavailable: true } };
  }
}
