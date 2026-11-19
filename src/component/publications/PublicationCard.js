import Link from 'next/link';
import { DEFAULT_OG_IMAGE } from '../../lib/seo';
import AspectRatioMedia from '../basic/AspectRatioMedia';
import styles from '../../styles/ContentCard.module.css';

function formattedDate(value) {
  return value ? new Date(value).toLocaleDateString('tr-TR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '';
}

export default function PublicationCard({ publication, hideCategories = false }) {
  const href = `/yayin/${publication.slug || publication._id}`;
  const cover = publication.coverFile?.url || (publication.files?.length && String(publication.files[0]?.type || '').startsWith('image') ? publication.files[0].link : DEFAULT_OG_IMAGE);
  return (
    <article className={`${styles.card} ${styles.publication}`}>
      <Link href={href} prefetch={false} className={styles.link}>
        <div className={styles.media}>
          <AspectRatioMedia src={cover} alt={publication.title}
            sizes="(max-width: 600px) calc(100vw - 48px), 345px" objectFit="contain"
            sx={{ backgroundColor: '#fff', borderRadius: 1, maxHeight: 260 }} />
          <span className={styles.date}>{formattedDate(publication.publishDate || publication.createdAt)}</span>
        </div>
      </Link>
      <div className={hideCategories ? styles.caption : styles.details}>
        <div>
          <Link href={href} prefetch={false} className={styles.link}><h3 className={styles.title}>{publication.title}</h3></Link>
          {!hideCategories && publication.categories?.length > 0 && <div className={styles.categories}>
            {publication.categories.map(category => <Link key={category._id} href={`/yayin-turu/${category.slug}`} className={styles.category}>{category.name}</Link>)}
          </div>}
        </div>
      </div>
    </article>
  );
}
