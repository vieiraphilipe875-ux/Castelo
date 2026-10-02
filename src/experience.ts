export function setupExperience(){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),short=matchMedia('(max-height: 520px)');
 const campus=document.querySelector<HTMLElement>('#campus')!,life=document.querySelector<HTMLElement>('#vivencias')!,track=life.querySelector<HTMLElement>('.life-track')!,technical=document.querySelector<HTMLElement>('#tecnica')!,visit=document.querySelector<HTMLElement>('#visita')!;
 const lifeButtons=[...life.querySelectorAll<HTMLButtonElement>('[data-life-focus]')],resume=life.querySelector<HTMLButtonElement>('.life-resume')!;
 const rows=[...technical.querySelectorAll<HTMLElement>('[data-course]')],directory=[...technical.querySelectorAll<HTMLAnchorElement>('[data-course-target]')];
 const stage=document.querySelector<HTMLSelectElement>('#visit-stage')!,visitLink=document.querySelector<HTMLAnchorElement>('#visit-whatsapp')!,summary=visit.querySelector<HTMLElement>('.visit-interest-summary')!;
 let frame=0,override:number|null=null,transitionTimer=0,interest='',detail=false;
 const visible=new Set<Element>();const clamp=(x:number)=>Math.max(0,Math.min(1,x)),ease=(x:number)=>{x=clamp(x);return x*x*(3-2*x);};
 const enabled=()=>!reduced.matches&&!short.matches;
 function updateVisit(){
  const base='Olá! Gostaria de agendar uma visita ao Colégio Castelo.';
  const message=base+(stage.value?' Tenho interesse em '+stage.value+'.':'')+(interest?' Gostaria também de conhecer '+interest+'.':'');
  const url=new URL('https://api.whatsapp.com/send');url.searchParams.set('phone','5522988447136');url.searchParams.set('text',message);visitLink.href=url.href;
  summary.hidden=!interest;summary.querySelector('.visit-interest-text')!.textContent=interest;visit.dataset.visitInterest=interest;
 }
 function chooseInterest(text:string,course=false){interest=text;if(course)stage.value='Educação Técnica';updateVisit();visit.querySelector('.visit-choice')!.scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});stage.focus({preventScroll:true});}
 campus.querySelector('.spaces-visit-interest')!.addEventListener('click',()=>{const panel=campus.querySelector<HTMLElement>('[data-panel]:not([hidden])');if(panel)chooseInterest(panel.querySelector('h3')!.textContent!);});
 technical.querySelectorAll<HTMLButtonElement>('[data-course-interest]').forEach(button=>button.addEventListener('click',()=>chooseInterest('o curso técnico em '+button.dataset.courseInterest,true)));
 stage.addEventListener('change',updateVisit);visit.querySelector('.visit-clear-interest')!.addEventListener('click',()=>{interest='';updateVisit();stage.focus({preventScroll:true});});
 function framing(value:boolean){detail=value;campus.dataset.framing=value?'detail':'general';campus.querySelectorAll<HTMLButtonElement>('[data-campus-framing]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.campusFraming==='detail')===value)));}
 campus.querySelectorAll<HTMLButtonElement>('[data-campus-framing]').forEach(b=>b.addEventListener('click',()=>framing(b.dataset.campusFraming==='detail')));
 campus.addEventListener('campuschange',()=>framing(false));
 function lifeState(){
  const r=track.getBoundingClientRect(),top=innerWidth>800?76:70;const length=Math.max(1,r.height-(innerHeight-top));const progress=clamp((top-r.top)/length);const focus=override===null?ease((progress-.14)/.72):override;
  life.dataset.lifeProgress=progress.toFixed(4);life.style.setProperty('--life-share',String(70-35*focus)+'%');life.style.setProperty('--life-slide',String(focus));life.dataset.lifeFocus=focus.toFixed(4);
  life.querySelector('.life-mode-label')!.textContent=focus<.5?'Lá fora, descobrir em companhia.':'Música, expressão e encontro.';
  lifeButtons.forEach(b=>b.setAttribute('aria-pressed',String(override===Number(b.dataset.lifeFocus))));resume.disabled=override===null;
 }
 function temporaryTransition(){clearTimeout(transitionTimer);life.dataset.lifeMode='manual';transitionTimer=window.setTimeout(()=>{life.dataset.lifeMode=override===null?'scroll':'manual';},420);}
 lifeButtons.forEach(b=>b.addEventListener('click',()=>{override=Number(b.dataset.lifeFocus);temporaryTransition();lifeState();if(!enabled())life.querySelector(override===0?'.life-garden':'.life-music')!.scrollIntoView({block:'center',behavior:'instant'});}));
 resume.addEventListener('click',()=>{override=null;temporaryTransition();lifeState();});
 function draw(){frame=0;if(document.hidden)return;
  if(visible.has(campus)){
   const r=campus.getBoundingClientRect(),progress=clamp((innerHeight-r.top)/(innerHeight+r.height));campus.dataset.observationProgress=progress.toFixed(4);campus.style.setProperty('--spaces-aperture',reduced.matches?'0%':(18*(1-ease((progress-.18)/.34))).toFixed(3)+'%');
  }
  if(visible.has(life))lifeState();
  if(visible.has(technical)){
   const point=Math.min(innerHeight*.43,240);let index=0;rows.forEach((row,i)=>{if(row.getBoundingClientRect().top<point)index=i;});technical.dataset.activeCourse=rows[index].dataset.course;technical.querySelector('.technical-course-current')!.textContent=rows[index].dataset.course!;technical.style.setProperty('--course-progress',String((index+.5)/rows.length));rows.forEach((row,i)=>row.classList.toggle('course-current',i===index));directory.forEach((a,i)=>i===index?a.setAttribute('aria-current','step'):a.removeAttribute('aria-current'));
  }
  if(visible.has(visit)){const r=visit.getBoundingClientRect(),progress=clamp((innerHeight-r.top)/(innerHeight+r.height));visit.style.setProperty('--visit-inset',reduced.matches?'0%':(10*(1-ease((progress-.05)/.25))).toFixed(3)+'%');visit.dataset.closingProgress=progress.toFixed(4);}
 }
 function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(draw);}
 function measure(){campus.querySelector('.campus-tabs')!.setAttribute('aria-orientation',innerWidth>800?'vertical':'horizontal');clearTimeout(transitionTimer);override=null;life.dataset.lifeMode='scroll';life.classList.toggle('life-enabled',enabled());lifeState();schedule();if(reduced.matches)campus.querySelectorAll('[data-panel]').forEach(p=>p.getAnimations().forEach(a=>a.cancel()));}
 const observer=new IntersectionObserver(entries=>{entries.forEach(e=>e.isIntersecting?visible.add(e.target):visible.delete(e.target));schedule();},{rootMargin:'120px 0px'});[campus,life,technical,visit].forEach(el=>observer.observe(el));
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure);document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',measure);short.addEventListener('change',measure);void document.fonts.ready.then(measure);
 document.querySelectorAll<HTMLImageElement>('.spaces-photo img,.life-mural img,.technical-lab img,.visit-architecture img').forEach(image=>image.addEventListener('load',schedule));
 framing(detail);updateVisit();measure();
}
