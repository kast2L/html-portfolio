// js/attribution.js — capture UTM and gclid values, keep them for 30 days,
// and hand them to the lead form and the booking links.
// Contract: docs/markup-contract.md ("Globals the scripts expose"); rules: docs/PRD.md §5.1, §6.3.

(function () {
  'use strict';

  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'gclid'];
  // Calendly takes the four UTM fields only; gclid means nothing outside Google Ads (PRD §6.3 item 6).
  var LINK_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term'];
  var STORAGE_KEY = 'dh_attribution';
  var MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
  var VALUE_MAX = 100; // stricter than the server's 200 so a value we accept is never rejected
  var PATH_MAX = 200;

  // PRD §5.1: only A-Z a-z 0-9 . _ - + % and space survive; everything else is stripped.
  function clean(value) {
    if (typeof value !== 'string') return '';
    return value.replace(/[^A-Za-z0-9._\-+% ]/g, '').trim().slice(0, VALUE_MAX);
  }

  // Server rule for landing_path: starts with "/", same set plus "/", at most 200 (PRD §5.8).
  function cleanPath(value) {
    var p = typeof value === 'string' ? value.replace(/[^A-Za-z0-9._\-+% \/]/g, '') : '';
    if (p.charAt(0) !== '/') p = '/' + p;
    return p.slice(0, PATH_MAX);
  }

  function empty() {
    var out = {};
    KEYS.forEach(function (k) { out[k] = ''; });
    return out;
  }

  function fromUrl() {
    var found = false;
    var vals = empty();
    try {
      var params = new URLSearchParams(window.location.search);
      KEYS.forEach(function (k) {
        var v = clean(params.get(k));
        if (v) { vals[k] = v; found = true; }
      });
    } catch (e) { /* malformed query: treat as untagged */ }
    return found ? vals : null;
  }

  // Every storage call can throw (Safari private mode, some in-app browsers, blocked cookies).
  function readStored() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var rec = JSON.parse(raw);
      var now = Date.now();
      // Expired, malformed, or stamped in the future: drop it rather than trust it.
      if (!rec || typeof rec.t !== 'number' || !rec.v || now - rec.t > MAX_AGE_MS || rec.t > now + 60000) {
        window.localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      // Re-clean on read: storage can be edited by anyone with devtools or another script.
      var vals = empty();
      KEYS.forEach(function (k) { vals[k] = clean(rec.v[k]); });
      return vals;
    } catch (e) {
      return null;
    }
  }

  function writeStored(vals) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: vals, t: Date.now() }));
    } catch (e) { /* in-memory values still serve this page */ }
  }

  // Latest tagged visit wins (PRD §6.3 item 2); untagged visits keep what is stored.
  var current = fromUrl();
  if (current) {
    writeStored(current);
  } else {
    current = readStored() || empty();
  }
  current.landing_path = cleanPath(window.location.pathname);

  function get() {
    var copy = {};
    for (var k in current) {
      if (Object.prototype.hasOwnProperty.call(current, k)) copy[k] = current[k];
    }
    return copy;
  }

  function fillForm() {
    var form = document.getElementById('lead-form');
    if (!form) return;
    var vals = get();
    Object.keys(vals).forEach(function (k) {
      var input = form.querySelector('input[type="hidden"][name="' + k + '"]');
      if (input) input.value = vals[k];
    });
  }

  function decorateLink(link) {
    try {
      var url = new URL(link.getAttribute('href'), window.location.href);
      LINK_KEYS.forEach(function (k) {
        if (current[k]) url.searchParams.set(k, current[k]);
        else url.searchParams.delete(k);
      });
      link.setAttribute('href', url.toString());
    } catch (e) { /* leave an unparseable href alone; the plain link still works */ }
  }

  function init() {
    fillForm();
    var links = document.querySelectorAll('a[data-book-call]');
    Array.prototype.forEach.call(links, function (link) {
      decorateLink(link);
      // PRD §6.3 item 6 asks for click-time decoration; doing it on load as well means a
      // middle-click or "open in new tab", which skips this listener, still carries the values.
      link.addEventListener('click', function () { decorateLink(link); });
    });
  }

  window.DHAttribution = { get: get };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
