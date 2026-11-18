const instances = new WeakMap();
const selector = '[data-carousel-container], #carousel-container';

// Owned by the content component, so route changes and late HTML insertion work too.
export function initContentCarousels(root, { autoplayMs = 5000 } = {}) {
  if (!root?.querySelectorAll) return () => {};
  const containers = [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)];
  const cleanups = [];
  for (const container of containers) {
    if (instances.has(container)) continue;
    const track = container.querySelector('[data-carousel-slides]') || container.firstElementChild;
    const slides = Array.from(track?.children || []);
    if (!slides.length) continue;
    const view = container.ownerDocument.defaultView;
    const mount = container.closest('[data-carousel-root], #carousel-wrapper') || container;
    const saved = new Map();
    const remember = (element, attributes) => {
      if (!element) return;
      saved.set(element, Object.fromEntries(attributes.map(name => [name, element.getAttribute(name)])));
    };
    remember(container, ['style', 'role', 'aria-label', 'aria-roledescription', 'tabindex', 'data-carousel-index']);
    remember(track, ['style']);
    container.style.isolation = 'isolate';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', container.getAttribute('aria-label') || 'Görsel galerisi');
    container.setAttribute('aria-roledescription', 'slayt gösterisi');
    container.tabIndex = 0;
    track.style.width = '100%';
    track.style.display = 'flex';
    track.style.position = 'relative';
    track.style.zIndex = '0';
    const reducedMotion = view.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) track.style.transition = 'none';
    for (const slide of slides) {
      remember(slide, ['style', 'aria-hidden', 'inert']);
      slide.style.flex = '0 0 100%';
      slide.style.width = '100%';
      slide.style.minWidth = '0';
      slide.style.display = 'flex';
      slide.style.opacity = '1';
      slide.style.transform = 'none';
    }
    const prev = container.querySelector('[data-carousel-prev], #carousel-prev');
    const next = container.querySelector('[data-carousel-next], #carousel-next');
    for (const [button, label] of [[prev, 'Önceki görsel'], [next, 'Sonraki görsel']]) {
      remember(button, ['type', 'aria-label', 'hidden', 'style']);
      if (!button) continue;
      button.type = 'button';
      button.setAttribute('aria-label', button.getAttribute('aria-label') || label);
      button.style.zIndex = '2';
      button.hidden = slides.length === 1;
    }
    const dots = container.ownerDocument.createElement('div');
    dots.className = 'carousel-dots-container';
    dots.setAttribute('data-content-carousel-controls', '');
    dots.style.cssText = 'width:100%;margin-top:10px;text-align:center';
    dots.hidden = slides.length === 1;
    let current = 0, timer = null, hovered = false;
    const stop = () => { if (timer !== null) view.clearInterval(timer); timer = null; };
    const start = () => {
      stop();
      if (slides.length > 1 && autoplayMs > 0 && !reducedMotion && !hovered && !mount.contains(container.ownerDocument.activeElement) && !container.ownerDocument.hidden) {
        timer = view.setInterval(() => move(current + 1, false), autoplayMs);
      }
    };
    const move = (index, restart = true) => {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      container.setAttribute('data-carousel-index', String(current));
      slides.forEach((slide, position) => {
        slide.setAttribute('aria-hidden', String(position !== current));
        slide.toggleAttribute('inert', position !== current);
      });
      [...dots.children].forEach((dot, position) => {
        dot.classList.toggle('active', position === current);
        dot.setAttribute('aria-pressed', String(position === current));
      });
      if (restart) start();
    };
    slides.forEach((_, index) => {
      const dot = container.ownerDocument.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `${index + 1}. görsele git`);
      dot.addEventListener('click', () => move(index));
      dots.appendChild(dot);
    });
    mount.appendChild(dots);
    const listeners = [];
    const listen = (node, event, callback) => {
      node?.addEventListener(event, callback);
      if (node) listeners.push(() => node.removeEventListener(event, callback));
    };
    listen(prev, 'click', () => move(current - 1));
    listen(next, 'click', () => move(current + 1));
    listen(container, 'keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
      const positions = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: slides.length - 1 };
      if (Object.hasOwn(positions, event.key)) { event.preventDefault(); move(positions[event.key]); }
    });
    listen(mount, 'mouseenter', () => { hovered = true; stop(); });
    listen(mount, 'mouseleave', () => { hovered = false; start(); });
    listen(mount, 'focusin', stop);
    listen(mount, 'focusout', event => { if (!mount.contains(event.relatedTarget)) start(); });
    listen(container.ownerDocument, 'visibilitychange', start);
    let destroyed = false;
    const destroy = () => {
      if (destroyed) return;
      destroyed = true;
      stop(); listeners.forEach(remove => remove()); dots.remove();
      for (const [element, attributes] of saved) for (const [name, value] of Object.entries(attributes)) {
        if (value === null) element.removeAttribute(name); else element.setAttribute(name, value);
      }
      instances.delete(container);
    };
    instances.set(container, destroy);
    cleanups.push(destroy);
    move(0);
  }
  return () => cleanups.forEach(destroy => destroy());
}
