---
name: Douglas Hill Consulting Studio
description: Sculptural dual-atmosphere enterprise studio pairing Deep Velvet Night stages with Warm Raw Silk editorial canvases.
colors:
  coral: "#ff6b4a"
  coral-hover: "#ff7b5c"
  coral-ink: "#c2391a"
  amber: "#ffaa5c"
  amber-hover: "#ffa066"
  amber-ink: "#964d08"
  sky: "#5ec2ff"
  sky-ink: "#135d96"
  mint: "#5eead4"
  mint-ink: "#0e6f65"
  night: "#0b0c14"
  night-elevated: "#121524"
  night-surface: "#191d31"
  on-night: "#f7f4ef"
  on-night-muted: "#b8bdd0"
  on-night-subtle: "#8a91ab"
  silk: "#f6f3ee"
  silk-sunken: "#ede8df"
  silk-card: "#ffffff"
  ink: "#111320"
  ink-hover: "#1f2338"
  ink-secondary: "#434759"
  ink-muted: "#5b6075"
  error: "#e5484d"
  error-on-night: "#ff9497"
  error-ink: "#b42318"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "clamp(2.55rem, 1.75rem + 3.9vw, 5.15rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.036em"
  headline:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.45rem + 2.5vw, 3.6rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.032em"
  editorial-accent:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "1.09em"
    fontWeight: 400
    lineHeight: 0.96
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.08rem + 0.65vw, 1.6rem)"
    fontWeight: 700
    lineHeight: 1.24
    letterSpacing: "-0.032em"
  body:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1.03125rem"
    fontWeight: 400
    lineHeight: 1.62
  label:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.45
    letterSpacing: "-0.005em"
rounded:
  pill: "999px"
  control: "0.95rem"
  dock: "1.35rem"
  card: "1.75rem"
  card-lg: "2.5rem"
  stage: "clamp(1.75rem, 1.1rem + 2vw, 3rem)"
spacing:
  s1: "0.25rem"
  s2: "0.5rem"
  s3: "0.75rem"
  s4: "1rem"
  s5: "1.5rem"
  s6: "2rem"
  s7: "3rem"
  s8: "4.5rem"
  s9: "6.5rem"
components:
  button-glow:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.night}"
    typography: "label"
    rounded: "{rounded.pill}"
    padding: "0.72rem 1.45rem"
    height: "3.25rem"
  button-glow-hover:
    backgroundColor: "{colors.coral-hover}"
    textColor: "{colors.night}"
    rounded: "{rounded.pill}"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.silk}"
    typography: "label"
    rounded: "{rounded.pill}"
    padding: "0.72rem 1.45rem"
    height: "3.25rem"
  button-ink-hover:
    backgroundColor: "{colors.ink-hover}"
    textColor: "{colors.silk}"
    rounded: "{rounded.pill}"
  button-glass:
    backgroundColor: "{colors.night-elevated}"
    textColor: "{colors.on-night}"
    typography: "label"
    rounded: "{rounded.pill}"
    padding: "0.72rem 1.45rem"
    height: "3.25rem"
  card-bento:
    backgroundColor: "{colors.silk-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "2.15rem"
  input-dark:
    backgroundColor: "{colors.night}"
    textColor: "{colors.on-night}"
    rounded: "{rounded.control}"
    padding: "0.78rem 1rem"
    height: "3.1rem"
---

# Design System: Douglas Hill Consulting Studio

## Overview

**Creative North Star: "The Living Continuum"**

Douglas Hill Consulting Studio balances calm principal-architect authority with kinetic architectural craft. Rather than presenting enterprise work as a rigid spreadsheet or a generic SaaS feature grid, the interface alternates deliberately between sculptural **Deep Velvet Night** stages (`#0b0c14`) and breathable **Warm Raw Silk** editorial canvases (`#f6f3ee`). Every interactive artifact — from the four-mode iridescent continuum sculpture to outcome-led case filtering — demonstrates senior fluency across custom web applications, Microsoft Power Platform, Power BI intelligence, and cloud governance without swagger or clutter.

Typography and proportion carry the hierarchy. Crisp geometric headlines in Plus Jakarta Sans anchor each section directly without formulaic section kickers, punctuated selectively by italic Instrument Serif inflections that warm technical subject matter. Whitespace is generous, surfaces curve softly at architectural radii, and every screen funnels naturally toward a single clear invitation: booking a 30-minute conversation directly with the principal architect.

