document.documentElement.classList.add('js');

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navegacion');
const navigationLinks = [...navigation.querySelectorAll('a')];
const sectionLinks = navigationLinks.filter(link => link.getAttribute('href').startsWith('#')).map(link => ({
  link,
  section: document.querySelector(link.getAttribute('href')),
}));
const progress = document.querySelector('.reading-progress');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function closeMenu() {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
}

menuButton.addEventListener('click', () => {
  const opened = navigation.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(opened));
  if (opened && !reducedMotion.matches) {
    navigation.animate(
      [{ opacity: .6, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' },
    );
  }
});

navigation.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link || !navigation.classList.contains('is-open')) return;
  closeMenu();
  if (!link.getAttribute('href').startsWith('#')) return;
  const destination = document.querySelector(link.getAttribute('href'));
  destination.setAttribute('tabindex', '-1');
  destination.focus({ preventScroll: true });
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    closeMenu();
    menuButton.focus();
  }
});

let scheduled = false;
function updateReadingPosition() {
  scheduled = false;
  const available = document.documentElement.scrollHeight - window.innerHeight;
  const fraction = available > 0 ? Math.min(1, Math.max(0, window.scrollY / available)) : 0;
  progress.style.transform = `scaleX(${fraction})`;
  let active = null;
  for (const entry of sectionLinks) {
    if (entry.section.getBoundingClientRect().top <= window.innerHeight * .35) {
      active = entry.link;
    }
  }
  if (available > 0 && fraction >= .995) active = sectionLinks.at(-1)?.link;
  for (const link of navigationLinks) {
    if (link === active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}

function scheduleReadingUpdate() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(updateReadingPosition);
}
window.addEventListener('scroll', scheduleReadingUpdate, { passive: true });
window.addEventListener('resize', scheduleReadingUpdate);
window.addEventListener('load', scheduleReadingUpdate);
updateReadingPosition();

const flow = document.querySelector('.engineering-flow');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    if (!reducedMotion.matches) {
      flow.classList.add('flow-arrives');
      flow.closest('.approach').classList.add('surface-arrives');
    }
    observer.disconnect();
  }, { threshold: .6 });
  observer.observe(flow);
}

reducedMotion.addEventListener('change', () => {
  if (!reducedMotion.matches) return;
  flow.classList.remove('flow-arrives');
  flow.closest('.approach').classList.remove('surface-arrives');
  navigation.getAnimations().forEach(animation => animation.cancel());
});

window.matchMedia('(min-width: 64.001rem)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});
