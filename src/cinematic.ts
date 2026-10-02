export function setupCinematicHero() {
  const hero = document.querySelector<HTMLElement>('.cinematic-hero');
  if (!hero) return;
  const video = hero.querySelector<HTMLVideoElement>('.cinematic-video')!;
  const button = hero.querySelector<HTMLButtonElement>('.cinematic-toggle')!;
  const status = hero.querySelector<HTMLElement>('.cinematic-status')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = true;
  let userPaused = false;
  let failed = false;
  let frame = 0;
  let resetTimer: ReturnType<typeof setTimeout> | undefined;
  let loops = 0;
  const source = video.dataset.videoSrc || '';

  function setState(state: string) {
    hero!.dataset.mediaState = state;
    const pending = !source;
    button.hidden = pending || reduced.matches || failed;
    button.textContent = userPaused ? 'Reproduzir vídeo' : 'Pausar vídeo';
    button.setAttribute('aria-label', userPaused ? 'Reproduzir vídeo de fundo' : 'Pausar vídeo de fundo');
    if (pending) status.textContent = 'Cenário artístico gerado · prévia para avaliação';
    else if (failed) status.textContent = 'Vídeo indisponível · cenário artístico em imagem';
    else if (reduced.matches) status.textContent = 'Movimento reduzido · cenário artístico em imagem';
    else status.textContent = 'Cenário artístico gerado · prévia para avaliação';
  }
  function canPlay() {
    return Boolean(source) && !failed && !reduced.matches && !userPaused && visible && !document.hidden;
  }
  function clearReset() {
    if (resetTimer !== undefined) clearTimeout(resetTimer);
    resetTimer = undefined;
  }
  function stopFrames() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }
  function drawFrame() {
    frame = 0;
    const duration = video.duration;
    const time = video.currentTime;
    if (Number.isFinite(duration) && duration > 1) {
      const opacity = Math.max(0, Math.min(1, time / .5, (duration - time) / .5));
      video.style.opacity = String(opacity);
    }
    if (!video.paused && !video.ended && canPlay()) frame = requestAnimationFrame(drawFrame);
  }
  function pause() {
    clearReset(); stopFrames(); video.pause();
    setState(reduced.matches ? 'reduced' : source ? 'paused' : 'pending');
  }
  async function play() {
    if (!canPlay()) return;
    if (!video.getAttribute('src')) {
      video.src = source; video.load();
    }
    setState('loading');
    try {
      await video.play();
      if (!canPlay()) { pause(); return; }
      hero!.dataset.hasFrame = 'true';
      setState('playing'); stopFrames(); drawFrame();
    } catch {
      if (!failed) {
        userPaused = true;
        setState('paused');
      }
    }
  }
  video.loop = false;
  video.muted = true;
  video.addEventListener('ended', () => {
    stopFrames(); video.style.opacity = '0'; clearReset();
    if (!canPlay()) return;
    resetTimer = setTimeout(() => {
      resetTimer = undefined;
      if (!canPlay()) return;
      video.currentTime = 0;
      loops += 1; hero.dataset.loopCount = String(loops);
      void play();
    }, 100);
  });
  video.addEventListener('error', () => {
    failed = true; pause(); video.style.opacity = '0'; setState('failed');
  });
  button.addEventListener('click', () => {
    userPaused = !userPaused;
    if (userPaused) { pause(); if (hero.dataset.hasFrame) video.style.opacity = '1'; }
    else { if (video.ended) video.currentTime = 0; void play(); }
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) { pause(); video.style.opacity = '0'; }
    else if (canPlay()) void play();
    else {
      video.style.opacity = hero.dataset.hasFrame ? '1' : '0';
      setState(source ? 'paused' : 'pending');
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
    else if (canPlay()) void play();
  });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible) pause();
    else if (canPlay() && video.paused) void play();
  }, {threshold:0}).observe(hero);
  setState(reduced.matches ? 'reduced' : source ? 'loading' : 'pending');
  if (canPlay()) void play();
}