We explicitly reject generic SaaS gradient-text clichés, navy-and-gray corporate stock templates, rigid single-track boxed grids, and gratuitous motion theatrics that penalize reduced-motion visitors.

**Key Characteristics:**
- **Alternating Dual Atmosphere:** Deep Velvet Night stages frame interactive proof and conversion moments; Warm Raw Silk chapters give long-form architectural substance calm reading room.
- **Four-Discipline Spectrum:** Luminous Coral, Glacier Sky, Warm Amber, and Jade Mint map 1:1 to Applications & Web, Power BI Intelligence, System Automation, and Cloud Governance.
- **Editorial-Geometric Tension:** Tightly tracked Plus Jakarta Sans (`-0.032em` to `-0.036em`) paired with fluid Instrument Serif italics (`1.09em`) for deliberate focal inflection.
- **Tactile Pill Ergonomics:** Full-pill interactive controls (`999px` radius, `>= 44px` touch targets) contrast against generous rounded architectural cards (`1.75rem` to `2.5rem`).
- **Respectful Kinetic Craft:** Idle-deferred custom GLSL/WebGL sculpture and exponential ease-out choreography degrade cleanly to crisp static geometry and `180ms` color/opacity feedback under `prefers-reduced-motion: reduce`.

## Colors

The palette pairs warm editorial neutrals and deep indigo-black velvet surfaces with four discipline-keyed studio accents, each paired with a darkened ink counterpart for WCAG AA legibility on light silk.

### Primary
- **Luminous Studio Coral** (`#ff6b4a`, hover `#ff7b5c`, light-surface ink `#c2391a`): Primary conversion signal, active Applications & Web discipline marker, focus rings, and key italic headline emphasis on dark velvet stages.
- **Warm Kinetic Amber** (`#ffaa5c`, hover `#ffa066`, light-surface ink `#964d08`): Warm gradient companion for primary glow actions and active System Automation discipline accent.

### Secondary
- **Glacier Intelligence Sky** (`#5ec2ff`, light-surface ink `#135d96`): Active Power BI & Data Modeling discipline accent, secondary orbital filament highlight, and cool ambient counter-light.

### Tertiary
- **Jade Governance Mint** (`#5eead4`, light-surface ink `#0e6f65`): Active Platform Governance, CoE & Cloud Architecture discipline accent and live operational availability indicator.
- **Validation Crimson** (`#e5484d`, dark-surface text `#ff9497`, light-surface text `#b42318`): Reserved strictly for form error borders, alert summaries, and inline field recovery guidance.

### Neutral
- **Deep Velvet Night** (`#0b0c14`), **Elevated Night** (`#121524`), and **Night Surface** (`#191d31`): Primary dark canvas, elevated case-study cards, and framed media wells.
- **Ivory On-Night** (`#f7f4ef`), **Muted Slate** (`#b8bdd0`), and **Subtle Slate** (`#8a91ab`): Primary, secondary, and tertiary/placeholder foregrounds on dark stages, tinted cool-warm rather than pure gray.
- **Warm Raw Silk** (`#f6f3ee`), **Sunken Silk** (`#ede8df`), and **Pure Silk Card** (`#ffffff`): Light editorial section backgrounds, inset step panels, and lifted bento capability cards.
- **Deep Studio Ink** (`#111320`, hover `#1f2338`), **Secondary Ink** (`#434759`), and **Muted Ink** (`#5b6075`): Primary (`15.6:1`), body (`8.3:1`), and metadata (`5.52:1`) text on Warm Raw Silk.

### Named Rules
**The Surface-Paired Accent Rule.** Luminous accents (`#ff6b4a`, `#5ec2ff`, `#ffaa5c`, `#5eead4`) appear as text only on Deep Velvet Night surfaces; on Warm Raw Silk, always switch to their paired ink tokens (`#c2391a`, `#135d96`, `#964d08`, `#0e6f65`) so body and label contrast stays comfortably above `4.5:1`.

**The Solid Letterform Rule.** Never apply multi-stop CSS `background-clip: text` gradients to headlines or impact counters; typographic emphasis comes from solid coral or ivory contrast, scale, and italic serif form.

## Typography

**Display Font:** Plus Jakarta Sans (`400–800`, self-hosted variable Latin subset with `system-ui, sans-serif` fallback) paired with Instrument Serif (`400` normal & italic, self-hosted with `Georgia, serif` fallback)
**Body Font:** Plus Jakarta Sans (`400–700`, self-hosted)

