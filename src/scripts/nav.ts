// Header behaviour: condense on scroll, the phone menu, and the current-section marker.
// Works without GSAP; nothing here hides content.

const header = document.querySelector<HTMLElement>('[data-header]');
const button = document.querySelector<HTMLButtonElement>('[data-menu-button]');
const menu = document.querySelector<HTMLElement>('[data-menu]');

/* ---------- Condense on scroll ---------- */
if (header) {
  let ticking = false;
  const update = () => {
    header.classList.toggle('is-condensed', window.scrollY > 8);
    ticking = false;
  };
  update();
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
}

/* ---------- Phone menu ---------- */
if (header && button && menu) {
  const outside = [document.getElementById('main'), document.querySelector<HTMLElement>('.site-footer')].filter(
    (el): el is HTMLElement => el !== null,
  );
  const wide = window.matchMedia('(min-width: 65em)');

  const focusables = (): HTMLElement[] =>
    Array.from(header.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter(
      (el) => el.offsetParent !== null,
    );

  const isOpen = () => button.getAttribute('aria-expanded') === 'true';

  const open = () => {
    menu.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    outside.forEach((el) => el.setAttribute('inert', ''));
    document.addEventListener('keydown', onKey);
    const first = menu.querySelector<HTMLElement>('a[href]');
    first?.focus();
  };

  const close = (returnFocus = true) => {
    menu.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    outside.forEach((el) => el.removeAttribute('inert'));
    document.removeEventListener('keydown', onKey);
    if (returnFocus) button.focus();
  };

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    // Keep focus inside the header while the menu covers the page.
    const items = focusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  button.addEventListener('click', () => (isOpen() ? close() : open()));

  menu.querySelectorAll<HTMLAnchorElement>('[data-menu-link]').forEach((link) => {
    link.addEventListener('click', () => close(false));
  });
  menu.querySelectorAll<HTMLAnchorElement>('a[data-book-call]').forEach((link) => {
    link.addEventListener('click', () => close(false));
  });

  wide.addEventListener('change', (e) => {
    if (e.matches && isOpen()) close(false);
  });
}

/* ---------- Current section in the desktop nav ---------- */
const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav-desktop a[href^="#"]'));
if (navLinks.length && 'IntersectionObserver' in window) {
  const byId = new Map(navLinks.map((a) => [a.getAttribute('href')!.slice(1), a]));
  const sections = Array.from(byId.keys())
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = byId.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach((a) => a.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'true');
        } else if (link.getAttribute('aria-current')) {
          link.removeAttribute('aria-current');
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  sections.forEach((s) => io.observe(s));
}
