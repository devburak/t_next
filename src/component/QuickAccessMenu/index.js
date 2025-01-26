// component/QuickAccessMenu/index.js
import React from 'react';
import styles from './QuickAccessMenu.module.css'; // CSS Module'ü içe aktarın

const QuickAccessMenu = () => {
  // Menüde kullanılacak linkleri bir dizi içinde tanımlıyoruz
  const menuItems = [
    {
      href: "/oda-kurullari",
      title: "TMMOB ÜYESİ ODALAR",
      src: "https://storage.ikon-x.com.tr/files/oda_kurulari.png",
      alt: "TMMOB ÜYESİ ODALAR"
    },
    {
      href: "/sayfa/tmmob-kadin",
      title: "TMMOB KADIN",
      src: "https://storage.ikon-x.com.tr/files/tmmob_kadin.png",
      alt: "TMMOB KADIN"
    },
    {
      href: "/sayfa/euring",
      title: "euring",
      src: "https://storage.ikon-x.com.tr/files/euring_butonturkce_2-0.png",
      alt: "EUR-ING Engineers Europe ve EUR-ING Certificate"
    },
    {
      href: "/sayfa/feani",
      title: "FEANI Veritabanı",
      src: "https://storage.ikon-x.com.tr/files/veritabani_butonturkce.png",
      alt: "FEANI Veritabanı"
    },
    {
      href: "https://muhendismimaroykuleri.org",
      title: "Mühendis Mimar Öyküleri",
      src: "https://storage.ikon-x.com.tr/files/mmovt_calisma_yuzey.png",
      alt: "Mühendis Mimar Öyküleri"
    },
  ];

  return (
    <section id="block-menu-menu-sag-meu" className={`${styles.block} ${styles.menu} clearfix`}>
      <ul className={`${styles.nav} menu`}>
        {/* İlk <li> öğesini atlıyoruz (first leaf) */}
        {menuItems.slice().map((item, index) => (
          <li
            key={index}
            className={ `${styles.leaf}`}
          >
            <a href={item.href} title={item.title}>
              <img
                alt={item.alt}
                src={item.src}
                className={styles.menuImage}
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default QuickAccessMenu;
