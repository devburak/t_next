import { serveDiscovery } from '../lib/discoveryResponse';
export const getServerSideProps = ({ res }) => serveDiscovery(res, { type: 'rss' });
export default function Rss() { return null; }
