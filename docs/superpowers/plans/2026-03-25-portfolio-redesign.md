# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild douglashillres.llcdouglashill.com from a basic HTML resume into a multi-page Notion-inspired portfolio site.

**Architecture:** Static HTML/CSS/JS site using Tailwind CSS via CDN and Google Fonts (Newsreader + Inter). No build step. Each page shares a common nav/footer via copy-paste (no templating). CSS custom properties define the design token system. Hosted on S3 + CloudFront.

**Tech Stack:** HTML5, CSS3 (custom properties + Tailwind CDN), vanilla JS (Intersection Observer for scroll spy, hamburger menu toggle), Google Fonts, AWS CLI for deployment.

**Spec:** `docs/superpowers/specs/2026-03-25-portfolio-redesign-design.md`

---

## File Structure

```
html-portfolio/
├── index.html              # Homepage (create new — replace existing)
├── resume.html             # Resume page (create new)
├── projects.html           # Projects page (create new)
├── contact.html            # Contact page (create new)
├── css/
│   └── styles.css          # Design tokens + custom styles (create new)
├── js/
│   └── main.js             # Hamburger menu + scroll spy (create new)
├── assets/
│   ├── images/
│   │   └── (existing photos — use IMG_9852.jpg or IMG_9963.jpg as profile)
│   └── Douglas-Hill-Resume.pdf  # PDF resume (placeholder initially)
├── favicon.svg             # DH monogram favicon (create new)
├── og-image.html           # OG image template for screenshot (create new)
├── s3-current/             # Backup of old site (keep, don't deploy)
├── docs/                   # Specs and plans (don't deploy)
└── .superpowers/           # Brainstorm mockups (don't deploy)
```

**Key decisions:**
- `css/styles.css` holds all design tokens as CSS custom properties and component styles that Tailwind CDN alone can't handle (custom fonts, scroll spy highlighting, print styles)
- `js/main.js` is one small file: hamburger toggle + Intersection Observer scroll spy. No libraries.
- Old `s3-current/` files are kept locally as backup but excluded from deploy
- Each HTML page is self-contained with shared nav/footer markup copied in

---

### Task 1: Design Token System & Base CSS

**Files:**
- Create: `css/styles.css`

This is the foundation — every page depends on it.

- [ ] **Step 1: Create `css/styles.css` with CSS custom properties**

