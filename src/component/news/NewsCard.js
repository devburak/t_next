import Link from 'next/link';
import { formattedDate } from '../utils';
import AspectRatioMedia from '../basic/AspectRatioMedia';
import styles from '../../styles/ContentCard.module.css';

export default function NewsCard({ image, title, url, publishDate, eager = false }) {
  return (
    <Link href={url} prefetch={false} className={styles.link}>
      <article className={styles.card}>
        <div className={styles.media}>
          <AspectRatioMedia src={image} alt={title}
            sizes="(max-width: 600px) calc(100vw - 48px), 345px"
            imageProps={{ loading: eager ? 'eager' : 'lazy' }}
            sx={{ maxHeight: 260, bgcolor: 'grey.50' }} objectFit="contain" />
          <span className={styles.date}>{formattedDate(publishDate)}</span>
        </div>
        <div className={styles.caption}><h3 className={styles.title}>{title}</h3></div>
      </article>
    </Link>
  );
}
