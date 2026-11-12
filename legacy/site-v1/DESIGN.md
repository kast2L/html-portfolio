# Design

Visual system for the Douglas Hill portfolio. Captured from `css/styles.css` and the 2026-03-25 redesign spec. Notion-inspired editorial: light, content-first, serif + sans, one crimson accent inside a calm layout.

## Theme

- **Mode:** light only. White page, warm off-white surfaces.
- **Feel:** editorial magazine meets senior consultant. Whitespace and typography carry the design; the accent is a signature, not a theme.
- **Color strategy:** restrained — tinted near-neutrals plus one crimson accent used sparingly (well under 10% of the surface).

## Color

Defined as hex tokens in `:root` (not yet OKLCH; preserve the existing values — this is a committed brand identity, not a new project).

| Token | Value | Role |
|---|---|---|
| `--bg` | `#ffffff` | Page background |
| `--bg-warm` | `oklch(98.5% 0.005 16)` | Card / section / icon-tile backgrounds — tinted toward brand crimson (hue 16), not warm-yellow |
| `--bg-hover` | `oklch(96.5% 0.009 16)` | Row and surface hover — crimson-tinted |
| `--bg-accent` | `oklch(96.6% 0.014 16)` | Accent-tinted background |
| `--text` | `#37352f` | Primary text (12.8:1 on white) |
| `--text-secondary` | `#6b6a67` | Secondary / body prose (4.6:1 on white) |
| `--text-light` | `#605f5c` | Tertiary / hints — note: darker than the spec's original #8a8985 |
| `--accent` | `#e94560` | Decorative crimson — large headings (≥24px / ≥18.66px bold), fills, borders only |
| `--accent-text` | `#c4324a` | Body-size accent text (5.2:1 on white) |
| `--accent-soft` | `#fce4e8` | Accent tag / chip backgrounds |
| `--border` | `rgba(55,53,47,0.09)` | Default hairline borders |
| `--border-hover` | `rgba(55,53,47,0.16)` | Hover / active borders |
| `--shadow-card` | `0 1px 3px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.04)` | Card / photo shadow |

**Rules.** Accent crimson never touches small text — use `--accent-text` for any accent at body size. Gray-on-warm pairings are tuned to hold ≥4.5:1; don't lighten body text for "elegance."

## Typography

Two families on a contrast axis (serif display + humanist sans body), loaded from Google Fonts with `display=swap`.

- **Newsreader** (serif) — headings and featured text only, 18px minimum. Italic carries emphasis and the accent (`.hero-title em` is italic crimson).
- **Inter** (sans) — everything else: body, nav, tags, labels.

| Element | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Hero h1 | Newsreader | 48px | 600 | letter-spacing −0.5px, line-height 1.2 |
| CTA heading | Newsreader | 40px | 600 | |
| Section title | Newsreader | 32px | 600 | letter-spacing −0.3px |
| Positioning / pull text | Newsreader | 18px | 400 | line-height 1.8 |
| Impact number | Newsreader | 36px | 600 | accent `em` for the value |
| Nav logo | Newsreader | 18px | 600 | "Douglas Hill" |
| Bio text | Inter | 17px | 400 | line-height 1.75 |
| Body | Inter | 15px | 400 | line-height 1.6 |
| Nav link | Inter | 14px | 500 | |
| Label (kicker) | Inter | 12px | 600 | uppercase, letter-spacing 1.5px |
| Tag | Inter | 12px | 500 | uniform across pages |

## Spacing & Layout

- **Column:** `--max-w` 920px, centered. Body prose stays within a comfortable measure.
- **Section padding:** `--section-py` 60px vertical, `--section-px` 24px horizontal.
- **Radii:** `--radius` 6px (default), `--radius-card` 12px (callouts), `--radius-photo` 16px (photo).
- **Dividers:** full-width hairline `<hr class="divider">` between major sections.
- **Hero:** flex, side-by-side ≥768px (text left ~640px, photo right ~240px), stacks text-first (`column`) on mobile.
- **Impact strip:** 4-up grid → 2-up under 640px, bordered top and bottom.
- **Skills:** 3-column grid ≥768px (`grid-cols-1 md:grid-cols-3`).

## Components

- **Project rows** — bordered list (not cards): icon tile + title + outcome description + tag row + chevron. Chevron is hover-revealed on desktop, always visible on mobile. This is the primary work-showcase pattern; favor it over card grids.
- **Tags** — `.tag`, with `.tag--core` (filled/emphasis) and `.tag--impact` (outcome/client). Inter 12px.
- **Buttons** — `.btn-dark` (primary, dark fill, white text 12.8:1) and `.btn-outline` (secondary). Primary always points at "Book a call".
- **Cert badges** — small lettered chips (`A`, `Az`, `PP`, `SP`) with per-cert background tints.
- **Nav** — sticky top bar with logo + links + `.nav-cta`; collapses to hamburger + `.nav-overlay` under 768px.

## Motion

Minimal and functional. Hover transitions are 0.15s ease (row background, chevron color/opacity + 3px nudge, link states); buttons have an `:active` press-scale. A hero `rise-in` entrance fires on load, and a gated scroll-reveal (`html.js-reveal` + IntersectionObserver, fires once) rises blocks in as they enter view. Reveal is gated so no-JS / reduced-motion / crawlers get fully-visible content. Easing tokens: `--ease-out-expo`, `--ease-out-quart`. Any motion must:

- use transform/opacity, ease-out curves, no bounce;
- enhance an already-visible default (never gate content reveal on a class trigger);
- ship a `@media (prefers-reduced-motion: reduce)` fallback.

## Imagery

- Real portrait photo (`IMG_9852.jpg`), rounded 16px with `--shadow-card` and a 1px border. No stock photography — it would violate the corporate-stock-photo anti-reference.
- Inline SVG line icons for project tiles, stroked with `--accent-text`. Consistent 22px, 1.6–1.8 stroke.

## Tech

Static multi-page HTML/CSS/JS, no build step. Tailwind utility classes via CDN sit alongside the token-driven `css/styles.css` (utilities for layout, tokens for identity). Hosted on AWS S3 + CloudFront. Fonts via Google Fonts. Contact is mailto + LinkedIn — no form dependency.