```css
/* css/styles.css — Design Token System */

/* === TOKENS === */
:root {
  /* Colors */
  --bg: #ffffff;
  --bg-warm: #fbfaf8;
  --bg-hover: #f5f3ef;
  --bg-accent: #fdf0f2;
  --text: #37352f;
  --text-secondary: #6b6a67;
  --text-light: #8a8985;
  --accent: #e94560;
  --accent-text: #c4324a;
  --accent-soft: #fce4e8;
  --border: rgba(55, 53, 47, 0.09);
  --border-hover: rgba(55, 53, 47, 0.16);
  --shadow-card: 0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04);

  /* Spacing */
  --max-w: 920px;
  --section-py: 60px;
  --section-px: 24px;

  /* Radius */
  --radius: 6px;
  --radius-card: 12px;
  --radius-photo: 16px;
}

/* === BASE === */
body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 15px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* === SKIP LINK === */
.skip-link {
  position: absolute;
  top: -100%;
  left: 16px;
  background: var(--text);
  color: white;
  padding: 8px 16px;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  z-index: 200;
  text-decoration: none;
}
.skip-link:focus {
  top: 8px;
}

/* === FOCUS RINGS === */
*:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* === SECTION LAYOUT === */
.section {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: var(--section-py) var(--section-px);
}

.divider {
  max-width: var(--max-w);
  margin: 0 auto;
  border: none;
  border-top: 1px solid var(--border);
}

/* === TYPOGRAPHY === */
.font-serif {
  font-family: 'Newsreader', Georgia, serif;
}

.hero-title {
  font-family: 'Newsreader', Georgia, serif;
  font-size: 48px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.5px;
  color: var(--text);
}
.hero-title em {
  font-style: italic;
  color: var(--accent);  /* large text — passes AA at 3.8:1 */
}

.cta-title {
  font-family: 'Newsreader', Georgia, serif;
  font-size: 40px;
  font-weight: 600;
  letter-spacing: -0.5px;
  color: var(--text);
}

.bio-text {
  font-size: 17px;
  line-height: 1.75;
  color: var(--text-secondary);
}

.positioning-text {
  font-family: 'Newsreader', Georgia, serif;
  font-size: 18px;
  line-height: 1.8;
  color: var(--text-secondary);
}

.label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-light);
}

.section-title {
  font-family: 'Newsreader', Georgia, serif;
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -0.3px;
  color: var(--text);
}

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 32px;
}

.section-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: var(--radius);
  transition: all 0.15s ease;
}
.section-link:hover {
  background: var(--bg-hover);
  color: var(--text);
}

/* === BUTTONS === */
.btn-dark {
  display: inline-block;
  background: var(--text);
  color: white;
  padding: 10px 20px;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: opacity 0.15s ease;
  border: none;
  cursor: pointer;
}
.btn-dark:hover { opacity: 0.8; }

.btn-outline {
  display: inline-block;
  color: var(--text);
  padding: 9px 20px;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  border: 1.5px solid var(--border-hover);
  background: transparent;
  transition: all 0.15s ease;
  cursor: pointer;
}
.btn-outline:hover {
  background: var(--bg-hover);
  border-color: rgba(55, 53, 47, 0.25);
}

/* === NAV === */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px var(--section-px);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}

.nav-logo {
  font-family: 'Newsreader', Georgia, serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 4px;
  align-items: center;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: var(--radius);
  transition: all 0.15s ease;
}
.nav-link:hover {
  background: var(--bg-hover);
  color: var(--text);
}
.nav-link--resume {
  font-weight: 600;
  color: var(--text);
}

.nav-cta {
  display: inline-block;
  background: var(--text);
  color: white;
  font-size: 13px;
  font-weight: 500;
  padding: 7px 16px;
  border-radius: var(--radius);
  text-decoration: none;
  transition: background 0.15s ease;
}
.nav-cta:hover { background: #4a4a44; }
.nav-cta:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Hamburger (mobile) — use aria-label="Toggle menu" in HTML */
.nav-hamburger {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}
.nav-hamburger span {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--text);
  margin: 4px 0;
  transition: all 0.2s ease;
}

/* Mobile overlay */
.nav-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  z-index: 99;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}
.nav-overlay.active { display: flex; }
.nav-overlay a {
  font-size: 20px;
  font-weight: 500;
  color: var(--text);
  text-decoration: none;
  padding: 12px 24px;
}

@media (max-width: 767px) {
  .nav-links { display: none; }
  .nav-hamburger { display: block; }
}

/* === FOOTER === */
.footer {
  max-width: var(--max-w);
  margin: 0 auto;
  border-top: 1px solid var(--border);
  padding: 24px var(--section-px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--text-light);
}
.footer-links {
  display: flex;
  gap: 16px;
}
.footer-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s ease;
}
.footer-links a:hover { color: var(--text); }

/* === TAGS === */
.tag {
  display: inline-block;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--bg-warm);
  color: var(--text-secondary);
}
.tag--core {
  background: var(--accent-soft);
  color: var(--accent-text);
}
.tag--impact {
  background: var(--accent-soft);
  color: var(--accent-text);
  font-weight: 600;
}

/* === CERT CALLOUT === */
.cert-callout {
  background: var(--bg-warm);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 24px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}
.cert-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
}
.cert-badge {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}
.cert-badge--aws { background: #fff3e0; color: #e65100; }
.cert-badge--azure { background: #e3f2fd; color: #1565c0; }
.cert-badge--pp { background: #f3e5f5; color: #7b1fa2; }

/* === REDUCED MOTION === */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}

/* === PRINT === */
@media print {
  .nav, .footer, .nav-overlay, .skip-link,
  .btn-dark, .btn-outline, .scroll-spy-nav {
    display: none !important;
  }
  body {
    font-size: 12pt;
    color: #000;
    background: white;
  }
  .section {
    padding: 20px 0;
    max-width: 100%;
  }
}
```

- [ ] **Step 2: Verify file was created correctly**

Run: `wc -l css/styles.css` from `/Users/wdhill2/fun/html-portfolio`
Expected: ~260 lines

