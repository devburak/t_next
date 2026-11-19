import createCache from '@emotion/cache';

export default function createEmotionCache() {
  const insertionPoint = typeof document === 'undefined'
    ? undefined
    : document.querySelector('meta[name="emotion-insertion-point"]') || undefined;
  // A fresh cache is supplied by Document per server render; one is reused in the browser.
  return createCache({ key: 'mui', insertionPoint, prepend: true });
}
