export const SITE_NAME = 'Türk Mühendis ve Mimar Odaları Birliği';
export const SITE_LOGO = 'https://storage.ikon-x.com.tr/2024/02/tmmob.png';
export const SITE_PROFILES = ['https://www.facebook.com/tmmob1954/', 'https://x.com/tmmob1954', 'https://www.instagram.com/tmmob1954/', 'https://www.youtube.com/channel/UCcueF3RXjWfm0koMg1OnAXQ'];
export function serializeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
export function canonicalPagePath(pathname, page) {
  const url = new URL(pathname, 'https://canonical.invalid');
  if (url.origin !== 'https://canonical.invalid') throw new Error('Local canonical path required');
  url.hash = '';
  if (Number.isSafeInteger(Number(page)) && Number(page) > 1) url.searchParams.set('page', String(Number(page)));
  else url.searchParams.delete('page');
  return `${url.pathname}${url.search}`;
}
export function homeStructuredData(siteUrl) {
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Organization', '@id': `${siteUrl}/#organization`, name: SITE_NAME, alternateName: 'TMMOB', url: siteUrl, logo: SITE_LOGO, sameAs: SITE_PROFILES },
    { '@type': 'WebSite', '@id': `${siteUrl}/#website`, name: SITE_NAME, alternateName: 'TMMOB', url: siteUrl, inLanguage: 'tr-TR', publisher: { '@id': `${siteUrl}/#organization` } },
  ] };
}