- [ ] **Step 3: Commit**

```bash
cd /Users/wdhill2/fun/html-portfolio
git add css/styles.css
git commit -m "feat: add design token system and base CSS"
```

---

### Task 2: Favicon

**Files:**
- Create: `favicon.svg`

- [ ] **Step 1: Create SVG favicon with DH monogram**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#37352f"/>
  <text x="16" y="22" font-family="Georgia, serif" font-size="16" font-weight="700" fill="white" text-anchor="middle">DH</text>
</svg>
```

Write to: `/Users/wdhill2/fun/html-portfolio/favicon.svg`

- [ ] **Step 2: Generate PNG favicon sizes**

Use `sips` (macOS built-in) to convert SVG to PNGs, or create them manually. At minimum, create a simple 32x32 and 180x180 PNG. If `sips` can't convert SVG, create a minimal HTML page, screenshot it, and crop.

For now, the SVG favicon is sufficient for modern browsers. Add these `<link>` tags to every page's `<head>`:
```html
<link rel="icon" type="image/svg+xml" href="favicon.svg">
<link rel="apple-touch-icon" href="favicon.svg">
```

Post-launch optimization: generate proper PNG favicons at 16, 32, and 180px.

- [ ] **Step 3: Commit**

```bash
cd /Users/wdhill2/fun/html-portfolio
git add favicon.svg
git commit -m "feat: add DH monogram favicon"
```

---

### Task 3: JavaScript — Hamburger Menu & Scroll Spy

**Files:**
- Create: `js/main.js`

- [ ] **Step 1: Create `js/main.js`**

```javascript
// js/main.js — Hamburger menu toggle + Intersection Observer scroll spy

