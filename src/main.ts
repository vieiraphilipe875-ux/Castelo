import { setupSmoothScroll } from './smooth-scroll';
import { setupChoreography } from './choreography';
import { setupExperience } from './experience';
import { setupJourney } from './journey';
import { setupHeroLook } from './hero-look';
import { setupStory } from './story';
import { setupLocation } from './location';
import { setupCinematicHero } from './cinematic';
import './redesign.css';
import './style.css';
import './correction.css';
import './cinematic.css';
import './story.css';
import './continuation.css';
import './journey.css';
import './fullbleed.css';
import './experience.css';
import './choreography.css';
import './hero-composition.css';

const root = document.documentElement;
const header = document.querySelector<HTMLElement>('.site-header')!;
const menuButton = document.querySelector<HTMLButtonElement>('.menu-toggle')!;
const navigation = document.querySelector<HTMLElement>('#navigation')!;
root.classList.add('js-ready');

function closeMenu(returnFocus = false) {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', (event) => {
  if ((event.target as Element).closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', (event) => {
  if (!header.contains(event.target as Node)) closeMenu();
});
const menuQuery = matchMedia('(min-width: 801px)');
menuQuery.addEventListener('change', () => closeMenu());

const campus = document.querySelector<HTMLElement>('.campus')!;
const tabList = document.querySelector<HTMLElement>('.campus-tabs')!;
const tabs = [...tabList.querySelectorAll<HTMLButtonElement>('button')];
const panels = [...document.querySelectorAll<HTMLElement>('[data-panel]')];
tabList.setAttribute('role', 'tablist');
tabList.setAttribute('aria-label', 'Espaços do campus');
tabs.forEach((tab, index) => {
  tab.setAttribute('role', 'tab');
  tab.id = 'tab-' + tab.dataset.campus;
  tab.setAttribute('aria-controls', 'campus-' + tab.dataset.campus);
  panels[index].setAttribute('role', 'tabpanel');
  panels[index].setAttribute('aria-labelledby', tab.id);
  panels[index].tabIndex = 0;
  tab.addEventListener('click', () => activateTab(index));
  tab.addEventListener('keydown', (event) => {
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    activateTab(next, true);
  });
});
function activateTab(index: number, focus = false) {
  tabs.forEach((tab, i) => {
    tab.setAttribute('aria-selected', String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
    panels[i].hidden = i !== index;
  });
  if (focus) {
    tabs[index].focus({ preventScroll: true });
    tabs[index].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
  }
  const panel = panels[index];
  panels.forEach(p => p.getAnimations().forEach(a => a.cancel()));
  campus.dataset.activeSpace = tabs[index].dataset.campus;
  campus.dispatchEvent(new CustomEvent('campuschange'));
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    panel.animate([{ clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 420, easing: 'cubic-bezier(.2,.7,.2,1)' });
  }
}
activateTab(0);
campus.classList.add('campus-enabled');
tabList.setAttribute('aria-orientation', 'horizontal');

const visitStage = document.querySelector<HTMLSelectElement>('#visit-stage')!;
const visitLink = document.querySelector<HTMLAnchorElement>('#visit-whatsapp')!;
visitStage.addEventListener('change', () => {
  const interest = visitStage.value ? ' Tenho interesse em ' + visitStage.value + '.' : '';
  const message = 'Olá! Gostaria de agendar uma visita ao Colégio Castelo.' + interest;
  const url = new URL('https://api.whatsapp.com/send');
  url.searchParams.set('phone', '5522988447136');
  url.searchParams.set('text', message);
  visitLink.href = url.href;
});

document.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
  const fail = () => img.parentElement?.classList.add('media-failed');
  img.addEventListener('error', fail);
  img.addEventListener('load', () => img.parentElement?.classList.remove('media-failed'));
  if (img.complete && img.naturalWidth === 0) fail();
});

let scrollScheduled = false;
function updateReadingProgress() {
  scrollScheduled = false;
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
  const bar = document.querySelector<HTMLElement>('.reading-progress')!;
  bar.style.transform = 'scaleX(' + progress + ')';
  header.classList.toggle('scrolled', scrollY > 40);
}
addEventListener('scroll', () => {
  if (!scrollScheduled) {
    scrollScheduled = true;
    requestAnimationFrame(updateReadingProgress);
  }
}, { passive: true });
addEventListener('resize', updateReadingProgress);
updateReadingProgress();

setupCinematicHero();

setupLocation();

setupStory();

setupJourney();
setupHeroLook();

setupExperience();
setupSmoothScroll();
setupChoreography();
