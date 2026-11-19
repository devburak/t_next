import PageMetadata from '../../component/basic/PageMetadata';
import { videoThumbnail } from '../../lib/video.mjs';
import { DEFAULT_OG_IMAGE } from '../../lib/seo';
import Layout from '../../component/basic/layout';
import { Box } from '@mui/material';
import VideoPlayer from '../../component/VideoPlayer';

const VideoPage = ({ video }) => (
  <Layout>
    <PageMetadata title={video.title} description={video.description || video.title} path={`/video/${video._id}`} image={videoThumbnail(video, DEFAULT_OG_IMAGE)} type="video.other" />
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