**Character:** Grounded modern geometric sans-serif structure softened by high-contrast editorial serif italics on the decisive noun or phrase of each major statement.

### Hierarchy
- **Display** (`700`, `clamp(2.55rem, 1.75rem + 3.9vw, 5.15rem)`, line-height `1.02`, tracking `-0.036em`): Hero statement (`max-width: 14.5ch`), balanced with one italic Instrument Serif focal word.
- **Headline** (`700`, `clamp(2rem, 1.45rem + 2.5vw, 3.6rem)`, line-height `1.08`, tracking `-0.032em`): Primary section headings across Capabilities, Selected Work, Approach, Principal, FAQ, and Contact.
- **Editorial Accent** (`Instrument Serif 400 italic`, `1.09em`, line-height `0.96`, tracking `-0.01em`): Inline italic inflection inside Display and Headline headings, plus large impact numerals (`clamp(2.5rem, 2rem + 2.4vw, 4rem)` in normal roman serif).
- **Title** (`700`, `clamp(1.25rem, 1.08rem + 0.65vw, 1.6rem)`, line-height `1.24`, tracking `-0.032em`): Capability bento card titles, case-study titles, and engagement track headings.
- **Body** (`400`, `1.03125rem` standard / `clamp(1.0625rem, 1rem + 0.32vw, 1.25rem)` lead, line-height `1.58–1.62`): Narrative prose, constrained to `48ch–58ch` for effortless scanning.
- **Label** (`600`, `0.8125rem` / `0.75rem` micro, line-height `1.45`, tracking `-0.005em`): Metadata tags, credentials, pill controls, and form hints.

### Named Rules
**The Self-Sufficient Heading Rule.** Section headings never carry a decorative eyebrow badge or uppercase kicker above them; only the hero may display an operational scope pill, leaving every subsequent `<h2>` to lead its chapter cleanly.

**The Single Italic Inflection Rule.** Use Instrument Serif italic at most once per heading so the contrast reads as deliberate editorial authorship rather than ornament.

## Layout

Pages sit inside a centered fluid container (`max-width: 82rem`) with responsive horizontal gutters (`clamp(1.125rem, 0.65rem + 2.4vw, 3rem)`) and generous vertical chapter rhythm (`clamp(4.25rem, 3rem + 5.5vw, 8rem)`). Sections alternate dark-to-light with rounded stage transitions (`clamp(1.75rem, 1.1rem + 2vw, 3rem)`) that create physical cadence down the page:

1. **Hero & Ecosystem Ribbon** (`Deep Velvet Night`): Two-column asymmetric split at `>= 1024px` (`1.04fr` editorial pitch + `0.96fr` interactive 3D continuum dock), stacking copy-first on tablets and phones so `<h1>` and the primary booking CTA remain above the `375×667` fold.
2. **Capabilities Bento** (`Warm Raw Silk`): Four-pillar `2×2` architectural grid at `>= 860px` (`1fr` below), giving custom web apps, Power Apps/Pages, Power BI, Automation, and Cloud Governance equal stature.
3. **Selected Enterprise Work** (`Deep Velvet Night`): Four-column semantic `<dl>` impact strip (`>= 1024px`, `2×2` at `640px–1023px`) followed by interactive discipline filters and a `2×2` outcome-led case study grid (`>= 860px`).
4. **Engagement Flow** (`Warm Raw Silk`): Three engagement-model cards (`>= 900px`) above an inset sunken-silk 4-step delivery ledger.
5. **Principal Profile, FAQ & Closing Contact** (`Night` → `Silk` → `Night`): Sticky portrait rail (`23rem 1fr` at `>= 1024px`), two-column sticky FAQ (`0.78fr 1.22fr` at `>= 960px`), and two-column conversion stage (`0.92fr 1.08fr` at `>= 960px`).

Desktop pill navigation activates only at `>= 65em` (`1040px` at `16px` root font-size) so `150%–200%` browser text scaling (`WCAG 1.4.4`) automatically switches to the accessible focus-trapped glass drawer before crowding or overflowing the header pill.

## Elevation & Depth

Depth combines tonal surface contrast, translucent glass chrome on sticky/floating controls, and offset ambient shadows on light-silk cards. Ambient background auras use large multi-stop `radial-gradient(...)` pools rather than GPU-heavy offscreen `filter: blur(...)` layers, and `backdrop-filter` is applied once per floating shell — never nested inside child docks.

