export function setupHeroLook(){
 const hero=document.querySelector<HTMLElement>('.cinematic-hero');if(!hero)return;
 const fine=matchMedia('(hover: hover) and (pointer: fine)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let visible=true,frame=0,x=0,y=0,targetX=0,targetY=0,last=0;
 const active=()=>fine.matches&&!reduced.matches&&visible&&!document.hidden;
 function apply(){hero!.style.setProperty('--hero-look-x',x.toFixed(3)+'px');hero!.style.setProperty('--hero-look-y',y.toFixed(3)+'px');hero!.dataset.lookX=x.toFixed(3);hero!.dataset.lookY=y.toFixed(3);}
 function reset(){if(frame)cancelAnimationFrame(frame);frame=0;x=0;y=0;targetX=0;targetY=0;last=0;apply();}
 function draw(time:number){frame=0;if(!active()){reset();return;}const delta=last?Math.min(50,time-last):16.7;last=time;const factor=1-Math.exp(-delta/85);x+=(targetX-x)*factor;y+=(targetY-y)*factor;if(Math.abs(targetX-x)<.01)x=targetX;if(Math.abs(targetY-y)<.01)y=targetY;apply();if(x!==targetX||y!==targetY)frame=requestAnimationFrame(draw);else last=0;}
 function schedule(){if(!frame&&active()){last=0;frame=requestAnimationFrame(draw);}}
 hero.addEventListener('pointermove',event=>{if(event.pointerType!=='mouse'||!active())return;const r=hero.getBoundingClientRect();const nx=Math.max(-1,Math.min(1,((event.clientX-r.left)/r.width-.5)*2)),ny=Math.max(-1,Math.min(1,((event.clientY-r.top)/r.height-.5)*2));targetX=-nx*8;targetY=-ny*5;schedule();});
 hero.addEventListener('pointerleave',()=>{targetX=0;targetY=0;schedule();});
 addEventListener('resize',reset);fine.addEventListener('change',reset);reduced.addEventListener('change',reset);document.addEventListener('visibilitychange',reset);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible)reset();},{threshold:0}).observe(hero);
 apply();
}
