import { createPanorama } from './panorama';
export function setupJourney(){
 const root=document.querySelector<HTMLElement>('.journey');if(!root)return;
 const canvas=root.querySelector<HTMLCanvasElement>('canvas')!;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),short=matchMedia('(max-height: 520px)');
 const intro=root.querySelector<HTMLElement>('.journey-intro')!,inside=root.querySelector<HTMLElement>('.journey-inside')!,learning=root.querySelector<HTMLElement>('.journey-learning')!,controls=root.querySelector<HTMLElement>('.journey-controls')!;
 const moments=[...root.querySelectorAll<HTMLButtonElement>('[data-journey-moment]')];
 const status=root.querySelector<HTMLElement>('.journey-control-status')!;
 let renderer:Awaited<ReturnType<typeof createPanorama>>|null=null,loading=false,near=false,visible=false,frame=0,start=0,length=1,progress=0,manualYaw=0,manualPitch=0,baseYaw=-28,basePitch=-7,lastAct='';
 const clamp=(x:number)=>Math.max(0,Math.min(1,x));const blend=(x:number)=>{x=clamp(x);return x*x*(3-2*x);};
 const enabled=()=>!reduced.matches&&!short.matches;
 function inert(el:HTMLElement,value:boolean){el.inert=value;el.setAttribute('aria-hidden',String(value));}
 function measure(){root!.classList.toggle('journey-enabled',enabled());const r=root!.getBoundingClientRect();start=r.top+scrollY-(innerWidth>800?76:70);length=Math.max(1,r.height-(innerHeight-(innerWidth>800?76:70)));if(!enabled()){[intro,inside,learning,controls].forEach(el=>inert(el,false));root!.dataset.journeyAct='static';root!.querySelectorAll<HTMLElement>('[style]').forEach(el=>el.removeAttribute('style'));}schedule();}
 async function load(){if(loading||renderer||!enabled()||!near)return;loading=true;try{renderer=await createPanorama(canvas);root!.dataset.panorama='ready';status.textContent='Setas do teclado também giram a vista.';schedule();}catch{root!.dataset.panorama='failed';status.textContent='Vista estática disponível. Explore o tour completo pelo link.';controls.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.disabled=true);}loading=false;}
 function draw(){frame=0;if(document.hidden||!enabled()||!visible)return;progress=clamp((scrollY-start)/length);root!.dataset.journeyProgress=progress.toFixed(4);
  const leave=blend((progress-.74)/.20),expand=blend((progress-.33)/.20),wipe=blend((progress-.14)/.15),introOut=blend((progress-.18)/.06);
  root!.dataset.mediaExpanded=String(expand>.9);
  const stageHeight=innerHeight-(innerWidth>800?76:70),mobile=innerWidth<=800;
  const initialWidth=innerWidth*(mobile?.90:.50),initialHeight=Math.min(stageHeight*(mobile?.40:.72),initialWidth/1.2),initialLeft=innerWidth*(mobile?.05:.45),initialTop=stageHeight*(mobile?.51:.16);
  const mediaLeft=initialLeft*(1-expand),mediaTop=initialTop*(1-expand),mediaWidth=initialWidth+(innerWidth-initialWidth)*expand,mediaHeight=initialHeight+(stageHeight-initialHeight)*expand;
  const insideStart=mobile?stageHeight-250:stageHeight*.45,insideEnd=mobile?270:stageHeight*.07;
  const values:Record<string,string>={
   '--journey-room-opacity':'1', '--journey-room-inset':`${leave*43}%`,
   '--journey-media-left':`${mediaLeft}px`,'--journey-media-top':`${mediaTop}px`,'--journey-media-width':`${mediaWidth}px`,'--journey-media-height':`${mediaHeight}px`,'--journey-facade-wipe':`${wipe*100}%`,'--journey-caption-opacity':String(1-expand),
   '--journey-intro-opacity':String(1-introOut),'--journey-intro-x':'0px',
   '--journey-inside-opacity':String(blend((progress-.24)/.06)*(1-leave)),'--journey-inside-y':'0px','--journey-inside-bottom':`${insideStart+(insideEnd-insideStart)*expand}px`, '--journey-controls-opacity':String(blend((progress-.54)/.05)*(1-leave)), '--journey-controls-y':`${(1-blend((progress-.54)/.05))*50}px`,
   '--journey-learning-x':`${(1-leave)*105}%`, '--journey-learning-z':`${-90*(1-leave)}px`, '--journey-learning-angle':`${-9*(1-leave)}deg`, '--journey-learning-opacity':String(blend((progress-.74)/.05))
  };Object.entries(values).forEach(([k,v])=>root!.style.setProperty(k,v));
  const sweep=blend((progress-.34)/.21);baseYaw=-28+sweep*66;basePitch=-7+sweep*4;const camera={yaw:baseYaw+manualYaw,pitch:Math.max(-55,Math.min(55,basePitch+manualPitch)),fov:94-sweep*14+leave*8};renderer?.draw(camera);
  const act=progress<.24?'facade':progress<.59?'room':progress<.79?'explore':'learn';root!.dataset.journeyAct=act;
  if(act!==lastAct){lastAct=act;inert(intro,act!=='facade');inert(inside,!['room','explore'].includes(act));inert(controls,act!=='explore');inert(learning,act!=='learn');canvas.tabIndex=act==='explore'&&root!.dataset.panorama==='ready'?0:-1;const index=['facade','room','explore','learn'].indexOf(act);moments.forEach((b,i)=>i===index?b.setAttribute('aria-current','step'):b.removeAttribute('aria-current'));root!.querySelector('.journey-position')!.textContent=['01 / FACHADA','02 / ESPAÇO REAL','03 / OLHE AO REDOR','04 / APRENDER'][index];}
 }
 function schedule(){if(!frame&&!document.hidden&&enabled())frame=requestAnimationFrame(draw);}
 const proximity=new IntersectionObserver(entries=>{near=entries[0].isIntersecting;if(near)void load();},{rootMargin:'100% 0px'});proximity.observe(root);
 const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)schedule();});visibility.observe(root);
 moments.forEach(button=>button.addEventListener('click',()=>{measure();if(enabled())window.scrollTo({top:start+length*Number(button.dataset.journeyMoment),behavior:'instant'});schedule();}));
 function userView(yaw:number,pitch:number){manualYaw=yaw-baseYaw;manualPitch=pitch-basePitch;schedule();}
 root.querySelectorAll<HTMLButtonElement>('[data-journey-view]').forEach(button=>button.addEventListener('click',()=>{const [yaw,pitch]=button.dataset.journeyView!.split(',').map(Number);userView(yaw,pitch);status.textContent=button.textContent+' — use as setas ou arraste para continuar olhando.';}));
 root.querySelectorAll<HTMLButtonElement>('[data-journey-look]').forEach(button=>button.addEventListener('click',()=>{manualYaw+=Number(button.dataset.journeyLook);schedule();}));
 root.querySelector('.journey-reset')!.addEventListener('click',()=>{manualYaw=0;manualPitch=0;status.textContent='Vista recentrada.';schedule();});
 canvas.addEventListener('keydown',event=>{if(!enabled()||!renderer)return;const change:Record<string,[number,number]>={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,8],ArrowDown:[0,-8]};if(change[event.key]){event.preventDefault();manualYaw+=change[event.key][0];manualPitch+=change[event.key][1];schedule();}else if(event.key==='Home'){event.preventDefault();manualYaw=0;manualPitch=0;schedule();}});
 let drag:{id:number;x:number;y:number;yaw:number;pitch:number}|null=null;
 canvas.addEventListener('pointerdown',e=>{if(root!.dataset.journeyAct!=='explore'||!renderer)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,yaw:manualYaw,pitch:manualPitch};if(e.pointerType==='mouse')canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;manualYaw=drag.yaw-(e.clientX-drag.x)*.17;manualPitch=drag.pitch+(e.clientY-drag.y)*.12;schedule();});
 const end=()=>{drag=null;};canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();renderer=null;root!.dataset.panorama='failed';status.textContent='Vista estática disponível; o panorama gráfico foi interrompido.';});
 const stages:Record<string,{title:string;copy:string;alt:string;height:number}>={
  infantil:{title:'EDUCAÇÃO INFANTIL',copy:'Brincar, explorar, conviver. O começo de uma relação com o conhecimento.',alt:'Crianças do Castelo em uma atividade com a educadora',height:675},
  fundamental:{title:'ENSINO FUNDAMENTAL I',copy:'Leitura, raciocínio e descobertas para ampliar a autonomia e aprender em companhia.',alt:'Estudantes do Ensino Fundamental I do Castelo em sala',height:600},
  'fundamental-ii':{title:'ENSINO FUNDAMENTAL II',copy:'Conhecimento, expressão e novas perguntas para uma fase de grandes descobertas.',alt:'Estudantes do Castelo em uma apresentação cultural',height:635},
  medio:{title:'ENSINO MÉDIO',copy:'Conhecimento e escolhas para construir os próximos passos com acompanhamento e convivência.',alt:'Estudantes do Ensino Médio do Castelo em uma atividade ao ar livre',height:675},
  tecnica:{title:'EDUCAÇÃO TÉCNICA',copy:'Teoria e prática se encontram em laboratórios e novos caminhos de formação.',alt:'Estudantes do Castelo em uma atividade de laboratório',height:675}
 };
 root.querySelectorAll<HTMLAnchorElement>('[data-journey-stage]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();const id=link.dataset.journeyStage!,stage=stages[id],image=root!.querySelector<HTMLImageElement>('.journey-student img')!;image.src='/assets/'+id+'.webp';image.alt=stage.alt;image.height=stage.height;root!.querySelector('.journey-student figcaption')!.textContent=stage.title;root!.querySelector('.journey-stage-copy')!.textContent=stage.copy;root!.querySelector<HTMLAnchorElement>('.journey-stage-link')!.href=link.href;root!.querySelectorAll('[data-journey-stage]').forEach(a=>a===link?a.setAttribute('aria-current','true'):a.removeAttribute('aria-current'));root!.dataset.selectedStage=id;}));
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure);document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',()=>{lastAct='';measure();if(enabled())void load();});short.addEventListener('change',()=>{lastAct='';measure();if(enabled())void load();});
 measure();
}
