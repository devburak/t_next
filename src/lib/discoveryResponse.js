import { getSiteUrl } from './seo';
import { getDiscoveryCatalog, getFeed } from './siteDiscovery';
import { renderRss, renderSitemap, renderSitemapIndex, sitemapParts } from './discoveryXml.mjs';

export async function serveDiscovery(res, { type, category = '', part = '' }) {
  try {
    let output;
    if (type === 'rss') {
      const feed = await getFeed(category);
      if (!feed) return { notFound: true };
      output = renderRss(getSiteUrl(), feed);
    } else {
      if (part && !/^(pages|contents|categories|publications|documents|events|videos|work-groups|chambers)-[1-9]\d*\.xml$/.test(part)) return { notFound: true };
      const catalog = await getDiscoveryCatalog();
      const selected = part ? sitemapParts(catalog.items).find(row => row.name === part) : null;
      if (part && !selected) return { notFound: true };
      output = part ? renderSitemap(getSiteUrl(), selected.items) : renderSitemapIndex(getSiteUrl(), catalog.items);
    }
    res.setHeader('Content-Type', type === 'rss' ? 'application/rss+xml; charset=utf-8' : 'application/xml; charset=utf-8');
    // The shared server cache is the freshness authority, including webhook purges.
    res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');
    res.end(output);
    return { props: {} };
  } catch {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Retry-After', '60');
    res.end('Bu yayın akışı geçici olarak kullanılamıyor.');
    return { props: {} };
  }
}
