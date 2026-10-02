/** Scroll-linked layers. No content is hidden and no extra scene is pinned. */
export function setupChoreography() {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scenes = [...document.querySelectorAll<HTMLElement>('#inicio,#essencia,[data-story-step],#campus,#vivencias,#tecnica,#visita,.story-footer')];
  const visible = new Set<HTMLElement>();
  const images = [...document.querySelectorAll<HTMLImageElement>('.formation-portrait img,.learning-photo img,.spaces-photo img,.life-mural img,.technical-lab img,.visit-architecture img')];
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const ease = (v: number) => { v = clamp(v); return v * v * (3 - 2 * v); };
  let frame = 0, activeCourse = '', labelAnimation: Animation | undefined;
  images.forEach(image => {
    const window = document.createElement('div'); window.className = 'motion-image-window';
    image.before(window); window.append(image);
  });
  // Keep each line intact: its travel settles before it becomes reading copy.
  document.querySelectorAll<HTMLElement>('.story-heading h2,.learning-heading h2,.spaces-heading h2,.life-heading h2,.technical-lead h2,.visit-main h2').forEach(heading => {
    const parts = heading.innerHTML.split(/<br\s*\/?\s*>/i);
    if (parts.length > 1) heading.innerHTML = parts.map((part, i) => `<span class="motion-heading-line motion-heading-line-${i}">${part}</span>`).join(' ');
  });
  const words = document.querySelector<HTMLElement>('.life-words');
  if (words) words.innerHTML = '<span class="life-word life-word-0">Criar.</span> <span class="life-word life-word-1">Experimentar.</span> <span class="life-word life-word-2">Conviver.</span>';
  root.classList.add('choreography-ready');
  function layoutTop(element: Element) {
    let top = 0, node: HTMLElement | null = element as HTMLElement;
    while (node) { top += node.offsetTop; node = node.offsetParent as HTMLElement | null; }
    return top;
  }
  // Layout coordinates avoid feeding an animated transform into its own progress.
  function entry(element: Element) { return 1 - ease((innerHeight * .95 - layoutTop(element) + scrollY) / (innerHeight * .65)); }
  function depth(element: Element) { return Math.max(-1, Math.min(1, (innerHeight * .5 - layoutTop(element) + scrollY - (element as HTMLElement).offsetHeight * .5) / innerHeight)); }
  function set(element: HTMLElement, name: string, value: number, suffix = 'px') { element.style.setProperty(name, value.toFixed(3) + suffix); }
  function draw() {
    frame = 0; if (document.hidden) return;
    const mobile = innerWidth <= 800, factor = mobile ? .72 : 1;
    root.dataset.choreography = reduced.matches ? 'reduced' : 'active';
    visible.forEach(scene => {
      const still = reduced.matches, flight = still ? 0 : entry(scene), drift = still ? 0 : depth(scene);
      set(scene, '--chapter-flight', flight, ''); set(scene, '--chapter-drift', drift, '');
      if (scene.id === 'inicio') {
        set(scene, '--hero-exit', still ? 0 : -Math.min(1, scrollY / (innerHeight * .65)) * 22);
      } else if (scene.id === 'essencia') {
        const portrait = scene.querySelector<HTMLElement>('.formation-portrait')!;
        const p = still ? 0 : entry(portrait), d = still ? 0 : depth(portrait);
        set(scene, '--portrait-flight', p * 52 * factor); set(scene, '--portrait-depth', d * 30 * factor);
        set(scene, '--portrait-counter', -d * 26 * factor + p * 14);
        set(scene, '--portrait-scale', still ? 1 : 1.085 - .03 * (1 - p), '');
        scene.querySelectorAll<HTMLElement>('.formation-values article').forEach(article => {
          const p = still ? 0 : entry(article); set(article, '--value-flight', p * 24 * factor); set(article, '--value-read', still ? 1 : 1 - p, '');
        });
        const closing = scene.querySelector<HTMLElement>('.formation-closing')!;
        set(closing, '--closing-flight', still ? 0 : entry(closing) * 28 * factor);
      } else if (scene.hasAttribute('data-story-step')) {
        const photo = scene.querySelector<HTMLElement>('.learning-photo')!;
        const p = still ? 0 : entry(photo), d = still ? 0 : depth(photo);
        set(scene, '--stage-flight', p * 48 * factor); set(scene, '--stage-depth', d * 30 * factor);
        set(scene, '--stage-scale', still ? 1 : 1.13 - .035 * (1 - p), '');
        set(scene, '--stage-mask', p * 17, '%'); set(scene, '--stage-copy', still ? 0 : entry(scene.querySelector('.learning-copy')!) * 22 * factor);
      } else if (scene.id === 'campus') {
        const photo = scene.querySelector<HTMLElement>('[data-panel]:not([hidden]) .spaces-photo');
        if (photo) { set(scene, '--campus-depth', still ? 0 : depth(photo) * 36 * factor); set(scene, '--campus-flight', still ? 0 : entry(photo) * 28); }
        const caption = scene.querySelector<HTMLElement>('[data-panel]:not([hidden]) figcaption');
        if (caption) set(scene, '--campus-caption', still ? 0 : entry(caption) * 20 * factor);
      } else if (scene.id === 'vivencias') {
        const focus = Number(scene.dataset.lifeFocus || '0');
        set(scene, '--life-depth', still ? 0 : (focus - .5) * 38 * factor);
        set(scene, '--life-word-one', still ? 0 : 14 * (1 - ease(focus / .45)));
        set(scene, '--life-word-two', still ? 0 : 18 * (1 - ease((focus - .25) / .5)));
        set(scene, '--life-side-shift', still ? 0 : (focus - .5) * 18 * factor);
      } else if (scene.id === 'tecnica') {
        const rows = [...scene.querySelectorAll<HTMLElement>('[data-course]')];
        const first = rows[0].getBoundingClientRect(), last = rows.at(-1)!.getBoundingClientRect();
        const progress = still ? 1 : clamp((innerHeight * .43 - first.top) / (last.bottom - first.top));
        set(scene, '--technical-read', progress, ''); set(scene, '--technical-depth', still ? 0 : (progress - .5) * 32 * factor);
        rows.forEach(row => { set(row, '--course-flight', still ? 0 : entry(row) * 26 * factor); });
        if (!still && scene.dataset.activeCourse !== activeCourse) {
          activeCourse = scene.dataset.activeCourse || ''; labelAnimation?.cancel();
          labelAnimation = scene.querySelector('.technical-course-current')!.animate([{ transform: 'translateY(12px)' }, { transform: 'translateY(0)' }], { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' });
        }
      } else if (scene.id === 'visita') {
        const photo = scene.querySelector<HTMLElement>('.visit-architecture')!;
        set(scene, '--visit-flight', still ? 0 : entry(photo) * 38 * factor);
        set(scene, '--visit-depth', still ? 0 : depth(photo) * 26 * factor);
        set(scene, '--visit-rule', still ? 1 : 1 - entry(scene.querySelector('.visit-channels')!), '');
      } else {
        set(scene, '--footer-flight', still ? 0 : entry(scene.querySelector('.story-footer-name')!) * 40 * factor);
      }
    });
  }
  function schedule() { if (!frame && !document.hidden) frame = requestAnimationFrame(draw); }
  const observer = new IntersectionObserver(entries => { entries.forEach(e => { (e.target as HTMLElement).classList.toggle('motion-in-view',e.isIntersecting); e.isIntersecting ? visible.add(e.target as HTMLElement) : visible.delete(e.target as HTMLElement); }); schedule(); }, { rootMargin: '160px 0px' });
  scenes.forEach(scene => observer.observe(scene));
  addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', schedule);
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', () => { labelAnimation?.cancel(); scenes.forEach(s => { const r = s.getBoundingClientRect(); if (r.bottom > -160 && r.top < innerHeight + 160) visible.add(s); else visible.delete(s); }); schedule(); });
  document.querySelector('#campus')!.addEventListener('campuschange', schedule);
  document.querySelector('#vivencias')!.addEventListener('click', schedule);
  images.forEach(image => { image.addEventListener('load', schedule); image.addEventListener('error', schedule); });
  void document.fonts.ready.then(schedule); schedule();
}
