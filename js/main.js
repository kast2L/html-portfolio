// js/main.js — Hamburger menu toggle + Intersection Observer scroll spy

(function () {
  'use strict';

  // === HAMBURGER MENU ===
  var hamburger = document.querySelector('.nav-hamburger');
  var overlay = document.querySelector('.nav-overlay');

  if (hamburger && overlay) {
    hamburger.addEventListener('click', function () {
      var isOpen = overlay.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    overlay.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        overlay.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close overlay on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        overlay.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        hamburger.focus();
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

  if (filterBtns.length > 0) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter');

        filterBtns.forEach(function (b) { b.classList.remove('filter-btn--active'); });
        btn.classList.add('filter-btn--active');

        projectCards.forEach(function (card) {
          if (filter === 'all' || card.getAttribute('data-tags').indexOf(filter) !== -1) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
})();