(function () {
  'use strict';

  // === HAMBURGER MENU ===
  const hamburger = document.querySelector('.nav-hamburger');
  const overlay = document.querySelector('.nav-overlay');

  if (hamburger && overlay) {
    hamburger.addEventListener('click', function () {
      const isOpen = overlay.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close overlay when a link is clicked
    overlay.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        overlay.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // === SCROLL SPY (for resume page) ===
  const spyLinks = document.querySelectorAll('.scroll-spy-link');
  const spySections = document.querySelectorAll('.scroll-spy-section');

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
})();
```

- [ ] **Step 2: Commit**

```bash
cd /Users/wdhill2/fun/html-portfolio
git add js/main.js
git commit -m "feat: add hamburger menu and scroll spy JS"
```

---

### Task 4: Homepage — Full Page Build

**Files:**
- Create (replace existing): `index.html`

This is the largest task. Build the full homepage per spec sections 1-6.

- [ ] **Step 1: Create `index.html`**

The full HTML file includes:
- `<!DOCTYPE html>` with lang, meta charset, viewport, title, OG meta tags
- Google Fonts preconnect + stylesheet links **with `&display=swap` parameter**
- Tailwind CDN script
- Link to `css/styles.css`
- Favicon link (`<link rel="icon" type="image/svg+xml" href="favicon.svg">`)
- Skip-to-main-content link (`<a href="#main" class="skip-link">Skip to main content</a>`)
- `<nav aria-label="Main navigation">` — sticky nav with logo, links (Projects, Resume, Get in touch), hamburger button (`aria-label="Toggle menu"`, `aria-expanded="false"`)
- Mobile nav overlay
- `<main id="main">`
  - **Hero section:** split layout (text left, photo right using `assets/images/IMG_9852.jpg`), wave emoji, h1 with italic crimson accent, bio, "Currently at APS" line, two CTAs
  - **Positioning statement:** Newsreader serif paragraph
  - `<hr class="divider">`
  - **Projects section:** section header with "View all →" link, 4 project rows with SVG icons, titles, descriptions, tags, impact badges, hover chevrons
  - `<hr class="divider">`
  - **Skills section:** 4 domain groups (Cloud, Power Platform, Enterprise, Architecture), core/familiar tags
  - **Certifications callout:** 3 certs with colored badges
  - `<hr class="divider">`
  - **Contact CTA:** centered h2, copy, location line, two buttons
- `<footer>` — copyright + links
- Script tag for `js/main.js`

Key implementation notes:
- Use Tailwind utility classes for layout (flex, grid, padding, margin, responsive)
- Use `css/styles.css` custom classes for design token colors and component styles
- Hero photo: use `<img src="assets/images/IMG_9852.jpg" alt="Douglas Hill — IT Solutions Engineer" width="220" height="270" style="border-radius: var(--radius-photo); box-shadow: var(--shadow-card); border: 1px solid var(--border); object-fit: cover;">`. Add `loading="lazy"` to below-fold images only (hero photo is above fold, so no lazy).

Google Fonts link must include `display=swap`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```
- Project row SVG icons: inline simple monochrome SVGs (lightning bolt, layers, cloud, users)
- Mobile: hero stacks vertically (`flex-col` below 768px, `flex-row` at `md:`)
- Project arrows: `opacity-0 md:group-hover:opacity-100` pattern
- All links use actual `href="#projects"`, `href="resume.html"`, etc.

- [ ] **Step 2: Open in browser and verify visually**

Run: `open /Users/wdhill2/fun/html-portfolio/index.html`

Check:
- Nav sticks to top on scroll
- Hero shows photo on right, text on left (desktop)
- Projects render as rows with hover highlight
- Skills show core (pink) vs familiar (gray) tags
- Certs show in warm callout card
- Contact CTA centered at bottom
- Footer renders at bottom
- Resize to mobile width — hero stacks, hamburger appears

- [ ] **Step 3: Commit**

```bash
cd /Users/wdhill2/fun/html-portfolio
git add index.html
git commit -m "feat: build homepage with hero, projects, skills, and CTA sections"
```

---

### Task 5: Resume Page

**Dependencies:** Tasks 1-3 must be complete. This task modifies `css/styles.css` — run sequentially with Task 6.

**Files:**
- Create: `resume.html`
- Modify: `css/styles.css` (append scroll spy styles)

- [ ] **Step 1: Create `resume.html`**

Structure:
- Same `<head>` boilerplate as index.html (fonts, Tailwind, styles.css, meta, favicon)
- Same `<nav>` and mobile overlay (with Resume link marked active: `nav-link--resume`)
- Skip link
- `<main id="main">`
  - **Resume header:** name (h1, serif, 40px), title, location/email/LinkedIn/GitHub as small text, "Download PDF" dark button + "Print" outline button
  - **Scroll spy sidebar nav** (desktop: fixed left sidebar within a flex layout, mobile: horizontal scroll strip at top):
    - Links: Summary, Experience, Skills, Education, Certifications
    - Each link has class `scroll-spy-link`, href to `#section-id`
    - Active state: `scroll-spy-link--active` class (set by JS)
  - **Content area** (right side on desktop, full width on mobile):
    - `<section id="summary" class="scroll-spy-section">` — 3-4 sentence summary, 3 bullet differentiators
    - `<section id="experience" class="scroll-spy-section">` — Arizona Public Service role with company, title, dates, location, description, 5 quantified achievement bullets (per spec's 3-5 range), tech tags. Structure should accommodate multiple roles.
    - `<section id="skills" class="scroll-spy-section">` — same grouped badge layout as homepage
    - `<section id="education" class="scroll-spy-section">` — MBA Finance + BS IT entries
    - `<section id="certifications" class="scroll-spy-section">` — same cert callout as homepage
- Same `<footer>`
- `js/main.js` script tag

Add scroll spy CSS to `css/styles.css`:
```css
/* === SCROLL SPY NAV === */
.scroll-spy-nav {
  position: sticky;
  top: 80px;
  align-self: flex-start;
}
.scroll-spy-link {
  display: block;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-light);
  text-decoration: none;
  border-left: 2px solid transparent;
  transition: all 0.15s ease;
}
.scroll-spy-link:hover {
  color: var(--text-secondary);
}
.scroll-spy-link--active {
  color: var(--text);
  border-left-color: var(--accent);
  font-weight: 600;
}

@media (max-width: 767px) {
  .scroll-spy-nav {
    position: sticky;
    top: 49px;
    display: flex;
    overflow-x: auto;
    gap: 0;
    background: white;
    border-bottom: 1px solid var(--border);
    padding: 0 var(--section-px);
    z-index: 50;
  }
  .scroll-spy-link {
    border-left: none;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
    padding: 12px 16px;
  }
  .scroll-spy-link--active {
    border-bottom-color: var(--accent);
    border-left-color: transparent;
  }
}
```

- [ ] **Step 2: Open in browser, test scroll spy**

Run: `open /Users/wdhill2/fun/html-portfolio/resume.html`

Check:
- Resume header visible with Download PDF and Print buttons
- Scroll through sections — sidebar nav highlights current section
- Resize to mobile — nav becomes horizontal scroll strip
- "Download PDF" links to `assets/Douglas-Hill-Resume.pdf` (will 404 for now — expected)

- [ ] **Step 3: Commit**

```bash
cd /Users/wdhill2/fun/html-portfolio
git add resume.html css/styles.css
git commit -m "feat: build resume page with scroll spy navigation"
```

---

### Task 6: Projects Page

**Dependencies:** Tasks 1-3 must be complete. Task 5 must complete first (both modify `css/styles.css` and `js/main.js`).

**Files:**
- Create: `projects.html`
- Modify: `css/styles.css` (append project card and filter styles)
- Modify: `js/main.js` (append filter JS inside IIFE, before the closing `})();`)

- [ ] **Step 1: Create `projects.html`**

Structure:
- Same `<head>` and `<nav>` boilerplate (with Projects link visually active)
- `<main id="main">`
  - Page title: "Projects" (h1, Newsreader serif)
  - Subtitle: brief intro line
  - **Filter bar:** row of tag buttons — "All" (active by default), "AWS", "Azure", "Power Platform", "SharePoint", "DevOps"
    - Each button: `<button class="filter-btn" data-filter="all">All</button>`
    - Active state via JS toggle class
  - **Project cards grid:** 2-column on desktop (`md:grid-cols-2`), 1-column on mobile
    - Each card: `<article class="project-card" data-tags="power-platform dynamics-365 azure">`
      - Visual placeholder div (200px height, warm background)
      - Title (h2, 18px, semibold)
      - Description (2-3 sentences)
      - Tags row
      - Impact badge
      - "Read more →" link (styled as `section-link`)
    - Cards: CRM Platform, Travel Approval, Cloud Migration, Employee Onboarding, Architecture Practice
  - Filter JS (inline or append to main.js): click filter button → show/hide cards based on `data-tags`

Add to `css/styles.css`:
```css
/* === PROJECT CARDS === */
.project-card {
  background: var(--bg-warm);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  overflow: hidden;
  transition: border-color 0.15s ease;
}
.project-card:hover {
  border-color: var(--border-hover);
}

/* === FILTER BUTTONS === */
.filter-btn {
  padding: 6px 16px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}
.filter-btn:hover {
  background: var(--bg-hover);
  color: var(--text);
}
.filter-btn--active {
  background: var(--text);
  color: white;
  border-color: var(--text);
}
```

- [ ] **Step 2: Add filter JS to `js/main.js`**

Append to the IIFE in main.js:
```javascript
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
```

- [ ] **Step 3: Verify filter works in browser**

Run: `open /Users/wdhill2/fun/html-portfolio/projects.html`

Check:
- All cards visible by default
- Click "Power Platform" — only relevant cards show
- Click "All" — all cards return
- 2-column grid on desktop, 1-column on mobile

- [ ] **Step 4: Commit**

```bash
cd /Users/wdhill2/fun/html-portfolio
git add projects.html js/main.js css/styles.css
git commit -m "feat: build projects page with tag-based filtering"
```

---

### Task 7: Contact Page

**Files:**
- Create: `contact.html`

- [ ] **Step 1: Create `contact.html`**

Structure:
- Same `<head>` and `<nav>` boilerplate
- `<main id="main">`
  - Page title: "Get in touch" (h1, Newsreader serif)
  - Paragraph: "I'm always happy to hear about new opportunities, projects, or ideas."
  - Contact methods list (styled as clean rows with icons):
    - Email: `<a href="mailto:...">` with visible email address (use a placeholder email for now)
    - LinkedIn: profile link
    - GitHub: profile link
  - Location line: "Phoenix, AZ · Open to remote opportunities" in `--text-light`
- Same `<footer>`

This is a simple page — no additional CSS or JS needed beyond existing styles.

- [ ] **Step 2: Verify in browser**

Run: `open /Users/wdhill2/fun/html-portfolio/contact.html`

Check:
- Clean layout, editorial feel
- Links are clickable
- Responsive — looks good at mobile width

- [ ] **Step 3: Commit**

```bash
cd /Users/wdhill2/fun/html-portfolio
git add contact.html
git commit -m "feat: build contact page with email, LinkedIn, and GitHub links"
```

---

### Task 8: Placeholder PDF & OG Image

**Files:**
- Create: `assets/Douglas-Hill-Resume.pdf` (placeholder)
- Create: `og-image.html` (template for screenshot)

**Dependencies:** Must run after Task 4 (homepage) is built.

- [ ] **Step 1: Create a placeholder resume PDF**

Create a simple one-page PDF so the download link doesn't 404. Use the browser's print-to-PDF from the resume page once Task 5 is complete. For now, create a minimal placeholder:

Run: `echo "Douglas Hill - Resume - See douglashillres.llcdouglashill.com/resume.html" | cupsfilter -m application/pdf > /Users/wdhill2/fun/html-portfolio/assets/Douglas-Hill-Resume.pdf 2>/dev/null || echo "PDF placeholder needed - create manually"`

If that fails, just create a note that the PDF needs to be generated from the resume page via Print → Save as PDF.

- [ ] **Step 2: Create OG image template**

Create `og-image.html` — a 1200x630px fixed-size HTML page with the warm white background, "Douglas Hill" in Newsreader serif, "IT Solutions Engineer & Cloud Architect" subtitle, and crimson accent. This can be screenshotted to create the OG image PNG.

- [ ] **Step 3: Screenshot OG image to PNG**

Open `og-image.html` in browser, take a 1200x630 screenshot, save as `assets/og-image.png`.

On macOS: `open /Users/wdhill2/fun/html-portfolio/og-image.html` then use Cmd+Shift+4 or a tool like `pageres-cli` if available.

- [ ] **Step 4: Commit**

```bash
cd /Users/wdhill2/fun/html-portfolio
git add assets/Douglas-Hill-Resume.pdf assets/og-image.png og-image.html
git commit -m "feat: add OG image and placeholder resume PDF"
```

---

### Task 9: Meta Tags

**Files:**
- Modify: `index.html` (add OG meta if not already present)
- Modify: `resume.html`, `projects.html`, `contact.html` (add page-specific OG meta)

- [ ] **Step 1: Verify all pages have proper `<head>` meta tags**

Each page should have in `<head>`:
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="Douglas Hill — IT Solutions Engineer & Cloud Architect specializing in AWS, Azure, and Power Platform.">
<meta property="og:title" content="Douglas Hill — IT Solutions Engineer & Cloud Architect">
<meta property="og:description" content="Building enterprise cloud infrastructure and platform solutions.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://douglashillres.llcdouglashill.com">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="favicon.svg">
<title>Douglas Hill — IT Solutions Engineer & Cloud Architect</title>
```

Page-specific titles:
- Resume: "Resume — Douglas Hill"
- Projects: "Projects — Douglas Hill"
- Contact: "Contact — Douglas Hill"

- [ ] **Step 2: Review all pages have consistent meta**

Open each file and verify the `<head>` section is complete.

- [ ] **Step 3: Commit if any changes were needed**

```bash
cd /Users/wdhill2/fun/html-portfolio
git add index.html resume.html projects.html contact.html
git commit -m "feat: add meta tags and OG properties to all pages"
```

---

### Task 10: Cross-Page QA & Cleanup

**Files:**
- Potentially modify: all HTML files, `css/styles.css`

- [ ] **Step 1: Verify navigation links work across all pages**

Open each page and click every nav link. Ensure:
- index.html → links to `projects.html`, `resume.html`, `contact.html`
- All pages link back to `index.html` via the logo
- "See my work" on homepage links to `#projects` section or `projects.html`
- "Download resume" links to `assets/Douglas-Hill-Resume.pdf`
- "View all →" on homepage projects links to `projects.html`

- [ ] **Step 2: Verify mobile responsiveness on all pages**

Resize browser to ~375px width for each page. Check:
- Hamburger menu appears and works
- Hero stacks vertically on homepage
- Project rows are readable
- Resume scroll spy becomes horizontal strip
- Projects page is single column
- No horizontal overflow on any page

- [ ] **Step 3: Verify accessibility basics**

- Tab through each page — all interactive elements reachable
- Skip link appears on focus and jumps to `#main`
- Heading hierarchy: one h1 per page, h2 for sections, h3 for items
- All images have alt text
- Nav has `<nav>` landmark, content has `<main>` landmark

- [ ] **Step 4: Commit any fixes**

```bash
cd /Users/wdhill2/fun/html-portfolio
git add -A
git commit -m "fix: cross-page QA — navigation, responsiveness, and accessibility"
```

---

### Task 11: Deploy to S3

**Files:**
- No file changes — deployment only

- [ ] **Step 1: Verify AWS CLI is authenticated**

Run: `aws sts get-caller-identity`
Expected: JSON with account info

- [ ] **Step 2: Sync site files to S3 bucket**

```bash
cd /Users/wdhill2/fun/html-portfolio
aws s3 sync . s3://douglashillres.llcdouglashill.com \
  --exclude ".git/*" \
  --exclude ".superpowers/*" \
  --exclude "docs/*" \
  --exclude "s3-current/*" \
  --exclude "node_modules/*" \
  --exclude "*.md" \
  --exclude "og-image.html" \
  --exclude "goal.png" \
  --exclude "public/*" \
  --exclude "solution.html" \
  --delete
```

The `--delete` flag removes old files (error.html, main.css) that are no longer needed. The old site is backed up in `s3-current/`.

- [ ] **Step 3: Verify deployment**

Run: `aws s3 ls s3://douglashillres.llcdouglashill.com/`

Expected: `index.html`, `resume.html`, `projects.html`, `contact.html`, `css/styles.css`, `js/main.js`, `favicon.svg`, `assets/` directory

- [ ] **Step 4: Test live site**

Open: `https://douglashillres.llcdouglashill.com` (or the CloudFront URL)

Verify homepage loads with new design.

- [ ] **Step 5: Invalidate CloudFront cache (if CloudFront is configured)**

```bash
# Find the CloudFront distribution ID
aws cloudfront list-distributions --query "DistributionList.Items[].{Id:Id,Domain:DomainName}" --output table

# Invalidate all paths
aws cloudfront create-invalidation --distribution-id <DIST_ID> --paths "/*"
```

- [ ] **Step 6: Commit deployment record**

No files to commit — this is a deploy step. Optionally tag:
```bash
git tag v2.0-redesign
```

---

## Task Dependencies

```
Task 1 (CSS) ─────┐
Task 2 (Favicon)   ├──→ Task 4 (Homepage) ──→ Task 8 (PDF + OG) ──→ Task 9 (Meta)
Task 3 (JS) ──────┘         │
                             ├──→ Task 5 (Resume) ──→ Task 6 (Projects) ──→ Task 7 (Contact)
                             │                                                      │
                             └──────────────────────────────────────────────────────┘
                                                                                    │
                                                                    Task 10 (QA) ──→ Task 11 (Deploy)
```

Tasks 1, 2, 3 can run in parallel. Tasks 5→6 must be sequential (shared CSS/JS files). All pages must complete before QA (Task 10).

## Summary

| Task | Description | Est. Steps | Dependencies |
|------|-------------|------------|--------------|
| 1 | Design tokens & base CSS | 3 | None |
| 2 | Favicon | 3 | None |
| 3 | JavaScript (hamburger + scroll spy) | 2 | None |
| 4 | Homepage (full build) | 3 | 1, 2, 3 |
| 5 | Resume page | 3 | 1, 3 |
| 6 | Projects page | 4 | 5 (shared files) |
| 7 | Contact page | 3 | 1, 3 |
| 8 | Placeholder PDF & OG image | 4 | 4 |
| 9 | Meta tags | 3 | 8 |
| 10 | Cross-page QA | 4 | 4-9 |
| 11 | Deploy to S3 | 6 | 10 |

**Total: 11 tasks, 38 steps**

Writing page (blog.html) is deferred per spec — only build when 3+ posts exist.

**Implementation note:** Use the `frontend-design` skill when building Tasks 4-7 (the HTML pages) for high-quality, production-grade output.
