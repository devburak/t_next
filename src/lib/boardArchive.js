import { toBoardView } from "./boardDirectory";

export function parseArchiveQuery(query = {}) {
  const allowed = ["chamber", "term", "termMissing", "type", "page"];
  const invalid = () => {
    throw Object.assign(new Error("Geçersiz arşiv filtresi."), { status: 400 });
  };
  if (
    Object.keys(query).some((key) => !allowed.includes(key)) ||
    Object.values(query).some((value) => typeof value !== "string")
  )
    invalid();
  if (!/^[a-f\d]{24}$/i.test(query.chamber || "")) invalid();
  if (query.type !== undefined && !/^[a-f\d]{24}$/i.test(query.type)) invalid();
  const missing = query.termMissing === "true";
  if (query.termMissing !== undefined && !missing) invalid();
  if (
    missing
      ? query.term !== undefined
      : !query.term?.trim() || query.term.length > 120
  )
    invalid();
  const page = query.page || "1";
  if (!/^\d+$/.test(page) || Number(page) < 1 || Number(page) > 100000)
    invalid();
  const params = new URLSearchParams({
    chamber: query.chamber,
    limit: "12",
    page,
  });
  if (missing) params.set("termMissing", "true");
  else params.set("term", query.term);
  if (query.type) params.set("type", query.type);
  return params;
}
export async function fetchBoardArchive(apiBaseUrl, query) {
  const params = parseArchiveQuery(query);
  if (!apiBaseUrl) throw new Error("Kurul arşivi şu anda yüklenemiyor.");
  const response = await fetch(`${apiBaseUrl}/boards?${params}`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Kurul arşivi şu anda yüklenemiyor.");
  const result = await response.json();
  return {
    data: (result.data || []).map(toBoardView),
    total: result.total || 0,
    page: Number(params.get("page")),
    totalPages: result.totalPages || 0,
  };
}
