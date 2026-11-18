import { useEffect, useRef } from 'react';
import { initContentCarousels } from '../lib/contentCarousels.mjs';

export default function ContentHtml({ html = '', style }) {
  const root = useRef(null);
  useEffect(() => initContentCarousels(root.current), [html]);
  return <div ref={root} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
}
