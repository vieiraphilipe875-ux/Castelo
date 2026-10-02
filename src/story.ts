export function setupStory() {
  const scenes = [...document.querySelectorAll<HTMLElement>('[data-story-scene]')];
  if (!scenes.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 801px)');
  const steps = [...document.querySelectorAll<HTMLElement>('[data-story-step]')];
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.learning-directory a')];
  const route = document.querySelector<HTMLElement>('[data-learning-route]');
  const visible = new Set<HTMLElement>();
  let frame = 0;
  let rectangles: { node: HTMLElement; top: number; height: number }[] = [];
  function measure() {
    rectangles = steps.map(node => { const r = node.getBoundingClientRect(); return {node,top:r.top+scrollY,height:r.height}; });
    schedule();
  }
  function draw() {
    frame = 0;
    if (document.hidden) return;
    visible.forEach(scene => {
      const r = scene.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight + r.height)));
      scene.dataset.storyProgress = progress.toFixed(3);
      scene.querySelectorAll<SVGPathElement>('[data-story-line]').forEach(path => {
        path.style.strokeDasharray = '100';
        path.style.strokeDashoffset = String(reduced.matches ? 0 : 100 * (1 - Math.min(1,progress * 1.8)));
      });
    });
    if (rectangles.length && route) {
      const point = scrollY + innerHeight * .42;
      const first = rectangles[0].top;
      const last = rectangles.at(-1)!;
      const progress = Math.max(0,Math.min(1,(point-first)/(last.top+last.height-first)));
      route.style.setProperty('--route-progress',reduced.matches ? '1' : String(progress));
      const index = Math.max(0,rectangles.reduce((selected,item,i) => point >= item.top ? i : selected,-1));
      links.forEach((link,i) => { if (i === index) link.setAttribute('aria-current','step'); else link.removeAttribute('aria-current'); });
    }
  }
  function schedule() { if (!frame && !document.hidden) frame = requestAnimationFrame(draw); }
  const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if(entry.isIntersecting) visible.add(entry.target as HTMLElement); else visible.delete(entry.target as HTMLElement); }); schedule(); },{rootMargin:'120px 0px',threshold:0});
  scenes.forEach(scene => observer.observe(scene));
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',measure);
  reduced.addEventListener('change',() => { scenes.forEach(scene => { scene.querySelectorAll<SVGPathElement>('[data-story-line]').forEach(path=>path.style.strokeDashoffset='0'); });schedule(); });
  desktop.addEventListener('change',measure);
  document.addEventListener('visibilitychange',schedule);
  document.querySelectorAll<HTMLImageElement>('.story-section img').forEach(image => {
    image.addEventListener('load',measure);
    image.addEventListener('error',() => { image.closest('figure')?.classList.add('story-media-error');measure(); });
  });
  void document.fonts.ready.then(measure);
  measure();
}
