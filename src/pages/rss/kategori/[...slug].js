import { serveDiscovery } from '../../../lib/discoveryResponse';
export async function getServerSideProps({ res, params }) {
  const category = params.slug.join('/').replace(/\.xml$/, '');
  if (!category || category.length > 300) return { notFound: true };
  return serveDiscovery(res, { type: 'rss', category });
}
export default function CategoryRss() { return null; }
