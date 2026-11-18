import { serveDiscovery } from '../../lib/discoveryResponse';
export const getServerSideProps = ({ res, params }) => serveDiscovery(res, { type: 'sitemap', part: params.name });
export default function SitemapPart() { return null; }
