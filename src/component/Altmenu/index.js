import Link from 'next/link';
import styles from './AltMenu.module.css';

const AltMenu = () => {
  const menuItems = [
    { href: '/basin-aciklamalari', title: 'BASIN AÇIKLAMALARI' },
    { href: '/haberler', title: 'HABERLER' },
    { href: '/oda-haberleri', title: 'ODA HABERLERİ' },
    { href: '/ikk-haberleri', title: 'İKK HABERLERİ' },
    { href: '/etkinlik-acilis-konusmalari', title: 'KONUŞMALAR' },
    { href: '/gorusler', title: 'GÖRÜŞLER' },
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
