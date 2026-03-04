import { getApiBaseUrl, getSiteUrl, toIsoDate } from '../lib/seo';
import {
  buildSectionPagePath,
  shouldResolveSectionCategory,
} from '../lib/sectionRouting';

const PAGE_SIZE = 100;

function asId(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'object') {
    return String(value._id || value.id || '');
  }

  return String(value);
}

function normalizePath(pathname = '') {
  const path = String(pathname || '').trim();
  if (!path) {
    return '';
  }

  if (path === '/') {
    return '';
  }

  return path.startsWith('/') ? path : `/${path}`;
}

function buildAbsoluteUrl(siteUrl, pathname = '') {
  return `${siteUrl}${normalizePath(pathname)}`;
}

function buildCategoryPath(category, categoryMap) {
  const segments = [];
  let current = category;

  while (current) {
    if (current.slug) {
      segments.unshift(current.slug);
    }

    const parentId = asId(current.parent);
    current = parentId ? categoryMap.get(parentId) : null;
  }

  return segments.join('/');
}

function resolveCategoryPagePath(categoryPath, category) {
  if (!category?.slug) {
    return null;
  }

  if (categoryPath.startsWith('belgeler/')) {
    return `/belgeler/liste/${category.slug}`;
  }

  if (categoryPath === 'tmmob' && shouldResolveSectionCategory('tmmob')) {
    return buildSectionPagePath('tmmob');
  }

  if (categoryPath === 'hukuk' && shouldResolveSectionCategory('hukuk')) {
    return buildSectionPagePath('hukuk');
  }

  if (categoryPath.startsWith('tmmob/') && shouldResolveSectionCategory('tmmob', category.slug)) {
    return buildSectionPagePath('tmmob', category.slug);
  }

  if (categoryPath.startsWith('hukuk/') && shouldResolveSectionCategory('hukuk', category.slug)) {
    return buildSectionPagePath('hukuk', category.slug);
  }

  return `/kategori/${category.slug}`;
}

