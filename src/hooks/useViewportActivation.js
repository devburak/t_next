import { useEffect, useRef, useState } from 'react';

// Keep the SSR preview until interactive client UI enters the viewport.
export default function useViewportActivation({ defer = false, disabled = false } = {}) {
  const viewportRef = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!defer || disabled || !viewportRef.current) return undefined;
    if (!('IntersectionObserver' in window)) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '0px' });
    observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, [defer, disabled]);
  return { viewportRef, ready: !defer || disabled || visible };
}
