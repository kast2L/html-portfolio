// js/lead-form.js — validation and submission for the landing page lead form.
// Contract: docs/markup-contract.md ("Lead form"); rules: docs/PRD.md §5.

(function () {
  'use strict';

  var ENDPOINT = '/api/lead';
  var THANK_YOU_PATH = '/thank-you'; // fixed: never read from the URL, the response, or storage
  var TIMEOUT_MS = 15000;            // covers a Lambda cold start; the browser gives up last (PRD §5.5)
  var MIN_ELAPSED_MS = 3000;         // same threshold the server applies (PRD §5.3)
  var NAV_FALLBACK_MS = 1000;        // longest wait for the GA4 callback before leaving (PRD §5.2)
  var FORM_ID = 'lp_sprint';
  var ATTRIBUTION_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'gclid', 'landing_path'];

  var FIELDS = [
    { id: 'lead-name', name: 'name', min: 1, max: 120 },
    { id: 'lead-email', name: 'email', min: 1, max: 254, email: true },
    { id: 'lead-company', name: 'company', min: 1, max: 120 },
    { id: 'lead-process', name: 'process', min: 10, max: 2000 }
  ];

  // The server sends codes only (PRD §5.8); every code maps to this page's own wording.
  var MESSAGES = {
    name: {
      required: 'Enter your name.',
      too_long: 'Shorten your name to 120 characters or fewer.'
    },
    email: {
      required: 'Enter your work email.',
      invalid: 'Enter a work email like name@company.com.',
      too_long: 'Shorten the email address to 254 characters or fewer.'
    },
    company: {
      required: 'Enter your company name.',
      too_long: 'Shorten the company name to 120 characters or fewer.'
    },
    process: {
      required: 'Describe the process you want fixed.',
      invalid: 'Add a little more detail about the process: at least 10 characters.',
      too_long: 'Shorten the description to 2,000 characters or fewer.'
    }
  };

  var PASTE_NOTICE = {
    name: 'The pasted text was longer than 120 characters, so only the first 120 were kept. Check the end of what you pasted.',
    email: 'The pasted text was longer than 254 characters, so only the first 254 were kept. Check the address.',
    company: 'The pasted text was longer than 120 characters, so only the first 120 were kept. Check the end of what you pasted.',
    process: 'The pasted text was longer than 2,000 characters, so only the first 2,000 were kept. Check the end of your description and shorten it if needed.'
  };

  var STATUS = {
    sending: 'Sending your message…',
    offline: 'You appear to be offline, so your message was not sent. Your answers are still here. Check your connection and try again, or book a call or email Douglas using the options below.',
    // The request may already have arrived, so this wording does not claim it failed.
    offlineSending: 'You appear to have gone offline, so this page could not confirm that your message was sent. Your answers are still here. Try again when you are back online, or book a call or email Douglas using the options below.',
    failed: 'This page could not confirm that your message was sent. Your answers are still here. Try again, or book a call or email Douglas using the options below.',
    rate: 'Too many attempts in a short time. Wait a minute, then try again, or book a call or email Douglas using the options below.',
    fixFields: 'Some answers need a change before your message can be sent.'
  };

  var SUMMARY_HEADING = 'Fix the following to send your message:';

  // Pure checks, kept free of the DOM so the rules match the server's table in PRD §5.8.
  function validEmailShape(v) {
    if (/\s/.test(v) || /[\u0000-\u001f\u007f]/.test(v)) return false;
    var parts = v.split('@');
    if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
    var domain = parts[1];
    var dot = domain.indexOf('.');
    return dot > 0 && domain.charAt(domain.length - 1) !== '.';
  }

  function checkValue(spec, raw, browserSaysBadEmail) {
    var v = (raw || '').trim();
    if (!v) return 'required';
    if (v.length > spec.max) return 'too_long';
    if (spec.email && (browserSaysBadEmail || !validEmailShape(v))) return 'invalid';
    if (v.length < spec.min) return 'invalid';
    return '';
  }

  // Sorts every server answer into success, fixable field errors, or a general failure.
  function classify(status, body) {
    if (status === 200 && body && body.ok === true) return { kind: 'success' };
    if (status === 400 && body && body.ok === false && body.errors && typeof body.errors === 'object') {
      var keys = Object.keys(body.errors);
      if (!keys.length) return { kind: 'fail', reason: 'failed' };
      for (var i = 0; i < keys.length; i++) {
        var map = MESSAGES[keys[i]];
        var code = body.errors[keys[i]];
        // A field the visitor cannot see or fix, or a code we have no wording for.
        if (!map || typeof code !== 'string' || !Object.prototype.hasOwnProperty.call(map, code)) {
          return { kind: 'fail', reason: 'failed' };
        }
      }
      return { kind: 'fields', errors: body.errors };
    }
    if (status === 429) return { kind: 'fail', reason: 'rate' };
    return { kind: 'fail', reason: 'failed' };
  }

  function parseJson(text) {
    try { return JSON.parse(text); } catch (e) { return null; }
  }

  var form = document.getElementById('lead-form');
  if (!form) return;

  var summary = document.getElementById('lead-errors');
  var statusEl = document.getElementById('lead-status');
  var fallback = document.getElementById('lead-fallback');
  var button = document.getElementById('lead-submit');
  var honeypot = document.getElementById('lead-website');
  var buttonLabel = button ? button.querySelector('.btn-label') : null;
  var idleLabel = buttonLabel ? buttonLabel.textContent : '';

  var inFlight = false;
  var submitAttempted = false;
  var attributionFilled = false;
  var state = {}; // per field: { dirty, error, notice, pastedOver }

  FIELDS.forEach(function (spec) {
    spec.el = document.getElementById(spec.id);
    spec.errorEl = document.getElementById(spec.id + '-error');
    state[spec.name] = { dirty: false, error: '', notice: '', pastedOver: false };
  });

  form.removeAttribute('hidden');

  function setText(el, text) {
    if (el) el.textContent = text;
  }

  function setStatus(text) {
    setText(statusEl, text);
  }

  function describedBy(el, id, on) {
    var tokens = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    var idx = tokens.indexOf(id);
    if (on && idx === -1) tokens.push(id);
    if (!on && idx !== -1) tokens.splice(idx, 1);
    if (tokens.length) el.setAttribute('aria-describedby', tokens.join(' '));
    else el.removeAttribute('aria-describedby');
  }

  function wrapperOf(el) {
    return el && el.closest ? el.closest('.field') : null;
  }

  // One renderer for both errors and paste notices, so the markup stays consistent.
  function renderField(spec) {
    var s = state[spec.name];
    if (!spec.el) return;
    var wrap = wrapperOf(spec.el);
    var text = s.error ? MESSAGES[spec.name][s.error] : s.notice;
    if (s.error) {
      spec.el.setAttribute('aria-invalid', 'true');
      if (wrap) wrap.classList.add('is-invalid');
    } else {
      spec.el.removeAttribute('aria-invalid');
      if (wrap) wrap.classList.remove('is-invalid');
    }
    if (!spec.errorEl) return;
    if (text) {
      spec.errorEl.textContent = text;
      spec.errorEl.removeAttribute('hidden');
      describedBy(spec.el, spec.errorEl.id, true);
    } else {
      spec.errorEl.textContent = '';
      spec.errorEl.setAttribute('hidden', '');
      describedBy(spec.el, spec.errorEl.id, false);
    }
  }

  function validateField(spec) {
    if (!spec.el) return '';
    var badEmail = spec.email && spec.el.validity ? spec.el.validity.typeMismatch : false;
    state[spec.name].error = checkValue(spec, spec.el.value, badEmail);
    renderField(spec);
    return state[spec.name].error;
  }

  function clearChildren(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function summaryParts() {
    var heading = summary.querySelector('h2, h3, h4, h5, h6');
    if (!heading) {
      heading = document.createElement('h3');
      heading.textContent = SUMMARY_HEADING;
      summary.insertBefore(heading, summary.firstChild);
    }
    var list = summary.querySelector('ul, ol');
    if (!list) {
      list = document.createElement('ul');
      summary.appendChild(list);
    }
    return list;
  }

  function renderSummary(focusIt) {
    if (!summary) return;
    var failing = FIELDS.filter(function (spec) { return spec.el && state[spec.name].error; });
    if (!failing.length) {
      summary.setAttribute('hidden', '');
      return;
    }
    var list = summaryParts();
    clearChildren(list);
    failing.forEach(function (spec) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.setAttribute('href', '#' + spec.id);
      a.textContent = MESSAGES[spec.name][state[spec.name].error];
      a.addEventListener('click', function (e) {
        e.preventDefault();
        spec.el.focus();
      });
      li.appendChild(a);
      list.appendChild(li);
    });
    summary.removeAttribute('hidden');
    if (focusIt) summary.focus();
  }

  function fillAttribution() {
    var vals = {};
    try {
      if (window.DHAttribution && typeof window.DHAttribution.get === 'function') {
        vals = window.DHAttribution.get() || {};
      }
    } catch (e) { vals = {}; }
    var out = {};
    ATTRIBUTION_FIELDS.forEach(function (k) {
      var input = form.querySelector('input[type="hidden"][name="' + k + '"]');
      if (typeof vals[k] === 'string') {
        if (input) input.value = vals[k];
        out[k] = vals[k];
      } else {
        // attribution.js missing: keep whatever the hidden input already holds.
        out[k] = input ? input.value : '';
      }
    });
    return out;
  }

  function setSending(on) {
    form.classList.toggle('is-sending', on);
    if (on) form.setAttribute('aria-busy', 'true');
    else form.removeAttribute('aria-busy');
    if (!button) return;
    button.disabled = on;
    if (on) {
      button.setAttribute('aria-busy', 'true');
      button.setAttribute('aria-disabled', 'true');
    } else {
      button.removeAttribute('aria-busy');
      button.removeAttribute('aria-disabled');
    }
    var label = on ? button.getAttribute('data-label-busy') : button.getAttribute('data-label-idle');
    if (!label) label = on ? 'Sending…' : idleLabel;
    setText(buttonLabel || button, label);
  }

  function goToThankYou() {
    window.location.assign(THANK_YOU_PATH);
  }

  function fail(reason) {
    setSending(false);
    inFlight = false;
    setStatus(STATUS[reason] || STATUS.failed);
    if (fallback) fallback.removeAttribute('hidden');
    // A disabled button drops focus to <body>; put the person back where they were.
    if (button && (!document.activeElement || document.activeElement === document.body)) button.focus();
  }

  function succeed() {
    var left = false;
    function leave() {
      if (left) return;
      left = true;
      goToThankYou();
    }
    setTimeout(leave, NAV_FALLBACK_MS);
    try {
      if (window.DHAnalytics && typeof window.DHAnalytics.track === 'function') {
        window.DHAnalytics.track('submit_lead_form', { form_id: FORM_ID }, leave);
      } else {
        leave();
      }
    } catch (e) {
      leave();
    }
  }

  function showServerErrors(errors) {
    setSending(false);
    inFlight = false;
    FIELDS.forEach(function (spec) {
      state[spec.name].error = errors[spec.name] || '';
      state[spec.name].notice = '';
      renderField(spec);
    });
    setStatus(STATUS.fixFields);
    renderSummary(true);
  }

  function send(payload) {
    var settled = false;
    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timer;

    function done(fn) {
      return function (arg) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        window.removeEventListener('offline', onOffline);
        fn(arg);
      };
    }

    var onFail = done(fail);
    var onResult = done(function (res) {
      var outcome = classify(res.status, res.body);
      if (outcome.kind === 'success') succeed();
      else if (outcome.kind === 'fields') showServerErrors(outcome.errors);
      else fail(outcome.reason);
    });

    function onOffline() {
      if (controller) controller.abort();
      onFail('offlineSending');
    }

    timer = setTimeout(function () {
      if (controller) controller.abort();
      onFail('failed');
    }, TIMEOUT_MS);
    window.addEventListener('offline', onOffline);

    var init = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'same-origin',
      cache: 'no-store'
    };
    if (controller) init.signal = controller.signal;

    try {
      fetch(ENDPOINT, init).then(function (res) {
        return res.text().then(function (text) {
          return { status: res.status, body: parseJson(text) };
        }, function () {
          return { status: res.status, body: null };
        });
      }).then(onResult, function () { onFail('failed'); });
    } catch (e) {
      onFail('failed');
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    // inFlight is set below, synchronously, before the request starts; a second click or
    // Enter press arriving while it is true is dropped here.
    if (inFlight) return;
    submitAttempted = true;

    var firstBad = null;
    FIELDS.forEach(function (spec) {
      state[spec.name].notice = '';
      if (validateField(spec) && !firstBad) firstBad = spec;
    });
    if (firstBad) {
      setStatus('');
      renderSummary(true);
      return;
    }
    renderSummary(false);

    inFlight = true;
    var attribution = fillAttribution();
    var elapsed = Math.round(window.performance && performance.now ? performance.now() : MIN_ELAPSED_MS);

    // Bots get the same outcome as a person, and nothing is sent or counted (PRD §5.3).
    if ((honeypot && honeypot.value) || elapsed < MIN_ELAPSED_MS) {
      setSending(true);
      goToThankYou();
      return;
    }

    if (navigator.onLine === false) {
      inFlight = false;
      setStatus(STATUS.offline);
      if (fallback) fallback.removeAttribute('hidden');
      return;
    }

    var payload = {};
    FIELDS.forEach(function (spec) {
      payload[spec.name] = spec.el ? spec.el.value.trim() : '';
    });
    ATTRIBUTION_FIELDS.forEach(function (k) { payload[k] = attribution[k] || ''; });
    payload.website = '';
    payload.elapsed_ms = elapsed;

    setSending(true);
    setStatus(STATUS.sending);
    send(payload);
  }

  FIELDS.forEach(function (spec) {
    if (!spec.el) return;
    var s = state[spec.name];

    spec.el.addEventListener('paste', function (e) {
      try {
        var clip = e.clipboardData ? e.clipboardData.getData('text') : '';
        var el = spec.el;
        var selected = (el.selectionEnd || 0) - (el.selectionStart || 0);
        // maxlength truncates a paste silently; say so instead of hiding it.
        s.pastedOver = el.value.length - selected + clip.length > spec.max;
      } catch (err) {
        s.pastedOver = false;
      }
    });

    spec.el.addEventListener('input', function () {
      s.dirty = true;
      if (s.pastedOver) {
        s.pastedOver = false;
        s.notice = PASTE_NOTICE[spec.name];
        setStatus(s.notice);
      } else {
        s.notice = '';
      }
      // Errors already on screen update live, so they clear as soon as the field is fixed.
      if (s.error) {
        validateField(spec);
        renderSummary(false);
      } else {
        renderField(spec);
      }
    });

    spec.el.addEventListener('blur', function () {
      if (!s.dirty && !submitAttempted) return;
      validateField(spec);
      if (submitAttempted) renderSummary(false);
    });
  });

  // Hidden fields are filled on first focus and again at submit (PRD §6.3 item 5).
  form.addEventListener('focusin', function () {
    if (attributionFilled) return;
    attributionFilled = true;
    fillAttribution();
  });

  form.addEventListener('submit', onSubmit);
})();