function resolveContentPagePath(content, categoryPath = '') {
  if (!content?.slug) {
    return null;
  }

  if (categoryPath.startsWith('belgeler')) {
    return `/belgeler/${content.slug}`;
  }

  if (categoryPath.startsWith('tmmob')) {
    return buildSectionPagePath('tmmob', content.slug);
  }

  if (categoryPath.startsWith('hukuk')) {
    return buildSectionPagePath('hukuk', content.slug);
  }

  return `/${content.slug}`;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status}`);
  }

  return response.json();
}

async function fetchPaginatedCollection(buildUrl, pickItems) {
  const items = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const payload = await fetchJson(buildUrl(page));
    const pageItems = pickItems(payload);
    items.push(...pageItems);

    if (payload.totalPages) {
      totalPages = payload.totalPages;
    } else if (payload.total && payload.limit) {
      totalPages = Math.max(1, Math.ceil(payload.total / payload.limit));
    } else if (payload.totalCount && payload.limit) {
      totalPages = Math.max(1, Math.ceil(payload.totalCount / payload.limit));
    } else {
      totalPages = 1;
    }

    page += 1;
  }

  return items;
}

function addUrl(urlMap, siteUrl, pathname, lastmod) {
  const normalizedPath = normalizePath(pathname);
  const loc = buildAbsoluteUrl(siteUrl, normalizedPath);
  const currentLastmod = urlMap.get(loc);

  if (!currentLastmod || (lastmod && currentLastmod < lastmod)) {
    urlMap.set(loc, lastmod || undefined);
  }
}

function buildSitemapXml(urlMap) {
  const urlNodes = Array.from(urlMap.entries())
    .map(([loc, lastmod]) => {
      const lastmodNode = lastmod ? `<lastmod>${lastmod}</lastmod>` : '';
      return `<url><loc>${loc}</loc>${lastmodNode}</url>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlNodes}</urlset>`;
}

export async function getServerSideProps({ res }) {
  const siteUrl = getSiteUrl();
  const apiBaseUrl = getApiBaseUrl();
  const urlMap = new Map();

  addUrl(urlMap, siteUrl, '/', new Date().toISOString());
  addUrl(urlMap, siteUrl, '/video-galeri');
  addUrl(urlMap, siteUrl, '/takvim');

  if (apiBaseUrl) {
    try {
      const categories = await fetchJson(`${apiBaseUrl}/category`);
      const categoryMap = new Map(
        (Array.isArray(categories) ? categories : []).map((category) => [asId(category._id), category])
      );

      for (const category of Array.isArray(categories) ? categories : []) {
        const categoryPath = buildCategoryPath(category, categoryMap);
        const categoryPagePath = resolveCategoryPagePath(categoryPath, category);

        if (categoryPagePath) {
          addUrl(urlMap, siteUrl, categoryPagePath, toIsoDate(category.updatedAt));
        }

        if (!categoryPath) {
          continue;
        }

        const contents = await fetchPaginatedCollection(
          (page) => `${apiBaseUrl}/contents/category/${categoryPath}?limit=${PAGE_SIZE}&page=${page}`,
          (payload) => payload.contents || []
        );

        for (const content of contents) {
          const contentPagePath = resolveContentPagePath(content, categoryPath);
          if (contentPagePath) {
            addUrl(urlMap, siteUrl, contentPagePath, toIsoDate(content.updatedAt || content.publishDate));
          }
        }
      }

      const publications = await fetchPaginatedCollection(
        (page) => `${apiBaseUrl}/publication?limit=${PAGE_SIZE}&page=${page}`,
        (payload) => payload.data || []
      );

      for (const publication of publications) {
        addUrl(
          urlMap,
          siteUrl,
          `/yayin/${publication.slug || publication._id}`,
          toIsoDate(publication.updatedAt || publication.publishDate || publication.createdAt)
        );

        for (const category of publication.categories || []) {
          if (category?.slug) {
            addUrl(urlMap, siteUrl, `/yayin-turu/${category.slug}`, toIsoDate(category.updatedAt));
          }
        }
      }

      const reportCategories = await fetchJson(`${apiBaseUrl}/report-categories`);
      for (const reportCategory of Array.isArray(reportCategories) ? reportCategories : []) {
        if (reportCategory?.slug) {
          addUrl(
            urlMap,
            siteUrl,
            `/belgeler/${reportCategory.slug}`,
            toIsoDate(reportCategory.updatedAt || reportCategory.createdAt)
          );
        }
      }

      const reports = await fetchPaginatedCollection(
        (page) => `${apiBaseUrl}/reports?limit=${PAGE_SIZE}&page=${page}`,
        (payload) => payload.data || []
      );

      for (const report of reports) {
        if (!report?.slug) {
          continue;
        }

        addUrl(
          urlMap,
          siteUrl,
          `/belgeler/${report.slug}`,
          toIsoDate(report.updatedAt || report.publishDate || report.createdAt)
        );
      }

      const events = await fetchPaginatedCollection(
        (page) => `${apiBaseUrl}/events/list?limit=${PAGE_SIZE}&page=${page}`,
        (payload) => payload.events || []
      );

      for (const event of events) {
        addUrl(
          urlMap,
          siteUrl,
          `/etkinlik/${event._id}`,
          toIsoDate(event.updatedAt || event.startDate || event.createdAt)
        );
      }

      const videos = await fetchPaginatedCollection(
        (page) => `${apiBaseUrl}/videos?limit=${PAGE_SIZE}&page=${page}`,
        (payload) => payload.videos || []
      );

      for (const video of videos) {
        addUrl(
          urlMap,
          siteUrl,
          `/video/${video._id}`,
          toIsoDate(video.updatedAt || video.createdAt)
        );
      }
    } catch (error) {
      console.error('sitemap generation failed:', error);
    }
  }

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.write(buildSitemapXml(urlMap));
  res.end();

  return {
    props: {},
  };
}

export default function Sitemap() {
  return null;
}
