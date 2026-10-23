import Head from 'next/head';
import Layout from '../../component/basic/layout';
import { Box } from '@mui/material';
import VideoPlayer from '../../component/VideoPlayer';
import { buildCanonicalUrl } from '../../lib/seo';

const VideoPage = ({ video }) => (
  <Layout>
    <Head>
      <title>{video.title} | TMMOB</title>
      <meta name="description" content={video.title} />
      <link rel="canonical" href={buildCanonicalUrl(`/video/${video._id}`)} />
    </Head>
    <Box sx={{ p: 2, bgcolor: "background.paper" }}>
      <h1>{video.title}</h1>
      <VideoPlayer video={video} />
    </Box>
  </Layout>
);

export async function getServerSideProps({ params }) {
  if (!/^[a-f\d]{24}$/i.test(params.id)) return { notFound: true };
  const res = await fetch(`${process.env.API_BASE_URL}/videos/${params.id}`);
  if (res.status === 404) return { notFound: true };
  if (!res.ok) throw new Error(`Video API: ${res.status}`);
  return { props: { video: await res.json() } };
}

export default VideoPage;
