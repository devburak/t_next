import { getChamberSlug } from './boardDirectory';
import path from 'node:path';
import { createServerMenuCache } from './serverMenuCache.mjs';
import { getApiBaseUrl } from './seo';
import { isoDate } from './discoveryXml.mjs';

const folder = path.join(process.cwd(), process.env.NEXT_DIST_DIR || '.next', 'cache', 'site-discovery');
const revisionFile = path.join(folder, 'revision');
const API_PAGE_SIZE = 500;
async function json(endpoint) {
  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, { cache: 'no-store', signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Discovery source unavailable (${response.status})`);
  return response.json();
}
function cached(key, load, ttlMs = 300_000, maxEntryBytes = 512 * 1024) {
  return createServerMenuCache({ key: `discovery:v1:${getApiBaseUrl()}:${key}`, load, ttlMs, maxEntryBytes, directory: folder, sharedRevisionFile: revisionFile });
}
async function paginate(endpoint, pick) {
  const rows = []; let totalPages = 1, expectedTotal = null;
  for (let page = 1; page <= totalPages; page++) {
    if (page > 2000) throw new Error('Discovery pagination limit exceeded');
    const result = await json(`${endpoint}${endpoint.includes('?') ? '&' : '?'}limit=${API_PAGE_SIZE}&page=${page}`);
    const items = pick(result);
    if (!Array.isArray(items)) throw new Error('Invalid discovery collection');
    rows.push(...items);
    if (expectedTotal === null && Number.isFinite(result.totalDocuments)) expectedTotal = result.totalDocuments;
    totalPages = Number(result.totalPages || Math.ceil((result.total || result.totalCount || result.totalDocuments || items.length) / (result.limit || API_PAGE_SIZE)) || 1);
  }
  Object.defineProperty(rows, 'expectedTotal', { value: expectedTotal });
  return rows;
}
const categoriesCache = cached('categories', async () => {
  const items = await json('/category');
  if (!Array.isArray(items)) throw new Error('Invalid category collection');
  return { items };
}, 3_600_000);
export function categoryPath(category, categories) {
  const parts = [], visited = new Set(); let current = category;
  const byId = new Map(categories.map(row => [String(row._id), row]));
  while (current) {
    if (visited.has(String(current._id))) throw new Error('Category cycle');
    visited.add(String(current._id)); parts.unshift(current.slug);
    current = byId.get(String(current.parent?._id || current.parent || ''));
  }
  return parts.filter(Boolean).join('/');
}
function categoryPage(category, categories) {
  const full = categoryPath(category, categories);
  if (full.startsWith('belgeler/')) return `/belgeler/liste/${category.slug}`;
  if (/^(tmmob|hukuk)(\/|$)/.test(full)) return `/${full}`;
  return `/kategori/${category.slug}`;
}
const feedCaches = new Map();
export async function getFeed(categorySlug = '') {
  let category, categories;
  if (categorySlug) {
    categories = (await categoriesCache.get())?.items || [];
    category = categories.find(row => row.slug === categorySlug || categoryPath(row, categories) === categorySlug);
    if (!category) return null;
  }
  const key = category ? String(category._id) : 'all';
  if (!feedCaches.has(key)) feedCaches.set(key, cached(`feed:${key}`, async () => {
    const result = await json(category ? `/contents/bycategoryId/${category._id}?limit=20&page=1` : '/contents/public-index?limit=20&page=1');
    if (!Array.isArray(result.contents)) throw new Error('Invalid feed source');
    return { items: result.contents.map(row => ({ _id: row._id, title: row.title, slug: row.slug, status: row.status, publishDate: row.publishDate, spot: String(row.spot || row.metaDescription || row.bodyHtml || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 600) })) };
  }));
  const data = await feedCaches.get(key).get();
  if (!data) throw new Error('Feed unavailable');
  return { ...data, title: category ? `TMMOB — ${category.name}` : 'TMMOB', pagePath: category ? categoryPage(category, categories) : '/', feedPath: categorySlug ? `/rss/kategori/${categorySlug}.xml` : '/rss.xml' };
}

const catalogCache = cached('catalog', async () => {
  const [categoryData, publicContents, publications, reports, decisions, events, videos, families, chambers, reportCategories] = await Promise.all([
    categoriesCache.get(), paginate('/contents/public-index', p => p.contents),
    paginate('/publication', p => p.data), paginate('/reports', p => p.data), paginate('/decisions', p => p.data),
    paginate('/events/list', p => p.events), paginate('/videos', p => p.videos), json('/work-group-families?isListed=true'),
    paginate('/chambers', p => p.data), json('/report-categories'),
  ]);
  const categories = categoryData?.items;
  if (!Array.isArray(categories)) throw new Error('Category sources unavailable');
  const rows = new Map(), contentIds = new Set();
  const add = (section, route, date) => {
    if (!route || route.startsWith('//')) return;
    const next = { section, path: route, ...(isoDate(date) ? { lastmod: isoDate(date) } : {}) };
    const previous = rows.get(route);
    if (!previous || (next.lastmod || '') > (previous.lastmod || '')) rows.set(route, next);
  };
  for (const route of ['/', '/odalar', '/oda-kurullari', '/ikk', '/video-galeri', '/takvim', '/tmmob/yonetim-kurulu', '/tmmob/denetleme-kurulu', '/tmmob/yuksek-onur-kurulu', '/belgeler/calisma-programi', '/belgeler/calisma-raporu', '/belgeler/genel-kurul-sonuc-bildirgesi', '/belgeler/calisma-gruplari']) add('pages', route);
  for (const category of categories) add('categories', categoryPage(category, categories), category.updatedAt);
  const addContent = row => {
    if (!row.slug || (row.status && row.status !== 'published') || !isoDate(row.publishDate)) return;
    contentIds.add(String(row._id)); add('contents', `/${row.slug}`, row.updatedAt || row.publishDate);
  };
  publicContents.forEach(addContent);
  if (publicContents.expectedTotal !== null && contentIds.size < publicContents.expectedTotal) throw new Error('Public content coverage incomplete');
  for (const row of publications) {
    add('publications', `/yayin/${row.slug || row._id}`, row.updatedAt || row.publishDate);
    for (const category of row.categories || []) if (category.slug) add('categories', `/yayin-turu/${category.slug}`, category.updatedAt);
  }
  for (const row of [...reports, ...decisions]) if (row.slug) add('documents', `/belgeler/${row.slug}`, row.updatedAt || row.publishDate);
  for (const row of reportCategories) if (row.slug) add('categories', `/belgeler/${row.slug}`, row.updatedAt);
  for (const row of events) add('events', `/etkinlik/${row._id}`, row.updatedAt || row.createdAt);
  for (const row of videos) add('videos', `/video/${row._id}`, row.updatedAt || row.createdAt);
  for (const row of families) if (row.slug && row.isListed !== false) add('work-groups', `/belgeler/calisma-gruplari/${row.slug}`, row.updatedAt);
  for (const row of chambers) {
    const slug = getChamberSlug(row);
    if (slug) add('chambers', `/oda-kurullari/${slug}`, row.updatedAt);
  }
  return { items: [...rows.values()].sort((a, b) => a.path.localeCompare(b.path, 'tr')), publicContentCount: contentIds.size, generatedAt: new Date().toISOString() };
}, 3_600_000, 8 * 1024 * 1024);
export async function getDiscoveryCatalog() {
  const catalog = await catalogCache.get();
  if (!catalog) throw new Error('Sitemap unavailable');
  return catalog;
}
export async function invalidateDiscoveryCache() { await catalogCache.invalidate(); }
export const affectsDiscovery = event => typeof event === 'string' && /^(content|category|publication|event|video|report|decision|work.?group|chamber|board|period|legacy)[._]/i.test(event);
