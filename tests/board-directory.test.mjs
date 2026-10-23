import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source = await readFile(
  new URL("../src/lib/boardDirectory.js", import.meta.url),
  "utf8",
);
const {
  loadBoardDirectory,
  getChamberSlug,
  formatTermDates,
  formatTermDateRange,
  getArchiveTerms,
} = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);
const chamber = {
  _id: "012345678901234567890123",
  short: "İMO",
  name: "İnşaat Mühendisleri Odası",
};
const type = { _id: "112345678901234567890123", name: "Yönetim" };
function mockFetch() {
  const urls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (value) => {
    const url = new URL(value);
    urls.push(url);
    const data = url.pathname.endsWith("/board-types")
      ? [type]
      : url.pathname.endsWith("/chambers")
        ? { data: [chamber] }
        : url.pathname.endsWith("/terms")
          ? { data: [{ name: "48. Dönem" }], missingCount: 2 }
          : {
              data: [
                {
                  _id: "b",
                  period: { name: "TMMOB dönemi" },
                  term: { name: "48. Dönem" },
                },
              ],
              total: 25,
              totalPages: 3,
            };
    return { ok: true, json: async () => data };
  };
  return {
    urls,
    restore: () => {
      globalThis.fetch = original;
    },
  };
}
test("directory makes one paginated board request and ignores legacy TMMOB periodId", async () => {
  const mock = mockFetch();
  try {
    const { props } = await loadBoardDirectory("https://example.test/api", {
      periodId: "old",
      page: "2",
      typeId: type._id,
      chamberId: chamber._id,
    });
    const boards = mock.urls.filter((url) => url.pathname.endsWith("/boards"));
    assert.equal(boards.length, 1);
    assert.equal(mock.urls.length, 3);
    assert.equal(boards[0].searchParams.get("latest"), "true");
    assert.equal(boards[0].searchParams.get("page"), "2");
    assert.equal(boards[0].searchParams.get("type"), type._id);
    assert.equal(boards[0].searchParams.has("periodId"), false);
    assert.equal(props.total, 25);
    assert.equal(Object.hasOwn(props.boards[0], "period"), false);
    assert.equal(
      mock.urls.some((url) => url.pathname.endsWith("/periods")),
      false,
    );
  } finally {
    mock.restore();
  }
});
test("archive deep links preserve current boards and only load chamber metadata on SSR", async () => {
  const mock = mockFetch();
  try {
    const { props } = await loadBoardDirectory(
      "https://example.test/api",
      { donem: "Bilinmeyen / 2026 & dönem", periodId: "old" },
      "imo",
    );
    const boards = mock.urls.find((url) => url.pathname.endsWith("/boards"));
    assert.equal(boards.searchParams.get("term"), "48. Dönem");
    assert.equal(boards.searchParams.has("latest"), false);
    assert.equal(boards.searchParams.get("chamber"), chamber._id);
    assert.equal(props.initialFilters.donem, "Bilinmeyen / 2026 & dönem");
    assert.equal(
      mock.urls
        .find((url) => url.pathname.endsWith("/terms"))
        .searchParams.get("chamber"),
      chamber._id,
    );
  } finally {
    mock.restore();
  }
});
test("missing archive deep link does not replace current boards; invalid queries and unavailable API are safe", async () => {
  const mock = mockFetch();
  try {
    await loadBoardDirectory(
      "https://example.test/api",
      { donemsiz: "1", page: ["2"] },
      "imo",
    );
    assert.equal(
      mock.urls
        .find((url) => url.pathname.endsWith("/boards"))
        .searchParams.get("term"),
      "48. Dönem",
    );
    assert.equal((await loadBoardDirectory("", {})).props.unavailable, true);
    assert.deepEqual(
      await loadBoardDirectory("https://example.test/api", {}, "unknown"),
      { notFound: true },
    );
  } finally {
    mock.restore();
  }
});
test("Turkish chamber slugs and date-only labels do not depend on the local timezone", () => {
  assert.equal(getChamberSlug(chamber), "imo");
  assert.equal(formatTermDates({ startDate: "2026-01-01T00:00:00Z" }), "2026");
  assert.equal(formatTermDates({ endDate: "2027-01-01T00:00:00Z" }), "2027");
  assert.equal(formatTermDates({}), "");
});

test("history excludes the current term and places missing records in their own group", () => {
  const terms = [
    { name: "48. Dönem" },
    { name: "47. Dönem", startDate: "2022-01-01", endDate: "2024-05-05" },
  ];
  assert.deepEqual(getArchiveTerms(terms, "48. Dönem", 2), [
    terms[1],
    { name: "", missing: true, boardCount: 2 },
  ]);
  assert.deepEqual(getArchiveTerms([], null, 2), []);
  assert.equal(formatTermDateRange(terms[1]), "01.01.2022 – 05.05.2024");
  assert.equal(
    formatTermDateRange({ startDate: "2024-01-01T00:00:00Z" }),
    "Başlangıç: 01.01.2024",
  );
  assert.equal(
    formatTermDateRange({ endDate: "2025-05-02" }),
    "Bitiş: 02.05.2025",
  );
  assert.equal(formatTermDateRange({}), "");
});
