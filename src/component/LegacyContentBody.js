import styles from '../styles/LegacyContent.module.css';
import { useEffect, useRef } from 'react';
import { initContentCarousels } from '../lib/contentCarousels.mjs';

export default function LegacyContentBody({ html = '', style }) {
  const root = useRef(null);
  useEffect(() => initContentCarousels(root.current), [html]);
  return <div className={styles.legacyContent} ref={root} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
}
