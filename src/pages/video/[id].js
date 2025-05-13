import Layout from '../../component/basic/layout';
import ContentContainer from '../../component/ContentContainer';
import VideoPlayer from '../../component/VideoPlayer';

const VideoPage = ({ video }) => {
  return (
    <Layout>
        <p>just video</p>
      {/* <ContentContainer>
        <h1>{video.title}</h1>
        <VideoPlayer video={video} />
      </ContentContainer> */}
    </Layout>
  );
};

const apiBaseUrl = process.env.API_BASE_URL;

export async function getServerSideProps({ params }) {
  const { id } = params;
  try {
    const res = await fetch(`${apiBaseUrl}/videos/${id}`);
    if (!res.ok) {
      return {
        notFound: true,
      };
    }
    const video = await res.json();
    return {
      props: { video },
    };
  } catch (error) {
    console.error("Veri çekme hatası:", error);
    return {
      notFound: true,
    };
  }
}

export default VideoPage;
