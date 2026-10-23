import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TARGET_WIDTHS = [384, 640, 1080];
const MAX_IMAGES = 6;

// Only warm Next Image variants declared as image preloads in server-rendered
// HTML. Never follow arbitrary page links or fetch an image origin directly.
export function getWarmupPaths(html, origin) {
  const paths = new Set();
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  for (const tag of tags) {
    if (!/\brel="preload"/i.test(tag) || !/\bas="image"/i.test(tag)) continue;
    const srcset = tag.match(/\bimagesrcset="([^"]+)"/i)?.[1];
    const href = tag.match(/\bhref="([^"]+)"/i)?.[1];
    const candidates = (srcset ? srcset.split(',').map((part) => part.trim().split(/\s+/)[0]) : [href])
      .filter(Boolean)
      .flatMap((value) => {
        try {
          const url = new URL(value.replaceAll('&amp;', '&'), origin);
          const width = Number(url.searchParams.get('w'));
          return url.origin === new URL(origin).origin && url.pathname === '/_next/image' && width > 0
            ? [{ path: `${url.pathname}${url.search}`, width }] : [];
        } catch {
          return [];
        }
      })
      .sort((a, b) => a.width - b.width);
    for (const width of TARGET_WIDTHS) {
      const candidate = candidates.find((image) => image.width >= width) || candidates.at(-1);
      if (candidate) paths.add(candidate.path);
      if (paths.size === MAX_IMAGES) return [...paths];
    }
  }
  return [...paths];
}

export async function warmImageCache(origin) {
  const base = new URL(origin);
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash || base.pathname !== '/') {
    throw new Error('Site kökü http(s)://sunucu:port biçiminde olmalı.');
  }
  const page = await fetch(base, { signal: AbortSignal.timeout(30_000) });
  if (!page.ok) throw new Error(`Ana sayfa HTTP ${page.status}`);
  const paths = getWarmupPaths(await page.text(), base.origin);
  if (!paths.length) throw new Error('SSR HTML içinde optimize görsel preload bulunamadı.');
  const results = [];
  // Two requests at a time avoid spiking CPU during cold image optimization.
  for (let offset = 0; offset < paths.length; offset += 2) {
    const batch = await Promise.all(paths.slice(offset, offset + 2).map(async (path) => {
      const response = await fetch(new URL(path, base), {
        headers: { Accept: 'image/webp' }, signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) {
        await response.body?.cancel();
        throw new Error(`Görsel cache hazırlığı başarısız: HTTP ${response.status}`);
      }
      const bytes = (await response.arrayBuffer()).byteLength;
      return { cache: response.headers.get('x-nextjs-cache'), bytes, cacheControl: response.headers.get('cache-control') };
    }));
    results.push(...batch);
  }
  return results;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const results = await warmImageCache(process.argv[2] || 'http://127.0.0.1:3000');
    console.log(JSON.stringify({ images: results.length, results }, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
