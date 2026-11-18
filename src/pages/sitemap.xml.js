import { serveDiscovery } from '../lib/discoveryResponse';
export const getServerSideProps = ({ res }) => serveDiscovery(res, { type: 'sitemap' });
export default function Sitemap() { return null; }
