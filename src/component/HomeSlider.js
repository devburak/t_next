import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getMediaUrl } from './basic/AspectRatioMedia';
import { DEFAULT_OG_IMAGE } from '../lib/seo';
import styles from '../styles/HomeSlider.module.css';

const motionQuery = '(prefers-reduced-motion: reduce)';
const subscribeMotion = callback => {
  const query = window.matchMedia(motionQuery);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
};
const motionSnapshot = () => window.matchMedia(motionQuery).matches;
const serverMotionSnapshot = () => false;
function nextState(current, index, length) {
  const active = (index + length) % length;
  return { active, visited: new Set([...current.visited, active, (active + 1) % length]) };
}

export default function HomeSlider({ slides = [] }) {
  const [state, setState] = useState(() => ({ active: 0, visited: new Set([0, 1]) }));
  const [running, setRunning] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(true);
  const root = useRef(null), pointer = useRef(null), swiped = useRef(false);
  const reducedMotion = useSyncExternalStore(subscribeMotion, motionSnapshot, serverMotionSnapshot);
  const active = slides.length ? state.active % slides.length : 0;
  const playing = running && !hovered && !focused && !reducedMotion && visible && slides.length > 1;
  useEffect(() => {
    if (!root.current || !('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!playing) return undefined;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') setState(current => nextState(current, current.active + 1, slides.length));
    }, 4000);
    return () => clearInterval(timer);
  }, [playing, slides.length]);
  const move = amount => setState(current => nextState(current, current.active + amount, slides.length));
  const pointerUp = event => {
    if (!pointer.current) return;
    const x = event.clientX - pointer.current.x, y = event.clientY - pointer.current.y;
    pointer.current = null;
    if (Math.abs(x) > 40 && Math.abs(x) > Math.abs(y) && slides.length > 1) {
      swiped.current = true;
      move(x < 0 ? 1 : -1);
    }
  };
  return (
    <section ref={root} className={styles.root} data-home-slider role="region" aria-label="Ana sayfa manşetleri" aria-roledescription="slayt gösterisi"
      onPointerEnter={event => event.pointerType === 'mouse' && setHovered(true)} onPointerLeave={() => setHovered(false)}
      onFocusCapture={event => setFocused(!event.target.closest('[data-slider-toggle]'))}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onKeyDown={event => { if (slides.length > 1 && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); } }}
      onPointerDown={event => { swiped.current = false; if (!event.target.closest('button')) pointer.current = { x: event.clientX, y: event.clientY }; }}
      onPointerUp={pointerUp} onPointerCancel={() => { pointer.current = null; }}
      onClickCapture={event => { if (swiped.current) { event.preventDefault(); event.stopPropagation(); swiped.current = false; } }}>
      <div className={styles.viewport}>
        {slides.length === 0 ? <div role="status">Gösterilecek manşet bulunmuyor.</div> : slides.map((slide, index) => (
          <Link href={slide.slug || '/'} prefetch={false} className={styles.slide} key={slide._id || index}
            data-active={index === active} aria-hidden={index !== state.active} tabIndex={index === active ? 0 : -1}>
            <div className={styles.card}>
              <div className={styles.media} data-home-slider-media>
                {state.visited.has(index) && <Image src={getMediaUrl(slide.featuredMedia) || DEFAULT_OG_IMAGE} alt={slide.title} fill quality={90}
                  loading="eager" fetchPriority={index === 0 ? 'high' : 'low'} decoding="async"
                  data-home-slider-image={index === 0 ? 'true' : undefined}
                  sizes="(max-width: 599px) calc(100vw - 48px), (max-width: 1199px) 46vw, (max-width: 1359px) 31vw, 420px"
                  style={{ objectFit: 'contain' }} />}
              </div>
              <div className={styles.caption}>
                <div className={styles.flow} data-home-slider-caption><h2 className={styles.title}>{slide.title}</h2><p className={styles.summary}>{slide.spot}</p></div>
              </div>
            </div>
          </Link>
        ))}
        {slides.length > 1 && <>
          <button type="button" className={`${styles.arrow} ${styles.previous}`} onClick={() => move(-1)} aria-label="Önceki manşet"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="3" /></svg></button>
          <button type="button" className={`${styles.arrow} ${styles.next}`} onClick={() => move(1)} aria-label="Sonraki manşet"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="3" /></svg></button>
        </>}
      </div>
      <div className={styles.controls}>
        {slides.map((slide, index) => <button type="button" key={slide._id || index} className={styles.dot} aria-label={`${index + 1}. manşeti göster`} aria-current={index === active ? 'true' : undefined} onClick={() => setState(current => nextState(current, index, slides.length))} />)}
        {slides.length > 1 && <button type="button" data-slider-toggle className={styles.toggle} aria-label={running ? 'Otomatik geçişi duraklat' : 'Otomatik geçişi başlat'} onClick={() => setRunning(value => !value)}>{running ? 'Ⅱ' : '▶'}</button>}
      </div>
    </section>
  );
}
