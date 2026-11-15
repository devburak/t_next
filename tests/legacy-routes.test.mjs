import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeLegacyPath,
  safeLegacyLocation,
  createLegacyRouteCache,
} from "../src/lib/legacyRoutes.mjs";
test("local paths only; encoded redirects and traversal rejected", () => {
  assert.equal(
    normalizeLegacyPath("/kategori/kitap/?page=2"),
    "/kategori/kitap",
  );
  for (const path of [
    "//evil.test",
    "/%2f%2fevil.test",
    "/a/../b",
    "/%252e/x",
    "/%00x",
  ])
    assert.equal(normalizeLegacyPath(path), null);
  assert.equal(safeLegacyLocation("https://evil.test"), null);
  assert.equal(safeLegacyLocation("/ikk#tunceli-ikk"), "/ikk#tunceli-ikk");
});
test("embedded routes are available synchronously while one refresh runs in background", async () => {
  let resolve,
    calls = 0;
  const cache = createLegacyRouteCache({
    seed: [{ path: "/old", status: 301, location: "/new" }],
    fetcher: () => {
      calls++;
      return new Promise((r) => {
        resolve = r;
      });
    },
  });
  const pending = cache.refresh("https://api.test/api");
  assert.deepEqual(cache.lookup("/old"), { status: 301, location: "/new" });
  assert.equal(cache.refresh("https://api.test/api"), pending);
  await Promise.resolve();
  assert.equal(calls, 1);
  resolve({
    ok: true,
    json: async () => [{ path: "/old", status: 410, location: null }],
  });
  await pending;
  assert.equal(cache.lookup("/old").status, 410);
});
test('synchronous fetch failure can retry after the failure TTL', async () => {
  let clock = 0, calls = 0;
  const cache = createLegacyRouteCache({ now: () => clock, fetcher: () => { calls++; throw Error('offline'); } });
  await cache.refresh('https://api.test/api');
  clock = 11000;
  await cache.refresh('https://api.test/api');
  assert.equal(calls, 2);
});
test("failed or malicious manifest cannot erase verified redirects", async () => {
  for (const fetcher of [
    async () => {
      throw Error("offline");
    },
    async () => ({
      ok: true,
      json: async () => [
        { path: "/old", status: 301, location: "//evil.test" },
      ],
    }),
  ]) {
    const cache = createLegacyRouteCache({
      seed: [{ path: "/old", status: 410, location: null }],
      fetcher,
    });
    await cache.refresh("https://api.test/api");
    assert.equal(cache.lookup("/old").status, 410);
  }
});
