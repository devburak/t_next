import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const asModule = (source) =>
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const directoryUrl = asModule(
  await readFile(
    new URL("../src/lib/boardDirectory.js", import.meta.url),
    "utf8",
  ),
);
const archiveUrl = asModule(
  (
    await readFile(
      new URL("../src/lib/boardArchive.js", import.meta.url),
      "utf8",
    )
  )
    .replace("'./boardDirectory'", JSON.stringify(directoryUrl))
    .replace('"./boardDirectory"', JSON.stringify(directoryUrl)),
);
const { parseArchiveQuery, fetchBoardArchive } = await import(archiveUrl);
const { default: handler } = await import(
  asModule(
    (
      await readFile(
        new URL("../src/pages/api/boards/archive.js", import.meta.url),
        "utf8",
      )
    ).replace('"../../../lib/boardArchive"', JSON.stringify(archiveUrl)),
  )
);
const chamber = "012345678901234567890123";
test("archive filters require one chamber and one exact term or missing group, with bounded pagination", () => {
  const params = parseArchiveQuery({
    chamber,
    term: "47. Dönem / 2024 & öncesi",
    page: "2",
  });
  assert.equal(params.get("term"), "47. Dönem / 2024 & öncesi");
  assert.equal(params.get("limit"), "12");
  assert.equal(params.has("latest"), false);
  assert.equal(
    parseArchiveQuery({ chamber, termMissing: "true" }).get("termMissing"),
    "true",
  );
  for (const query of [
    { term: "x" },
    { chamber, term: ["x"] },
    { chamber, term: "x", periodId: "legacy" },
    { chamber, term: "x", latest: "true" },
    { chamber, term: "" },
    { chamber, term: "x", page: "100001" },
    { chamber, term: "x", page: "-1" },
    { chamber, term: "x", type: "bad" },
    { chamber, term: "x", termMissing: "true" },
  ])
    assert.throws(
      () => parseArchiveQuery(query),
      (error) => error.status === 400,
    );
});
test("archive response preserves member titles/order and excludes legacy TMMOB data", async () => {
  const original = globalThis.fetch;
  let url;
  globalThis.fetch = async (value) => {
    url = new URL(value);
    return {
      ok: true,
      json: async () => ({
        data: [
          {
            _id: "b",
            name: "Eski kurul",
            term: { name: "47" },
            members: [
              { title: "Başkan", name: "Birinci" },
              { title: "Üye", name: "İkinci" },
            ],
            period: { name: "TMMOB" },
            createdBy: "private",
          },
        ],
        total: 13,
        totalPages: 2,
      }),
    };
  };
  try {
    const result = await fetchBoardArchive("https://example.test/api", {
      chamber,
      term: "47",
      page: "2",
    });
    assert.equal(url.searchParams.get("chamber"), chamber);
    assert.equal(result.page, 2);
    assert.deepEqual(
      result.data[0].members.map((member) => member.name),
      ["Birinci", "İkinci"],
    );
    assert.equal(result.data[0].members[0].title, "Başkan");
    assert.equal(Object.hasOwn(result.data[0], "period"), false);
    assert.equal(Object.hasOwn(result.data[0], "createdBy"), false);
  } finally {
    globalThis.fetch = original;
  }
});
function response() {
  return {
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    },
  };
}
test("archive API rejects writes and invalid requests before fetching; upstream failures remain retryable and safe", async () => {
  const original = globalThis.fetch;
  const originalBase = process.env.API_BASE_URL;
  process.env.API_BASE_URL = "https://example.test/api";
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    throw new Error("private server detail");
  };
  try {
    const write = response();
    await handler({ method: "POST", query: {} }, write);
    assert.equal(write.statusCode, 405);
    assert.equal(write.headers.Allow, "GET");
    const invalid = response();
    await handler({ method: "GET", query: { chamber, term: ["x"] } }, invalid);
    assert.equal(invalid.statusCode, 400);
    assert.equal(calls, 0);
    const failed = response();
    await handler({ method: "GET", query: { chamber, term: "47" } }, failed);
    assert.equal(failed.statusCode, 502);
    assert.equal(failed.headers["Cache-Control"], "no-store");
    assert.equal(JSON.stringify(failed.body).includes("private"), false);
  } finally {
    globalThis.fetch = original;
    if (originalBase === undefined) delete process.env.API_BASE_URL;
    else process.env.API_BASE_URL = originalBase;
  }
});
