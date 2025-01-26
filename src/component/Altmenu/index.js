import Link from 'next/link';
import styles from './AltMenu.module.css';

const AltMenu = () => {
  const menuItems = [
    { href: '/kategori/basin-aciklamalari', title: 'BASIN AÇIKLAMALARI' },
    { href: '/kategori/haberler', title: 'HABERLER' },
    { href: '/kategori/oda-haberleri', title: 'ODA HABERLERİ' },
    { href: '/kategori/ikk-haberleri', title: 'İKK HABERLERİ' },
    { href: '/kategori/etkinlik-acilis-konusmalari', title: 'KONUŞMALAR' },
    { href: '/kategori/gorusler', title: 'GÖRÜŞLER' },
  ];

  return (
    <div className={styles.paneContent}>
      <ul className={styles.nav}>
        {menuItems.map((item, index) => (
          <li
            key={index}
          >
            <Link href={item.href} className={styles.navLink}>
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AltMenu;
