import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
const originalFetch = globalThis.fetch,
  originalWindow = globalThis.window,
  originalNow = Date.now;
afterEach(() => {
  globalThis.fetch = originalFetch;
  Date.now = originalNow;
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
});
let serial = 0;
async function loadCache() {
  const s = await readFile(new URL('../src/lib/campaignCache.js', import.meta.url), 'utf8');
  return import(
    `data:text/javascript;base64,${Buffer.from(s + '\n//' + serial++).toString('base64')}`
  );
}
const item = (id = 'active') => ({ _id: id, title: id, isActive: true });
const response = (data) => ({ ok: true, json: async () => data });
function storage() {
  const map = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (k) => map.get(k) || null,
      setItem: (k, v) => map.set(k, v),
      removeItem: (k) => map.delete(k),
    },
  };
  return map;
}

test('SSR regeneration reads fresh active campaigns rather than a second hour-long server cache', async () => {
  delete globalThis.window;
  const cache = await loadCache();
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return response(calls === 1 ? [item('andac')] : []);
  };
  assert.equal((await cache.getServerCampaigns()).length, 1);
  assert.deepEqual(await cache.getServerCampaigns(), []);
  assert.equal(calls, 2);
});
test('new empty page props replace legacy browser storage and cache empty lists', async () => {
  const map = storage();
  map.set(
    'tmmob:campaigns:v1',
    JSON.stringify({ data: [item('andac')], expiresAt: Date.now() + 3600000 })
  );
  const c = await loadCache();
  c.seedClientCampaigns([]);
  globalThis.fetch = () => {
    throw Error('must use fresh seeded list');
  };
  assert.deepEqual(await c.getClientCampaigns(), []);
  assert.equal(map.has('tmmob:campaigns:v1'), false);
});
test('stored expiry is preserved and inactive campaigns never re-enter the browser list', async () => {
  const map = storage();
  let now = 100000;
  Date.now = () => now;
  map.set(
    'tmmob:campaigns:v2',
    JSON.stringify({ data: [item(), { ...item('disabled'), isActive: false }], expiresAt: 110000 })
  );
  const c = await loadCache();
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return response([]);
  };
  assert.equal((await c.getClientCampaigns()).length, 1);
  now = 111000;
  assert.deepEqual(await c.getClientCampaigns(), []);
  assert.equal(calls, 1);
});
test('forced refresh ignores cached campaigns; invalidated in-flight data cannot restore a removed campaign', async () => {
  storage();
  const c = await loadCache();
  c.seedClientCampaigns([item('andac')]);
  let resolve;
  globalThis.fetch = () => new Promise((r) => (resolve = r));
  const pending = c.getClientCampaigns({ force: true });
  c.seedClientCampaigns([]);
  resolve(response([item('andac')]));
  assert.deepEqual(await pending, []);
  assert.deepEqual(await c.getClientCampaigns(), []);
});
test('an aborted request does not populate browser storage', async () => {
  const map = storage(),
    c = await loadCache(),
    controller = new AbortController();
  globalThis.fetch = async () => {
    controller.abort();
    return response([item('andac')]);
  };
  assert.deepEqual(await c.getClientCampaigns({ force: true, signal: controller.signal }), []);
  assert.equal(map.has('tmmob:campaigns:v2'), false);
});

async function loadHandler(path) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const sigSource = await readFile(
    new URL('../src/lib/webhookSignature.js', import.meta.url),
    'utf8'
  );
  const { verifySignature } = await import(
    `data:text/javascript;base64,${Buffer.from(sigSource).toString('base64')}`
  );
  return new Function(
    'affectsDiscovery',
    'invalidateDiscoveryCache',
    'verifySignature',
    'invalidateServerMainMenuCache',
    'invalidateServerRightMenuCache',
    'invalidateServerSettingsCache',
    'return (' +
      source
        .replace(/^import .*;\n/gm, '')
        .replace('export default ', '')
        .trim() +
      ')'
  )(
    () => false,
    async () => {},
    verifySignature,
    () => {},
    () => {},
    () => {}
  );
}
for (const path of ['../src/pages/api/webhooks.js', '../src/pages/api/webhook/campaign.js']) {
  test(
    path +
      ' authenticates before awaiting homepage regeneration and returns 500 for retry on failure',
    async () => {
      const old = process.env.WEBHOOK_SECRET;
      process.env.WEBHOOK_SECRET = 'isolated-campaign-test';
      try {
        const handler = await loadHandler(path),
          body = { _id: 'campaign' },
          signature = crypto
            .createHmac('sha256', process.env.WEBHOOK_SECRET)
            .update(JSON.stringify(body))
            .digest('hex');
        let status,
          called = 0,
          finished = false;
        const res = {
          setHeader() {},
          status(n) {
            status = n;
            return this;
          },
          json(value) {
            return value;
          },
          revalidate: async (path) => {
            assert.equal(path, '/');
            called++;
            await Promise.resolve();
            finished = true;
          },
        };
        await handler({ method: 'POST', headers: { 'x-cms-event': 'campaign.update' }, body }, res);
        assert.equal(status, 401);
        assert.equal(called, 0);
        await handler(
          {
            method: 'POST',
            headers: { 'x-cms-event': 'campaign.update', 'x-cms-signature': signature },
            body,
          },
          res
        );
        assert.equal(status, 200);
        assert.equal(finished, true);
        res.revalidate = async () => {
          throw Error('regeneration failed');
        };
        await handler(
          {
            method: 'POST',
            headers: { 'x-cms-event': 'campaign.delete', 'x-cms-signature': signature },
            body,
          },
          res
        );
        assert.equal(status, 500);
      } finally {
        if (old === undefined) delete process.env.WEBHOOK_SECRET;
        else process.env.WEBHOOK_SECRET = old;
      }
    }
  );
}

test('placements and target pages share a single selector; popup frequency is honored without requests', async () => {
  const { selectCampaigns, canShowPopup, markPopupAsShown } =
    await import('../src/lib/campaignPlacements.mjs');
  const campaigns = [
    { ...item('popup'), placement: 'popup', targetPages: ['home'], priority: 2 },
    { ...item('banner'), placement: 'banner', targetPages: ['all'] },
    { ...item('detail'), placement: 'popup', targetPages: ['detail'] },
    { ...item('off'), isActive: false, placement: 'popup', targetPages: ['home'] },
  ];
  assert.deepEqual(
    selectCampaigns(campaigns, { pageType: 'home', placement: 'popup' }).map((x) => x._id),
    ['popup']
  );
  assert.deepEqual(
    selectCampaigns(campaigns, { pageType: 'detail', placement: 'banner' }).map((x) => x._id),
    ['banner']
  );
  assert.deepEqual(selectCampaigns(campaigns, { pageType: 'home', placement: 'invalid' }), []);
  const local = new Map(),
    session = new Map(),
    store = (map) => ({ getItem: (k) => map.get(k) || null, setItem: (k, v) => map.set(k, v) }),
    browser = { localStorage: store(local), sessionStorage: store(session) };
  for (const frequency of ['every_login', 'daily', 'once']) {
    const c = { ...item(frequency), popupFrequency: frequency };
    assert.equal(canShowPopup(c, undefined), false);
    assert.equal(canShowPopup(c, browser, 100000), true);
    markPopupAsShown(c, browser, 100000);
    assert.equal(canShowPopup(c, browser, 100001), false);
    if (frequency === 'daily') assert.equal(canShowPopup(c, browser, 86500000), true);
  }
  assert.equal(
    canShowPopup(item(), {
      get sessionStorage() {
        throw Error('blocked');
      },
    }),
    true
  );
});
