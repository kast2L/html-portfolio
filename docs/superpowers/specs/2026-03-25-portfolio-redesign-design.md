# Douglas Hill Portfolio — Redesign Spec

## Overview

Redesign of douglashillres.llcdouglashill.com from a basic HTML resume into a multi-page professional portfolio. Hosted as static files on AWS S3 + CloudFront.

**Goals:** Job hunting, personal brand, project showcase.
**Target audience:** Recruiters, hiring managers, and peers in the enterprise IT / cloud architecture space.

## Design Direction

**Notion-inspired editorial design.** Light, content-first, generous whitespace, serif+sans typography pairing. The design says "senior professional who solves business problems" — not "developer with cool animations."

The crimson accent (#d63a54 for text, #e94560 for decorative elements) carries through as the signature brand color within the calm editorial layout.

## Tech Stack

- **HTML/CSS/JS** — no framework, no build step
- **Tailwind CSS via CDN** — utility-first styling (consider purge/JIT build later for performance)
- **Google Fonts** — Newsreader (serif headings) + Inter (sans body), with `font-display: swap`
- **Static hosting** — AWS S3 bucket `douglashillres.llcdouglashill.com` + CloudFront CDN
- **Contact** — mailto link + LinkedIn (no form, no Formspree dependency)

## Design Tokens

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#ffffff` | Page background |
| `--bg-warm` | `#fbfaf8` | Card/section backgrounds |
| `--bg-hover` | `#f5f3ef` | Hover states |
| `--bg-accent` | `#fdf0f2` | Accent backgrounds |
| `--text` | `#37352f` | Primary text |
| `--text-secondary` | `#6b6a67` | Secondary text (WCAG AA compliant) |
| `--text-light` | `#8a8985` | Tertiary/hint text (large text only) |
| `--accent` | `#e94560` | Decorative only: large headings (18.66px bold / 24px+ regular), fills, borders. **Never use on text smaller than 18.66px bold.** |
| `--accent-text` | `#c4324a` | Body-size accent text (WCAG AA compliant on white and `--bg-warm`) |
| `--accent-soft` | `#fce4e8` | Accent tag backgrounds |
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)` | Card/photo shadow |
| `--border` | `rgba(55,53,47,0.09)` | Default borders |
| `--border-hover` | `rgba(55,53,47,0.16)` | Hover/active borders |

### Approved Color Pairings

| Foreground | Background | Ratio | Status |
|------------|------------|-------|--------|
| `--text` on `--bg` | #37352f on #ffffff | 12.8:1 | PASS |
| `--text` on `--bg-warm` | #37352f on #fbfaf8 | 11.9:1 | PASS |
| `--text-secondary` on `--bg` | #6b6a67 on #ffffff | 4.6:1 | PASS |
| `--text-secondary` on `--bg-warm` | #6b6a67 on #fbfaf8 | 4.5:1 | PASS |
| `--accent-text` on `--bg` | #c4324a on #ffffff | 5.2:1 | PASS |
| `--accent-text` on `--bg-warm` | #c4324a on #fbfaf8 | 5.0:1 | PASS |
| `--accent-text` on `--accent-soft` | #c4324a on #fce4e8 | 4.5:1 | PASS |
| `--accent` on `--bg` (large text only) | #e94560 on #ffffff | 3.8:1 | PASS (large) |
| white on `--text` (buttons) | #ffffff on #37352f | 12.8:1 | PASS |

### Typography

| Element | Font | Size | Weight | Notes |
|---------|------|------|--------|-------|
| Hero h1 | Newsreader | 48px | 600 | letter-spacing: -0.5px |
| Section titles | Newsreader | 32px | 600 | letter-spacing: -0.3px |
| CTA heading | Newsreader | 40px | 600 | |
| Positioning text | Newsreader | 18px | 400 | line-height: 1.8 |
| Nav logo | Newsreader | 18px | 600 | Full name "Douglas Hill" |
| Body text | Inter | 15px | 400 | line-height: 1.6 |
| Bio text | Inter | 17px | 400 | line-height: 1.75 |
| Nav links | Inter | 14px | 500 | |
| Tags | Inter | 12px | 500 | Consistent across all pages |
| Labels | Inter | 12px | 600 | uppercase, letter-spacing: 1.5px |

Newsreader is restricted to headings and featured text (18px+ minimum). Inter handles everything else.

Tags use 12px universally (project row tags and skill section tags alike).

### Responsive Breakpoints

| Breakpoint | Width | Changes |
|------------|-------|---------|
| Mobile | < 768px | Nav collapses to hamburger menu. Hero stacks vertically (text above photo). Project row arrows always visible. Resume section nav becomes horizontal scroll strip. |
| Desktop | ≥ 768px | Side-by-side hero layout. Hover-only project arrows. Resume section nav as left sidebar. |

### Spacing & Layout

- Max content width: 920px, centered
- Section padding: 60px vertical
- Border radius: 6px (default), 12px (callout cards), 16px (photo)
- Card shadows: use `--shadow-card` token

## Site Structure

### Pages

| Page | File | Priority | Status |
|------|------|----------|--------|
| Home | `index.html` | P0 — build first | Design complete |
| Resume | `resume.html` | P0 — build second | Needs design |
| Projects | `projects.html` | P1 | Needs design |
| Contact | `contact.html` | P2 | Design below |
| Writing | `blog.html` | P3 — only when 3+ posts exist | Deferred |

### Shared Components

**Navigation (sticky):**
- Left: "Douglas Hill" serif logo
- Right: Projects, Resume (semibold), "Get in touch" (dark pill button)
- "Writing" link added to nav only when blog has 3+ posts
- Mobile: hamburger menu with full-screen overlay
- Background: white at 85% opacity + 12px blur

**Footer:**
- Left: © 2026 Douglas Hill
- Right: LinkedIn, GitHub, Email links
- Separated by top border

## Homepage — Section-by-Section

### 1. Hero (above the fold)

Split layout: text left, photo right.

**Left side:**
- 👋 wave emoji (only emoji on the page)
- h1: "I build *enterprise cloud* solutions that scale." — "enterprise cloud" in italic crimson
- Bio paragraph (1-2 sentences)
- "Currently at **Arizona Public Service** · Phoenix, AZ" credibility line
- Two CTAs: "See my work" (dark filled button) + "Download resume ↓" (outlined button)

**Right side:**
- Rounded photo (220×270px) with soft shadow
- 1px border, 16px radius

### 2. Positioning Statement

Full-width text block between hero and projects. Newsreader serif, 18px. 2-3 sentences summarizing professional identity, expertise domains, and impact scope. This is the "what I do at a glance" for fast-scanning recruiters.

### 3. Projects (Notion database-row style)

List of project rows, each containing:
- **Icon:** Monochrome SVG (not emoji) in a 44×44px rounded container
- **Title:** 15px semibold
- **Description:** One line, 14px secondary text
- **Tags:** Gray chips for technologies used
- **Impact badge:** Crimson soft background, e.g. "1M+ customers served"
- **Arrow:** Chevron (›), visible on hover only (desktop), always visible (mobile)

Hover: entire row highlights with warm background.

"View all →" link in section header leads to full projects page.

### 4. Skills & Tools

Grouped by domain (Cloud, Power Platform, Enterprise, Architecture) with uppercase small labels.

Two tiers:
- **Core skills:** Crimson soft background tags (`--accent-soft` bg, `--accent-text` text)
- **Familiar skills:** Neutral tags (`--bg-warm` bg, `--text-secondary` text, border)

No percentage bars. No progress indicators.

### 5. Certifications Callout

Warm background card with 1px border. Inline list of certifications:
- AWS Solutions Architect Associate
- Azure Fundamentals
- Power Platform Fundamentals

Each with a small colored badge (orange for AWS, blue for Azure, purple for PP).

### 6. Contact CTA

Centered section:
- h2: "Let's work together." (Newsreader serif)
- One line of copy
- "Phoenix, AZ · Open to remote opportunities" location line
- Two buttons: "Send me an email" (dark) + "LinkedIn →" (outlined)

## Resume Page

Web-native single-scroll document (not just a PDF download).

**Layout:**
- Resume header: name, title, location, email, LinkedIn, GitHub
- Prominent "Download PDF" primary button + "Print" secondary button — visible in first viewport
- Sticky section nav (scroll spy): Summary | Experience | Skills | Education | Certifications
- Desktop: section nav as left sidebar; Mobile: horizontal scroll strip

**Sections:**
- **Summary:** 3-4 sentences, key differentiators as 3-item bulleted list
- **Experience:** Per role — company, title, dates, location, 1-2 sentence description, 3-5 quantified achievements, tech tags
- **Technical Skills:** Same grouped badge layout as homepage, with Primary/Familiar tiers
- **Education:** MBA Finance, BS IT — simple entries with institution and dates
- **Certifications:** Same callout card style as homepage

Scroll spy uses Intersection Observer — no external library needed.

**PDF asset:** Manually maintained at `/assets/Douglas-Hill-Resume.pdf`. Must be kept in sync with web-native content.

**Print stylesheet (`@media print`):** Hide nav, footer, section nav, and action buttons. Content flows as a clean single-column document.

## Projects Page

Expanded view of all projects. Uses card layout (not rows — cards work better at higher density).

**Layout:**
- Page title: "Projects" (Newsreader serif)
- Filter bar: tag-based filtering by technology (e.g. "AWS", "Power Platform") — all / category toggles
- Project cards in a 2-column grid (desktop), 1-column (mobile)
- Each card: screenshot/visual placeholder, title, 2-3 sentence description, tech tags, impact metric, "Read more →" link
- Individual project detail pages are out of scope for v1 — cards link to external resources or expand inline

## Contact Page

Simple, clean, editorial layout. No contact form.

**Layout:**
- Page title: "Get in touch" (Newsreader serif)
- Brief paragraph: "I'm always happy to hear about new opportunities, projects, or ideas."
- Contact methods as a list:
  - Email: mailto link (visible address)
  - LinkedIn: profile link
  - GitHub: profile link
- Location: "Phoenix, AZ · Open to remote opportunities"
- Optional: Calendly embed or link for scheduling (deferred for v1)

## Images & Performance

- **Photo format:** WebP with JPEG fallback via `<picture>` element
- **Lazy loading:** `loading="lazy"` on all below-fold images
- **Hero photo:** Provide `srcset` for 1x and 2x (220px and 440px widths)
- **Tailwind CDN trade-off:** The CDN runtime is ~300KB+ and may cause a flash of unstyled content. Acceptable for initial build; flagged as post-launch optimization (purge/JIT build or switch to vanilla CSS).

## Accessibility Requirements

- All text combinations meet WCAG AA (4.5:1 for normal text, 3:1 for large text)
- `--text-secondary` (#6b6a67) verified at 4.6:1 on white
- `--accent-text` (#c4324a) verified at 5.2:1 on white, 4.5:1 on `--accent-soft`
- Skip-to-main-content link as first focusable element on every page
- Visible focus rings using accent color
- `prefers-reduced-motion`: disable any transitions/animations
- All interactive elements keyboard accessible
- Semantic HTML: proper heading hierarchy, nav landmark, main landmark
- Image alt text on all images

## Meta & SEO

- Favicon: "DH" monogram in multiple sizes (16, 32, 180 for Apple touch)
- Open Graph image: 1200×630, warm white background, name + title + photo in editorial layout
- `<meta>` tags: description, og:title, og:description, og:image, og:url, twitter:card
- Semantic HTML for search engine parsing
- `<title>` format: "Douglas Hill — IT Solutions Engineer & Cloud Architect"

## Animations & Interactions

Restrained by design:
- Nav links: background color on hover (0.15s ease)
- Buttons: opacity shift or background change (0.15s ease). Nav pill CTA: lighten to `#4a4a44` on hover, accent outline on focus.
- Project rows: background highlight + arrow slide on hover (0.15s ease)
- Scroll spy: section nav highlight updates on scroll
- No scroll-triggered animations. No parallax. No entrance animations.
- `prefers-reduced-motion`: disable all transitions

## Build Order

1. **Homepage** — hero, positioning, projects, skills, certs, CTA, footer, nav
2. **Resume page** — web-native resume with scroll spy, PDF download
3. **Projects page** — expanded project cards with detail views
4. **Contact page** — email, LinkedIn, GitHub, location
5. **Writing page** — deferred until 3+ posts exist
6. **Meta** — OG image, favicon, social meta tags
7. **Deploy** — sync to S3, CloudFront invalidation

## Out of Scope

- Dark mode toggle (enhancement for later)
- Blog/CMS functionality
- Contact form (using direct email/LinkedIn instead)
- Build tools or static site generators
- Analytics (can add later)
