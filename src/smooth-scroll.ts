/** Ease the real page position. Sticky layout, focus and touch stay native. */
export function setupSmoothScroll() {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let frame = 0, target = scrollY, written = scrollY, previous = 0;
  let from = 0, start = 0, duration = 0;
  let mode: 'wheel' | 'anchor' = 'wheel';
  const historyFocus = new Map<string, HTMLElement>();
  const maximum = () => Math.max(0, root.scrollHeight - innerHeight);
  const clamp = (value: number) => Math.max(0, Math.min(maximum(), value));
  root.classList.add('native-scroll-ready');

  function stop(reason = 'settled') {
    cancelAnimationFrame(frame); frame = 0;
    target = written = scrollY; previous = 0;
    root.dataset.scrollState = 'idle'; root.dataset.scrollStop = reason;
  }
  function tick(time: number) {
    if (reduced.matches || document.hidden) { stop('preference-or-visibility'); return; }
    target = clamp(target);
    const elapsed = Math.min(64, previous ? time - previous : 16.67);
    previous = time;
    let next = mode === 'wheel'
      ? scrollY + (target - scrollY) * (1 - Math.exp(-elapsed / 110))
      : from + (target - from) * (1 - Math.pow(1 - Math.min(1, (time - start) / duration), 4));
    if (mode === 'wheel' && Math.abs(target - scrollY) > 1 && Math.abs(next - scrollY) < 1) next = scrollY + Math.sign(target - scrollY);
    written = clamp(next);
    scrollTo({ top: written, behavior: 'instant' });
    root.dataset.scrollState = mode;
    if (Math.abs(scrollY - target) <= 1 || (mode === 'anchor' && time - start >= duration)) {
      scrollTo({ top: target, behavior: 'instant' }); stop();
    } else frame = requestAnimationFrame(tick);
  }
  function nestedConsumes(event: WheelEvent, delta: number) {
    for (const item of event.composedPath()) {
      if (!(item instanceof HTMLElement) || item === document.body || item === root) continue;
      if (item.matches('input,select,textarea,[contenteditable=true],dialog,[role=dialog]')) return true;
      const style = getComputedStyle(item);
      if (/(auto|scroll)/.test(style.overflowY) && item.scrollHeight > item.clientHeight + 1) {
        if (style.overscrollBehaviorY === 'contain' || style.overscrollBehaviorY === 'none') return true;
        if (delta < 0 ? item.scrollTop > 0 : item.scrollTop + item.clientHeight < item.scrollHeight - 1) return true;
      }
    }
    return false;
  }
  addEventListener('wheel', (event) => {
    if (reduced.matches || !fine.matches || !event.cancelable || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
    const delta = Math.max(-innerHeight * 1.5, Math.min(innerHeight * 1.5, event.deltaY * unit));
    if (!delta || nestedConsumes(event, delta)) return;
    if (!frame || mode !== 'wheel') { stop('new-wheel'); target = scrollY; }
    const next = clamp(target + delta);
    if (next === target && !frame) return;
    event.preventDefault(); mode = 'wheel'; target = next;
    if (!frame) frame = requestAnimationFrame(tick);
  }, { passive: false });

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || reduced.matches) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!link || link.target || link.hasAttribute('download') || link.classList.contains('skip-link')) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
    let destination: HTMLElement | null;
    try { destination = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { return; }
    if (!destination) return;
    event.preventDefault(); stop('anchor');
    const margin = parseFloat(getComputedStyle(destination).scrollMarginTop) || 0;
    const padding = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
    from = scrollY; target = clamp(destination.getBoundingClientRect().top + scrollY - margin - padding);
    mode = 'anchor'; duration = Math.min(900, Math.max(320, Math.sqrt(Math.abs(target - from)) * 17)); start = performance.now();
    historyFocus.set(location.href, link);
    if (location.hash !== url.hash) history.pushState(null, '', url.hash);
    historyFocus.set(location.href, destination);
    const priorTab = destination.getAttribute('tabindex');
    if (priorTab === null) {
      destination.tabIndex = -1;
      destination.addEventListener('blur', () => destination!.removeAttribute('tabindex'), { once: true });
    }
    destination.focus({ preventScroll: true });
    if (Math.abs(target - from) < 1) stop(); else frame = requestAnimationFrame(tick);
  });
  addEventListener('scroll', () => {
    // A focus jump, scrollbar drag or external scroll request wins immediately.
    if (frame && Math.abs(scrollY - written) > 3) stop('external-scroll');
    else if (!frame) target = written = scrollY;
  }, { passive: true });
  addEventListener('keydown', () => stop('keyboard'));
  addEventListener('pointerdown', () => stop('pointer'), { passive: true });
  addEventListener('touchstart', () => stop('touch'), { passive: true });
  addEventListener('resize', () => stop('resize'));
  addEventListener('popstate', () => {
    stop('history');
    const destination = historyFocus.get(location.href);
    if (destination) {
      if (!destination.hasAttribute('tabindex') && !destination.matches('a,button,input,select,textarea')) {
        destination.tabIndex = -1;
        destination.addEventListener('blur', () => destination.removeAttribute('tabindex'), { once: true });
      }
      destination.focus({ preventScroll: true });
    }
  });
  addEventListener('hashchange', () => stop('hash'));
  document.addEventListener('visibilitychange', () => stop('visibility'));
  reduced.addEventListener('change', () => stop('preference'));
  fine.addEventListener('change', () => stop('pointer-type'));
  stop();
}
