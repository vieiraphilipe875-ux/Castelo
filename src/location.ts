export function setupLocation() {
  const section = document.querySelector<HTMLElement>('#como-chegar');
  if (!section) return;
  const dialog = section.querySelector<HTMLDialogElement>('dialog')!;
  const video = section.querySelector<HTMLVideoElement>('.location-video')!;
  const fallback = section.querySelector<HTMLImageElement>('.location-video-fallback')!;
  const toggle = section.querySelector<HTMLButtonElement>('.location-toggle')!;
  const status = section.querySelector<HTMLElement>('.location-route-status')!;
  const progress = section.querySelector<HTMLElement>('.location-route-progress > span')!;
  const stages = [...section.querySelectorAll<HTMLButtonElement>('[data-route-time]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let opener: HTMLButtonElement | null = null;
  let desiredTime = 0;
  let failed = false;
  let seekPending = false;
  let startAfterLoad = false;
  const labels = ['A entrada', 'A subida', 'O Castelo'];
  function draw() {
    const time = Math.min(21, video.currentTime || 0);
    const phase = time < 8 ? 0 : time < 17.5 ? 1 : 2;
    stages.forEach((button, i) => button.setAttribute('aria-current', String(i === phase)));
    progress.style.transform = `scaleX(${time / 21})`;
    toggle.innerHTML = video.paused ? 'Reproduzir <span aria-hidden="true">▶</span>' : 'Pausar <span aria-hidden="true">Ⅱ</span>';
    toggle.setAttribute('aria-label', video.paused ? 'Reproduzir percurso' : 'Pausar percurso');
    if (!failed) status.textContent = reduced.matches ? `${labels[phase]} · movimento reduzido: escolha as etapas.` : time >= 20.96 ? 'Percurso concluído. Você pode rever cada etapa.' : '';
  }
  function seek(time: number) {
    video.pause(); desiredTime = time; seekPending = true;
    if (video.readyState >= 1 && !video.seeking) { video.currentTime = time; seekPending = false; }
    draw();
  }
  async function play() {
    if (failed || !dialog.open || document.hidden) return;
    if (reduced.matches) { draw(); return; }
    if (video.currentTime >= 20.96) seek(0);
    video.playbackRate = 1.5;
    try { await video.play(); } catch { status.textContent = 'Escolha uma etapa para conhecer o acesso.'; }
    draw();
  }
  section.querySelectorAll<HTMLButtonElement>('[data-route-open]').forEach(button => button.addEventListener('click', () => {
    opener = button;
    if (!video.getAttribute('src')) { video.src = video.dataset.src!; video.load(); }
    desiredTime = Number(button.dataset.routeOpen || 0); seekPending = true;
    dialog.showModal();
    startAfterLoad = desiredTime === 0 && !reduced.matches;
    if (video.readyState >= 1) { seek(desiredTime); if (startAfterLoad) { startAfterLoad = false; void play(); } }
    else video.pause();
    draw();
  }));
  section.querySelector<HTMLButtonElement>('.location-close')!.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { startAfterLoad = false; video.pause(); opener?.focus({preventScroll:true}); });
  video.addEventListener('loadedmetadata', () => { if (seekPending) seek(desiredTime); if (startAfterLoad) { startAfterLoad = false; void play(); } });
  video.addEventListener('seeked', () => { if (seekPending) seek(desiredTime); draw(); });
  video.addEventListener('timeupdate', draw);
  video.addEventListener('play', draw); video.addEventListener('pause', draw);
  video.addEventListener('error', () => { failed = true; video.pause(); video.hidden = true; fallback.hidden = false; toggle.disabled = true; status.textContent = 'O percurso está indisponível. A foto e a rota no Maps continuam disponíveis.'; });
  toggle.addEventListener('click', () => { if (video.paused) void play(); else video.pause(); });
  stages.forEach(button => button.addEventListener('click', () => { startAfterLoad = false; seek(Number(button.dataset.routeTime)); }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) { startAfterLoad = false; video.pause(); } });
  reduced.addEventListener('change', () => { video.pause(); draw(); });
  new IntersectionObserver(entries => { if (!entries[0].isIntersecting) video.pause(); }, {threshold:0}).observe(section);
  draw();
}