### Shadow Vocabulary
- **Soft Card Rest** (`box-shadow: 0 18px 48px -18px rgba(17, 19, 32, 0.1), 0 2px 10px -2px rgba(17, 19, 32, 0.04)`): Default resting depth for white Silk bento cards and FAQ items.
- **Interactive Card Lift** (`box-shadow: 0 28px 64px -20px rgba(17, 19, 32, 0.16), 0 6px 18px -4px rgba(17, 19, 32, 0.06)`): Hover elevation paired with `-4px` vertical lift on fine-pointer devices.
- **Primary Coral Glow** (`box-shadow: 0 12px 32px -10px rgba(255, 107, 74, 0.45)`): Warm directional glow beneath primary `Book a call` CTAs, deepening on hover (`0.62` alpha).
- **Velvet Stage Depth** (`box-shadow: 0 32px 80px -28px rgba(0, 0, 0, 0.75)`): Structural grounding for the 3D Continuum shell, portrait frame, and dark-glass lead form card.

### Named Rules
**The Single-Pass Glass Rule.** Apply `backdrop-filter` only to top-level floating chrome (the sticky header pill, mobile menu drawer, secondary glass CTA, and standalone form shell); nested controls inside an already-framed dark container use solid translucent surface tokens (`rgba(11, 12, 20, 0.72)`) with `1px` hairlines.

## Shapes

Form language contrasts crisp tactile pills against calm architectural containers:
- **Interactive Pills (`999px`):** All primary/secondary buttons, navigation links, Studio Switcher mode tabs, case-study filter chips, and technology stack tags use full-pill geometry to signal clickability immediately.
- **Form Controls (`0.95rem`):** Text inputs, textareas, and alert summaries use taut rounded corners that distinguish editable fields from action pills.
- **Architectural Cards (`1.75rem` standard, `2.5rem` signature shells):** Bento capability cards, case-study cards, and credential boxes use `1.75rem` corners; hero continuum, portrait, and contact form shells step up to `2.5rem`.
- **Hairline Strokes (`1px`):** Dark surfaces use `rgba(247, 244, 239, 0.10)` at rest (`0.22` on hover/emphasis); light silk surfaces use `rgba(17, 19, 32, 0.09)` (`0.18` strong). Never use thick decorative side-borders (`border-left > 1px`).

## Components

Every interactive component feels tactile, buoyant, and decisive, pairing spring-eased pointer response (`cubic-bezier(0.16, 1, 0.3, 1)`) with unmistakable keyboard `:focus-visible` rings (`2px solid #ff6b4a`, `3px` offset).

### Buttons
- **Shape:** Full pill (`999px`), minimum height `3.25rem` (`2.75rem` / `44px` for compact header/utility variants), padding `0.72rem 1.45rem`.
- **Primary (Glow CTA):** `135deg` warm coral-to-amber fill (`#ff6b4a` → `#ffaa5c`) with deep velvet text (`#0b0c14`), bold `700` weight, trailing directional arrow icon, and warm offset shadow.
- **Light-Surface Primary (Ink CTA):** Solid Deep Studio Ink (`#111320`) with Warm Raw Silk text (`#f6f3ee`), shifting to `#1f2338` on hover.
- **Hover / Focus / Reduced Motion:** Fine-pointer hover lifts `-2px` and nudges the trailing icon `+3px`; under `prefers-reduced-motion: reduce`, spatial transforms are disabled while `180ms` color/border transitions remain crisp.
- **Secondary (Glass Pill):** Translucent surface (`rgba(255, 255, 255, 0.06)` on Night, `rgba(17, 19, 32, 0.04)` on Silk) with `1px` strong hairline border.

### Chips
- **Discipline Filter & Mode Pills:** Minimum `44px` height, `999px` radius, `0.8125rem–0.84375rem` semibold text. Unselected chips sit quietly in muted slate; active chips fill with solid ivory or the active discipline's accent (`#ff6b4a`, `#5ec2ff`, `#ffaa5c`, `#5eead4`) with `#0b0c14` text.
- **Stack Metadata Tags:** Non-interactive pills (`0.32rem 0.78rem`, `0.78125rem` medium weight) in subtle surface tint (`rgba(255, 255, 255, 0.06)` on Night, `#f6f3ee` on white Silk cards).

