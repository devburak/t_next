import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getWarmupPaths, warmImageCache } from '../scripts/warm-image-cache.mjs';

test('warmup selects bounded responsive variants, decodes HTML and deduplicates', () => {
  const preload = '<link rel="preload" as="image" imageSrcSet="/_next/image?url=%2Fhero.jpg&amp;w=384&amp;q=75 384w, /_next/image?url=%2Fhero.jpg&amp;w=640&amp;q=75 640w, /_next/image?url=%2Fhero.jpg&amp;w=1080&amp;q=75 1080w, /_next/image?url=%2Fhero.jpg&amp;w=1920&amp;q=75 1920w">';
  const paths = getWarmupPaths(preload.repeat(2), 'http://127.0.0.1:3000');
  assert.deepEqual(paths.map((path) => new URL(path, 'http://localhost').searchParams.get('w')), ['384', '640', '1080']);
  assert.ok(paths.every((path) => !path.includes('&amp;')));
  assert.equal(getWarmupPaths(Array.from({ length: 10 }, (_, id) => preload.replaceAll('hero.jpg', `hero-${id}.jpg`)).join(''), 'http://localhost').length, 6);
});

test('warmup ignores external URLs, scripts, normal images and malformed links', () => {
  const html = '<link rel="preload" as="image" href="https://other.example/_next/image?url=x&w=640">' +
    '<link rel="preload" as="script" href="/_next/image?w=640">' +
    '<link rel="preload" as="image" href="/original.jpg">' +
    '<link rel="preload" as="image" href="http://[invalid">';
  assert.deepEqual(getWarmupPaths(html, 'http://localhost'), []);
});

test('warmup rejects credential-bearing or non-root destinations before fetching', async () => {
  for (const origin of ['file:///tmp/', 'http://user:password@localhost/', 'http://localhost/api', 'http://localhost/?token=private']) {
    await assert.rejects(warmImageCache(origin), /Site kökü/);
  }
});
