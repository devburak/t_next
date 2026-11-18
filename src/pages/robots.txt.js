import { getSiteUrl } from '../lib/seo';
export function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');
  res.end(`User-agent: *\nAllow: /\nDisallow: /preview/\nDisallow: /search\n\nSitemap: ${getSiteUrl()}/sitemap.xml\n`);
  return { props: {} };
}
export default function Robots() { return null; }
