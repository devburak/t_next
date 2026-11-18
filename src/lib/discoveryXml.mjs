export const SITEMAP_PAGE_SIZE = 5000;
export const xml = value => String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;' }[c]));
export function absoluteUrl(siteUrl, pathname = '/') {
  if (!String(pathname).startsWith('/') || String(pathname).startsWith('//')) throw new Error('Local path required');
  return new URL(pathname, siteUrl).href;
}
export function isoDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) && date.getTime() <= Date.now() ? date.toISOString() : null;
}
export function sitemapParts(items) {
  const groups = new Map();
  for (const item of items) {
    if (!groups.has(item.section)) groups.set(item.section, []);
    groups.get(item.section).push(item);
  }
  const parts = [];
  for (const [section, rows] of groups) for (let i = 0; i < rows.length; i += SITEMAP_PAGE_SIZE) {
    parts.push({ name: `${section}-${i / SITEMAP_PAGE_SIZE + 1}.xml`, items: rows.slice(i, i + SITEMAP_PAGE_SIZE) });
  }
  return parts;
}
const declaration = '<?xml version="1.0" encoding="UTF-8"?>';
export function renderSitemapIndex(siteUrl, items) {
  return declaration + '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + sitemapParts(items).map(part => {
    const lastmod = part.items.map(item => isoDate(item.lastmod)).filter(Boolean).sort().at(-1);
    return `<sitemap><loc>${xml(absoluteUrl(siteUrl, `/sitemaps/${part.name}`))}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</sitemap>`;
  }).join('') + '</sitemapindex>';
}
export function renderSitemap(siteUrl, items) {
  return declaration + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + items.map(item => {
    const lastmod = isoDate(item.lastmod);
    return `<url><loc>${xml(absoluteUrl(siteUrl, item.path))}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;
  }).join('') + '</urlset>';
}
function plainText(value) { return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
export function renderRss(siteUrl, feed) {
  const items = feed.items.filter(row => row.slug && row.title && (!row.status || row.status === 'published') && isoDate(row.publishDate));
  const lastDate = items.map(row => isoDate(row.publishDate)).sort().at(-1);
  return declaration + '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>' +
    `<title>${xml(feed.title)}</title><link>${xml(absoluteUrl(siteUrl, feed.pagePath || '/'))}</link>` +
    `<description>${xml(feed.description || 'TMMOB güncel içerikleri')}</description><language>tr-TR</language><ttl>5</ttl>` +
    `<atom:link href="${xml(absoluteUrl(siteUrl, feed.feedPath))}" rel="self" type="application/rss+xml"/>` +
    (lastDate ? `<lastBuildDate>${new Date(lastDate).toUTCString()}</lastBuildDate>` : '') +
    items.map(row => `<item><title>${xml(row.title)}</title><link>${xml(absoluteUrl(siteUrl, `/${row.slug}`))}</link>` +
      `<guid isPermaLink="false">${xml(`urn:tmmob:content:${row._id || row.slug}`)}</guid>` +
      `<pubDate>${new Date(row.publishDate).toUTCString()}</pubDate>` +
      `<description>${xml(plainText(row.spot || row.metaDescription || row.bodyHtml).slice(0, 600))}</description></item>`).join('') +
    '</channel></rss>';
}
