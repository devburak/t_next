import VideoPlayer from './VideoPlayer';
import styles from '../styles/VideoGrid.module.css';

const VideoGrid = ({ videos, page, limit }) => {
  console.log(videos, page, limit);
  return (
    <div className={styles.videoGrid}>
      {videos.map((video, index) => (
        <div key={video?._id + '_' + index} className={styles.videoItem}>
          <h4>{video.title}</h4>
          <VideoPlayer video={video} />
        </div>
      ))}
      <div className={styles.pagination}>
        {/* Add pagination controls here */}
      </div>
    </div>
  );
};

export default VideoGrid;
