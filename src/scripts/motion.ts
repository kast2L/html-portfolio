import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ContinuumController } from './continuum3d';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ==================== 1. 3D Continuum & Hero Studio Switcher ==================== */
const stageEl = document.querySelector<HTMLElement>('[data-continuum-stage]');
const canvasEl = document.querySelector<HTMLCanvasElement>('[data-continuum-canvas]');
let continuum: ContinuumController | null = null;
let currentModeIndex = 0;
let currentScrollProgress = 0;

if (stageEl && canvasEl && !reducedMotion) {
  const boot3D = () => {
    import('./continuum3d')
      .then(({ initContinuum3D }) => {
        continuum = initContinuum3D(stageEl, canvasEl, false);
        if (continuum) {
          continuum.setMode(currentModeIndex);
          continuum.setScrollProgress(currentScrollProgress);
        }
      })
      .catch(() => {
        // Fallback vector artwork remains visible if WebGL module fails.
      });
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(boot3D, { timeout: 300 });
  } else {
    globalThis.setTimeout(boot3D, 60);
  }
}

const modeButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-mode-btn]'));
const modePanels = Array.from(document.querySelectorAll<HTMLElement>('[data-mode-panel]'));

function activateMode(index: number, focusButton = false) {
  if (!modeButtons.length) return;
  const safe = ((index % modeButtons.length) + modeButtons.length) % modeButtons.length;

  modeButtons.forEach((btn, i) => {
    const active = i === safe;
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
    btn.tabIndex = active ? 0 : -1;
    btn.classList.toggle('is-active', active);
    if (active && focusButton) btn.focus();
  });

  modePanels.forEach((panel, i) => {
    const active = i === safe;
    panel.hidden = !active;
    if (active && !reducedMotion) {
      gsap.fromTo(
        panel,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.36, ease: 'power2.out', clearProps: 'transform,opacity' },
      );
    }
  });

  currentModeIndex = safe;
  continuum?.setMode(safe);
}

if (modeButtons.length) {
  modeButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => activateMode(idx));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        activateMode(idx + 1, true);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        activateMode(idx - 1, true);
      } else if (e.key === 'Home') {
        e.preventDefault();
        activateMode(0, true);
      } else if (e.key === 'End') {
        e.preventDefault();
        activateMode(modeButtons.length - 1, true);
      }
    });
  });
}

/* ==================== 2. Selected Work Interactive Filter ==================== */
const filterBtns = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-work-filter]'));
const workCards = Array.from(document.querySelectorAll<HTMLElement>('[data-work-card]'));

if (filterBtns.length && workCards.length) {
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.workFilter ?? 'all';
      filterBtns.forEach((b) => {
        const on = b === btn;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.classList.toggle('is-active', on);
      });

      const shown: HTMLElement[] = [];
      workCards.forEach((card) => {
        const cats = (card.dataset.categories ?? '').split(/\s+/);
        const match = cat === 'all' || cats.includes(cat);
        card.hidden = !match;
        if (match) shown.push(card);
      });

      if (!reducedMotion && shown.length) {
        gsap.fromTo(
          shown,
          { opacity: 0, y: 16, scale: 0.985 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.45,
            stagger: 0.05,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
          },
        );
      }

      if (!reducedMotion) {
        ScrollTrigger.refresh();
      }
    });
  });
}

/* ==================== 3. Smooth Accessible FAQ Accordions ==================== */
document.querySelectorAll<HTMLElement>('[data-faq-item]').forEach((item) => {
  const btn = item.querySelector<HTMLButtonElement>('[data-faq-btn]');
  const panel = item.querySelector<HTMLElement>('[data-faq-panel]');
  if (!btn || !panel) return;

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const next = !expanded;
    btn.setAttribute('aria-expanded', next ? 'true' : 'false');
    item.classList.toggle('is-open', next);

    if (reducedMotion) {
      panel.hidden = !next;
      return;
    }

    if (next) {
      panel.hidden = false;
      gsap.fromTo(
        panel,
        { height: 0, opacity: 0 },
        {
          height: 'auto',
          opacity: 1,
          duration: 0.34,
          ease: 'power2.out',
          clearProps: 'height,opacity',
          onComplete: () => ScrollTrigger.refresh(),
        },
      );
    } else {
      gsap.to(panel, {
        height: 0,
        opacity: 0,
        duration: 0.26,
        ease: 'power2.inOut',
        onComplete: () => {
          panel.hidden = true;
          panel.style.removeProperty('height');
          panel.style.removeProperty('opacity');
          ScrollTrigger.refresh();
        },
      });
    }
  });
});

/* ==================== 4. GSAP Scroll & Magnetic Choreography ==================== */
if (!reducedMotion) {
  gsap.registerPlugin(ScrollTrigger);

  // Hero entrance
  const heroItems = gsap.utils.toArray<HTMLElement>('[data-hero-item]');
  if (heroItems.length) {
    gsap.from(heroItems, {
      opacity: 0,
      y: 22,
      duration: 0.78,
      stagger: 0.09,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
    });
  }

  // Hero scroll progress -> 3D sculpture tilt
  const heroSection = document.getElementById('hero');
  if (heroSection && stageEl) {
    ScrollTrigger.create({
      trigger: heroSection,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        currentScrollProgress = self.progress;
        continuum?.setScrollProgress(self.progress);
      },
    });
  }

  // Staggered card / group reveals
  document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
    const children = group.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!children.length) return;
    gsap.from(children, {
      opacity: 0,
      y: 26,
      duration: 0.72,
      stagger: 0.08,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
      scrollTrigger: {
        trigger: group,
        start: 'top 84%',
        once: true,
      },
    });
  });

  // Standalone reveals outside groups
  document.querySelectorAll<HTMLElement>('[data-reveal-solo]').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 24,
      duration: 0.72,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
      scrollTrigger: {
        trigger: el,
        start: 'top 86%',
        once: true,
      },
    });
  });

  // Animated impact counters
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count ?? '0');
    const decimals = Number(el.dataset.decimals ?? '0');
    const prefix = el.dataset.prefix ?? '';
    const suffix = el.dataset.suffix ?? '';
    if (!target) return;

    const state = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(state, {
          val: target,
          duration: 1.45,
          ease: 'power3.out',
          onUpdate: () => {
            const formatted =
              decimals > 0
                ? state.val.toFixed(decimals)
                : Math.round(state.val).toLocaleString('en-US');
            el.textContent = `${prefix}${formatted}${suffix}`;
          },
        });
      },
    });
  });

  // Subtle magnetic pull on fine-pointer desktop CTAs
  if (finePointer) {
    document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((btn) => {
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.35, ease: 'power3.out' });
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.35, ease: 'power3.out' });

      btn.addEventListener('pointermove', (e: PointerEvent) => {
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        xTo(dx * 0.18);
        yTo(dy * 0.22);
      });

      btn.addEventListener('pointerleave', () => {
        xTo(0);
        yTo(0);
      });
    });

    // Cursor spotlight coordinates on interactive cards
    document.querySelectorAll<HTMLElement>('[data-spotlight]').forEach((card) => {
      card.addEventListener('pointermove', (e: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--spot-x', `${Math.round(e.clientX - rect.left)}px`);
        card.style.setProperty('--spot-y', `${Math.round(e.clientY - rect.top)}px`);
      });
    });
  }
}
