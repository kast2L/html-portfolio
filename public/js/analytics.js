// js/analytics.js — GA4 loader and the two conversion events.
// Contract: docs/markup-contract.md ("Globals the scripts expose"); rules: docs/PRD.md §6.

(function () {
  'use strict';

  // The only place the measurement ID lives. Douglas replaces this before deploy.
  var GA4_MEASUREMENT_ID = '__REQUIRED_INPUT:GA4_MEASUREMENT_ID__';

  var CALLBACK_TIMEOUT_MS = 1000; // PRD §5.2: never hold navigation longer than this
  var VALUE_MAX = 100;            // GA4 parameter value limit

  // Only these parameters ever leave the page. Anything else a caller passes is dropped,
  // so a form field can never reach GA4 by mistake (PRD §5.6, §8.4).
  var ALLOWED_PARAMS = {
    cta_location: true,
    form_id: true,
    utm_source: true,
    utm_medium: true,
    utm_campaign: true,
    utm_term: true,
    has_gclid: true,
    page_path: true
  };

  // data-book-call values (contract) map to the cta_location values GA4 reports on (PRD §6.2).
  var LOCATION_MAP = {
    'hero': 'hero',
    'offer': 'offer',
    'cta': 'cta_section',
    'form-fallback': 'form_error',
    'thank-you': 'thank_you',
    'noscript': 'noscript'
  };

  var enabled = false;
  var scriptFailed = false;

  function isConfigured() {
    return GA4_MEASUREMENT_ID.indexOf('__REQUIRED_INPUT') !== 0 &&
      /^G-[A-Z0-9]+$/.test(GA4_MEASUREMENT_ID);
  }

  function gpcOn() {
    try { return navigator.globalPrivacyControl === true; } catch (e) { return false; }
  }

  // gtag.js reads the global dataLayer queue; that array is Google's, not ours, and is the
  // one global this file cannot avoid. The gtag function itself stays private.
  function gtag() {
    window.dataLayer.push(arguments);
  }

  function load() {
    if (!isConfigured() || gpcOn()) return;
    try {
      window.dataLayer = window.dataLayer || [];
      gtag('js', new Date());
      gtag('config', GA4_MEASUREMENT_ID, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      });
      // A script element, not an inline snippet: the landing page CSP forbids inline script.
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_MEASUREMENT_ID);
      s.onerror = function () { scriptFailed = true; };
      (document.head || document.documentElement).appendChild(s);
      enabled = true;
    } catch (e) {
      enabled = false;
    }
  }

  function cleanValue(v) {
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    if (typeof v !== 'string') return '';
    return v.slice(0, VALUE_MAX);
  }

  function attribution() {
    try {
      if (window.DHAttribution && typeof window.DHAttribution.get === 'function') {
        return window.DHAttribution.get() || {};
      }
    } catch (e) { /* fall through */ }
    return {};
  }

  function buildParams(params) {
    var out = {};
    var a = attribution();
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term'].forEach(function (k) {
      if (typeof a[k] === 'string' && a[k]) out[k] = a[k];
    });
    out.has_gclid = a.gclid ? 'true' : 'false';
    out.page_path = window.location.pathname;
    if (params && typeof params === 'object') {
      for (var k in params) {
        if (Object.prototype.hasOwnProperty.call(params, k) && ALLOWED_PARAMS[k]) out[k] = params[k];
      }
    }
    // Empty values are omitted, not sent as "(not set)"; GA4 shows "(not set)" on its own.
    var result = {};
    for (var key in out) {
      if (Object.prototype.hasOwnProperty.call(out, key)) {
        var v = cleanValue(out[key]);
        if (v) result[key] = v;
      }
    }
    return result;
  }

  // done (optional) is called exactly once: when GA4 confirms the hit, after
  // CALLBACK_TIMEOUT_MS, or at once when analytics is off. Callers can navigate in it.
  function track(name, params, done) {
    var called = false;
    function finish() {
      if (called) return;
      called = true;
      if (typeof done === 'function') {
        try { done(); } catch (e) { /* a caller's error must not surface here */ }
      }
    }
    try {
      if (!enabled || scriptFailed || typeof name !== 'string' || !name) {
        finish();
        return;
      }
      var p = buildParams(params);
      p.event_callback = finish;
      p.event_timeout = CALLBACK_TIMEOUT_MS;
      gtag('event', name, p);
      // gtag never calls back if its script was blocked, so do not rely on it alone.
      setTimeout(finish, CALLBACK_TIMEOUT_MS);
    } catch (e) {
      finish();
    }
  }

  function bindBookingLinks() {
    var links = document.querySelectorAll('a[data-book-call]');
    Array.prototype.forEach.call(links, function (link) {
      link.addEventListener('click', function () {
        var raw = link.getAttribute('data-book-call') || '';
        var loc = Object.prototype.hasOwnProperty.call(LOCATION_MAP, raw) ? LOCATION_MAP[raw] : 'other';
        // No callback: the link opens a new tab and must never wait on analytics.
        track('book_call', { cta_location: loc });
      });
    });
  }

  load();

  window.DHAnalytics = { track: track };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindBookingLinks);
  } else {
    bindBookingLinks();
  }
})();
