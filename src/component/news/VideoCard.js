import { formattedDate } from '../utils';
import AspectRatioMedia from '../basic/AspectRatioMedia';
import styles from '../../styles/ContentCard.module.css';

export default function VideoCard({ image, title, publishDate, onClick }) {
  return (
    <button type="button" data-video-card className={`${styles.card} ${styles.video}`} onClick={onClick} aria-label={title}>
      <span className={styles.media}>
        <AspectRatioMedia src={image} alt={title} sizes="(max-width: 600px) calc(100vw - 48px), 345px"
          sx={{ maxHeight: 260, bgcolor: 'grey.50' }} objectFit="contain" />
        <span className={styles.play} aria-hidden="true">▶</span>
        <span className={styles.date}>{formattedDate(publishDate)}</span>
      </span>
      <span className={styles.caption}><span className={styles.title}>{title}</span></span>
    </button>
  );
}
