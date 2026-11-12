# Markup contract for the Phase 1 pages

One definition shared by everyone building `lp/process-automation/index.html`, the three JavaScript files, the stylesheets, and the other three pages. It fills the gap `docs/PRD.md` leaves on element IDs, attributes, and file loading. Where this file and the PRD disagree, the PRD wins on behavior and this file wins on names. A change here changes every file that uses the name.

## File ownership (no file has two owners)

| Owner | Files |
|---|---|
| A | `css/lp.css`, `lp/process-automation/index.html` |
| B | `js/attribution.js`, `js/analytics.js`, `js/lead-form.js`, `marketing-launch/tracking.md` |
| C | `scripts/check.sh`, `scripts/deploy.sh`, `infra/cloudfront/*` |
| D | `thank-you/index.html`, `privacy/index.html`, `terms/index.html`, `css/legal.css`, `sitemap.xml` |
| E | `scripts/mock-lead-api.py`, `infra/lead-api/*` |

Nobody edits `css/styles.css`, `js/main.js`, or any existing page.

## Paths and loading

- All asset paths are root-absolute: `/css/styles.css`, `/css/lp.css`, `/js/attribution.js`.
- Every new page loads `/css/styles.css` first, then its own stylesheet (`/css/lp.css` for the landing page, `/css/legal.css` for thank-you, privacy, and terms).
- No inline `<script>`, no inline `<style>`, no `style=""` attributes, no inline event handlers. The landing page runs under a strict Content Security Policy.
- Scripts load at the end of `<head>` with `defer`, in this order:
  1. `/js/attribution.js` on all four pages
  2. `/js/analytics.js` on all four pages
  3. `/js/lead-form.js` on the landing page only
- Do not load `/js/main.js` on the new pages unless a page needs something from it; if it does, say which function and why in a comment.
- Clean URLs: `/lp/process-automation`, `/thank-you`, `/privacy`, `/terms`. Internal links use these forms, no trailing slash, no `.html`.
- Local preview: `python3 scripts/mock-lead-api.py` serves the repo root on `http://localhost:8787`, applies the same clean-URL rewrite as the CloudFront Function, and implements `POST /api/lead`.

## Globals the scripts expose

Each script attaches one object to `window` and nothing else.

- `window.DHAttribution` (from `attribution.js`)
  - `get()` returns an object with string values for `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `gclid`, `landing_path`. Missing values are empty strings. Values are already sanitized to the allowed character set and length in PRD §5.1.
  - On load it captures values from the URL, stores them as the PRD specifies, fills any hidden inputs with matching `name` attributes inside `#lead-form`, and adds the values as query parameters to every `a[data-book-call]` link.
- `window.DHAnalytics` (from `analytics.js`)
  - `track(eventName, params)` sends a GA4 event with the attribution values merged in. It never throws and does nothing if analytics is disabled, blocked, or not configured.
  - On load it binds a click listener to every `a[data-book-call]` that calls `track("book_call", { link_location: <value of data-book-call> })`.
- `lead-form.js` calls `DHAnalytics.track("submit_lead_form", { ... })` only after the server answers `200` with `{"ok": true}` for a real submission. It must work if `DHAnalytics` or `DHAttribution` is missing.

The GA4 measurement ID lives in exactly one place: a constant at the top of `js/analytics.js`, with the value `__REQUIRED_INPUT:GA4_MEASUREMENT_ID__` until Douglas supplies it. While the value starts with `__REQUIRED_INPUT`, analytics does not load and `track` does nothing.

## Booking links

- Every link to the booking page is `<a data-book-call="<location>" href="https://calendly.com/douglashill-llcdouglashill/30min" target="_blank" rel="noopener noreferrer">`.
- `<location>` is one of: `hero`, `offer`, `cta`, `form-fallback`, `noscript`, `thank-you`.
- Link text states that it opens in a new tab, in visible text or a visually hidden span.

## Lead form

```
<form id="lead-form" class="lead-form" method="post" action="/api/lead" novalidate hidden>
```

`lead-form.js` removes `hidden` on load. A `<noscript>` block next to the form holds the booking link (`data-book-call="noscript"`) and the email address.

| Purpose | Element | `id` | `name` | Notes |
|---|---|---|---|---|
| Error summary | `<div role="alert" tabindex="-1" hidden>` | `lead-errors` | — | Placed above the first field. Holds a heading and a list of links to the failing fields. Receives focus when shown. |
| Name | `<input type="text">` | `lead-name` | `name` | |
| Work email | `<input type="email">` | `lead-email` | `email` | |
| Company | `<input type="text">` | `lead-company` | `company` | |
| Process | `<textarea>` | `lead-process` | `process` | Hint element `id="lead-process-hint"` |
| Per-field error | `<p class="field-error" hidden>` | `<field id>-error`, for example `lead-email-error` | — | Empty in the markup. The script writes the message with `textContent`, removes `hidden`, sets `aria-invalid="true"` on the field, and adds the error id to the field's `aria-describedby`. |
| Honeypot wrapper | `<div class="hp-field" aria-hidden="true">` | — | — | Hidden by CSS in `lp.css`, not by `hidden` or `display` attributes in the markup |
| Honeypot | `<input type="text" tabindex="-1" autocomplete="off">` | `lead-website` | `website` | |
| Hidden attribution | `<input type="hidden">` | — | `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `gclid`, `landing_path` | Empty in the markup |
| Submit | `<button type="submit">` | `lead-submit` | — | Label text sits in `<span class="btn-label">`. The script sets `disabled` and `aria-busy="true"` while sending and swaps the label through `data-label-idle` and `data-label-busy` attributes on the button. |
| Status | `<div role="status" aria-live="polite">` | `lead-status` | — | Sending, offline, and failure messages. Empty in the markup. |
| Failure fallback | `<div hidden>` | `lead-fallback` | — | Shown by the script after a server or network failure. Contains the booking link (`data-book-call="form-fallback"`) and the email address. Static content; the script only toggles `hidden`. |

Field wrapper: each visible field sits in `<div class="field">` containing the `<label for>`, any hint, the control, and the error element, in that order.

State classes the script may set, and `lp.css` styles: `.is-invalid` on a `.field`, `.is-sending` on the form. Nothing else.

On success the script navigates to `/thank-you` with `window.location.assign("/thank-you")`. The path is a constant; it is never read from the URL, the server response, or storage.

## Page skeleton (all four pages)

- `<html lang="en">`, one `<h1>`, a skip link as the first focusable element pointing to `#main`, and `<main id="main">`.
- `<link rel="canonical">` is the absolute clean URL on `https://william.llcdouglashill.com`.
- Robots meta per PRD §8.10.
- Footer on every new page links to `/privacy` and `/terms`.
- The landing page has no site navigation. Its header shows the business name as plain text or a link to `/`, and nothing else.

## Placeholders

Any value only Douglas can supply is written as `__REQUIRED_INPUT:<NAME>__`. `scripts/check.sh` fails if one remains in a file that would be deployed. Names in use: `GA4_MEASUREMENT_ID`, `LEGAL_REVIEW`, `RETENTION_PERIOD`, `GOVERNING_LAW`, `CONTACT_EMAIL` only if the repo does not already show one.
