import React, { useEffect, useState } from 'react';
import styles from './QuickAccessMenu.module.css';

const RIGHT_MENU_API_ENDPOINT = '/api/menu/right';
const EXTERNAL_URL_REGEX = /^(https?:\/\/|\/\/)/i;

const DEFAULT_MENU_ITEMS = [
  {
    id: 'fallback-odalar',
    displayType: 'image',
    href: '/oda-kurullari',
    target: '_self',
    text: '',
    label: 'TMMOB UYESI ODALAR',
    image: {
      url: 'https://storage.ikon-x.com.tr/files/oda_kurulari.png',
      alt: 'TMMOB UYESI ODALAR',
    },
    icon: null,
  },
  {
    id: 'fallback-kadin',
    displayType: 'image',
    href: '/sayfa/tmmob-kadin',
    target: '_self',
    text: '',
    label: 'TMMOB KADIN',
    image: {
      url: 'https://storage.ikon-x.com.tr/files/tmmob_kadin.png',
      alt: 'TMMOB KADIN',
    },
    icon: null,
  },
  {
    id: 'fallback-euring',
    displayType: 'image',
    href: '/sayfa/euring',
    target: '_self',
    text: '',
    label: 'EUR-ING Engineers Europe ve EUR-ING Certificate',
    image: {
      url: 'https://storage.ikon-x.com.tr/files/euring_butonturkce_2-0.png',
      alt: 'EUR-ING Engineers Europe ve EUR-ING Certificate',
    },
    icon: null,
  },
  {
    id: 'fallback-feani',
    displayType: 'image',
    href: '/sayfa/feani',
    target: '_self',
    text: '',
    label: 'FEANI Veritabani',
    image: {
      url: 'https://storage.ikon-x.com.tr/files/veritabani_butonturkce.png',
      alt: 'FEANI Veritabani',
    },
    icon: null,
  },
  {
    id: 'fallback-oykuler',
    displayType: 'image',
    href: 'https://muhendismimaroykuleri.org',
    target: '_self',
    text: '',
    label: 'Muhendis Mimar Oykuleri',
    image: {
      url: 'https://storage.ikon-x.com.tr/files/mmovt_calisma_yuzey.png',
      alt: 'Muhendis Mimar Oykuleri',
    },
    icon: null,
  },
];

const isRenderableSvgUrl = (value) => {
  const rawValue = String(value || '').trim();
  if (!rawValue) {
    return false;
  }

  return rawValue.startsWith('/') || EXTERNAL_URL_REGEX.test(rawValue);
};

const renderIconVisual = (icon) => {
  if (!icon?.value) {
    return null;
  }

  if (icon.source === 'svg' && isRenderableSvgUrl(icon.value)) {
    return <img alt="" aria-hidden="true" src={icon.value} className={styles.iconImage} />;
  }

  return (
    <span aria-hidden="true" className={styles.iconText}>
      {icon.value}
    </span>
  );
};

const renderItemVisual = (item) => {
  const displayType = String(item?.displayType || 'text');
  const imageUrl = String(item?.image?.url || '').trim();
  const imageAlt = String(item?.image?.alt || item?.label || item?.text || '').trim();
  const textValue = String(item?.text || item?.label || '').trim();

  if (displayType === 'image' && imageUrl) {
    return (
      <img
        alt={imageAlt}
        src={imageUrl}
        className={styles.menuImage}
      />
    );
  }

  const iconVisual = renderIconVisual(item?.icon);
  const shouldShowIcon = displayType === 'icon' || displayType === 'icon_text';
  const shouldShowText = displayType === 'text' || displayType === 'icon_text' || !iconVisual;

  return (
    <span className={styles.textItem}>
      {shouldShowIcon && iconVisual ? <span className={styles.iconSlot}>{iconVisual}</span> : null}
      {shouldShowText ? <span className={styles.textLabel}>{textValue || 'Menu'}</span> : null}
    </span>
  );
};

const QuickAccessMenu = ({ initialMenuItems = null, disableClientFetch = false }) => {
  const hasInitialMenuItems = Array.isArray(initialMenuItems) && initialMenuItems.length > 0;
  const [menuItems, setMenuItems] = useState(hasInitialMenuItems ? initialMenuItems : DEFAULT_MENU_ITEMS);

  useEffect(() => {
    if (disableClientFetch && hasInitialMenuItems) {
      return undefined;
    }

    let isMounted = true;
    const controller = new AbortController();

    const loadRightMenu = async () => {
      try {
        const response = await fetch(RIGHT_MENU_API_ENDPOINT, {
          signal: controller.signal,
        });
        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        if (!isMounted || !Array.isArray(payload?.items) || payload.items.length === 0) {
          return;
        }

        setMenuItems(payload.items);
      } catch (error) {
        if (error?.name === 'AbortError') {
          return;
        }
        console.error('[QuickAccessMenu] Failed to load right menu:', error);
      }
    };

    loadRightMenu();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [disableClientFetch, hasInitialMenuItems]);

  return (
    <section id="block-menu-menu-sag-meu" className={`${styles.block} ${styles.menu} clearfix`}>
      <ul className={`${styles.nav} menu`}>
        {menuItems.map((item, index) => {
          const key = item?.id || `right-menu-item-${index}`;
          const href = String(item?.href || '').trim();
          const target = item?.target || '_self';
          const rel = target === '_blank' ? 'noopener noreferrer' : undefined;
          const label = String(item?.label || item?.text || 'Menu').trim();
          const displayType = String(item?.displayType || 'text');
          const linkClassName = `${styles.menuLink} ${displayType === 'image' ? styles.menuLinkImage : styles.menuLinkText}`;

          return (
            <li key={key} className={styles.leaf}>
              {href ? (
                <a href={href} title={label} target={target} rel={rel} className={linkClassName}>
                  {renderItemVisual(item)}
                </a>
              ) : (
                <span className={linkClassName} aria-label={label}>
                  {renderItemVisual(item)}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default QuickAccessMenu;