### Cards / Containers
- **Corner Style:** `1.75rem` on bento and case-study cards; `2.5rem` on hero 3D dock, portrait frame, and contact form card.
- **Background:** Pure white (`#ffffff`) on Warm Raw Silk sections; Elevated Night (`#121524`) or Dark Glass (`rgba(20, 23, 38, 0.82)`) on Deep Velvet Night sections.
- **Shadow Strategy:** Soft Card Rest at idle, lifting to Interactive Card Lift on hover with a subtle radial cursor-spotlight sheen on fine pointers.
- **Border:** `1px` hairline (`rgba(17, 19, 32, 0.09)` light / `rgba(247, 244, 239, 0.10)` dark).
- **Internal Padding:** Fluid `clamp(1.5rem, 1.2rem + 1.4vw, 2.25rem)`.

### Inputs / Fields
- **Style:** `0.95rem` radius, `3.1rem` minimum height, `1px` subtle hairline (`rgba(247, 244, 239, 0.10)`), deep translucent fill (`rgba(11, 12, 20, 0.65)`), ivory text (`#f7f4ef`), and accessible placeholder contrast (`#8a91ab`, `>= 5.4:1`).
- **Focus:** `1px` coral border (`#ff6b4a`), darkened focus well (`rgba(11, 12, 20, 0.92)`), and `3px` soft coral halo (`rgba(255, 107, 74, 0.24)`).
- **Error:** `1.5px` Validation Crimson border (`#e5484d`) paired with high-contrast `#ff9497` (`>= 8.9:1`) inline error copy and top-of-form focusable alert summary.

### Navigation
- **Desktop (`>= 65em` / `1040px` at `16px`):** Sticky floating pill (`999px` radius, `3.6rem` min-height) housing the harmonic-wave Wordmark emblem, 5 section anchor pills (`44px` tall, `aria-current="true"` tracked via `IntersectionObserver`), and a compact `Book a call` glow CTA; condenses to deeper opacity (`0.92`) after `8px` scroll.
- **Mobile / Text Zoom (`< 65em`):** Collapses nav links into a `44×44px` circular menu toggle that opens a focus-trapped dark-glass card drawer (`inert` applied to `<main>` and `<footer>`, `Escape` closes and restores focus).

### Continuum Stage & Studio Switcher
- **Role:** Signature interactive hero proof piece pairing a custom GLSL wave-displaced TorusKnot + orbital filaments + floating data pearls with a 4-tab ARIA tablist (`Apps & Web`, `Power BI`, `Automation`, `Governance`).
- **Behavior:** Hydrates during browser idle time (`requestIdleCallback`), reads discipline colors directly from `:root` CSS custom properties, switches modes exclusively on explicit click or arrow-key navigation (never accidental pointer pass-through), and skips downloading the WebGL bundle completely when `prefers-reduced-motion: reduce` is active in favor of a crisp vector continuum emblem.

## Do's and Don'ts

### Do:
- **Do** alternate Deep Velvet Night (`#0b0c14`) and Warm Raw Silk (`#f6f3ee`) chapters so dense enterprise proof and calm architectural reading balance each other.
- **Do** lead every case study and capability card with concrete business outcomes (`1,188+` records migrated, `200+` environments governed, `1.2M` customers reached) before listing stack tags.
- **Do** enforce `>= 44×44px` hit targets on every interactive control, including standalone inline email and legal links.
- **Do** keep all styling in external hashed Astro stylesheets (`style-src 'self'`) with zero inline `style=""` attributes or inline event handlers.
- **Do** gate heavy WebGL imports behind `!prefers-reduced-motion` and preserve `180ms` non-spatial hover/focus state feedback for reduced-motion users.

### Don't:
- **Don't** place decorative eyebrow badges or uppercase kickers above section `<h2>` headings; let the headline scale and serif inflection carry the entry.
- **Don't** use CSS `background-clip: text` gradients on headings, counters, or labels.
- **Don't** auto-activate `role="tab"` panels on `pointerenter` hover; require intentional click or keyboard selection.
- **Don't** use `filter: blur(80px+)` offscreen divs or nested `backdrop-filter` layers when a multi-stop `radial-gradient` or translucent token achieves the same depth at zero GPU cost.
- **Don't** narrow the studio narrative to a single tool — always represent custom web apps, Power Apps/Pages, Power BI, Power Automate, and cloud governance as one cohesive practice.
