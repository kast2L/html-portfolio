// js/main.js — Hamburger menu toggle + Intersection Observer scroll spy

(function () {
  'use strict';

  // === HAMBURGER MENU ===
  var hamburger = document.querySelector('.nav-hamburger');
  var overlay = document.querySelector('.nav-overlay');

  if (hamburger && overlay) {
    var pageMain = document.getElementById('main');
    var pageFooter = document.querySelector('.footer');
    var overlayLinks = Array.prototype.slice.call(overlay.querySelectorAll('a'));

    function setBackgroundInert(on) {
      [pageMain, pageFooter].forEach(function (el) {
        if (!el) return;
        if (on) { el.setAttribute('inert', ''); }
        else { el.removeAttribute('inert'); }
      });
    }

    function openMenu() {
      overlay.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      setBackgroundInert(true);
      if (overlayLinks[0]) { overlayLinks[0].focus(); }
    }

    function closeMenu(returnFocus) {
      overlay.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      setBackgroundInert(false);
      if (returnFocus) { hamburger.focus(); }
    }

    hamburger.addEventListener('click', function () {
      if (overlay.classList.contains('active')) { closeMenu(false); }
      else { openMenu(); }
    });

    overlayLinks.forEach(function (link) {
      link.addEventListener('click', function () { closeMenu(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('active')) return;

      if (e.key === 'Escape') {
        closeMenu(true);
        return;
      }

      // Trap focus among the hamburger + overlay links while open
      if (e.key === 'Tab') {
        var focusables = [hamburger].concat(overlayLinks);
        var idx = focusables.indexOf(document.activeElement);
        if (idx === -1) { idx = 0; }
        var next;
        if (e.shiftKey) {
          next = idx <= 0 ? focusables[focusables.length - 1] : focusables[idx - 1];
        } else {
          next = idx >= focusables.length - 1 ? focusables[0] : focusables[idx + 1];
        }
        e.preventDefault();
        next.focus();
      }
    });
  }

  // === SCROLL SPY (for resume page) ===
  var spyLinks = document.querySelectorAll('.scroll-spy-link');
  var spySections = document.querySelectorAll('.scroll-spy-section');

  if (spyLinks.length > 0 && spySections.length > 0) {
    var currentId = '';

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          currentId = entry.target.id;
          spyLinks.forEach(function (link) {
            link.classList.toggle(
              'scroll-spy-link--active',
              link.getAttribute('href') === '#' + currentId
            );
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -60% 0px'
    });

    spySections.forEach(function (section) {
      observer.observe(section);
    });
  }

  // === PROJECT FILTER ===
  var filterBtns = document.querySelectorAll('.filter-btn');
  var projectCards = document.querySelectorAll('.project-card');
  var filterEmpty = document.querySelector('.filter-empty');

  if (filterBtns.length > 0) {
    // Initialize aria-pressed to mirror the active button
    filterBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', b.classList.contains('filter-btn--active') ? 'true' : 'false');
    });

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter');

        filterBtns.forEach(function (b) {
          b.classList.remove('filter-btn--active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('filter-btn--active');
        btn.setAttribute('aria-pressed', 'true');

        var visible = 0;
        projectCards.forEach(function (card) {
          if (filter === 'all' || card.getAttribute('data-tags').indexOf(filter) !== -1) {
            card.style.display = '';
            visible++;
          } else {
            card.style.display = 'none';
          }
        });

        if (filterEmpty) {
          filterEmpty.style.display = visible === 0 ? 'block' : 'none';
        }
      });
    });
  }

  // === SCROLL REVEAL ===
  // Content is visible by default. Only when JS runs AND motion is allowed do we gate
  // it behind html.js-reveal, then reveal each block once as it scrolls into view.
  (function () {
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !('IntersectionObserver' in window)) return;

    // [selector, per-item stagger ms] — stagger resets within each shared parent
    var groups = [
      ['.positioning-text', 0],
      ['.section-header', 0],
      ['.impact-stat', 70],
      ['.project-row', 55],
      ['.skill-group', 70],
      ['.cert-callout', 0],
      ['.cta-section > *', 60]
    ];

    var targets = [];
    groups.forEach(function (g) {
      var lastParent = null, i = 0;
      document.querySelectorAll(g[0]).forEach(function (el) {
        if (el.parentNode !== lastParent) { lastParent = el.parentNode; i = 0; }
        if (g[1]) { el.style.animationDelay = Math.min(i, 8) * g[1] + 'ms'; }
        i++;
        el.classList.add('reveal');
        targets.push(el);
      });
    });
    if (!targets.length) { return; }

    document.documentElement.classList.add('js-reveal');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    targets.forEach(function (el) { io.observe(el); });
  })();
})();