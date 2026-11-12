# Impeccable Audit Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Before editing any UI file, read `/Users/douglashill/.gemini/config/plugins/impeccable/skills/impeccable/reference/craft-floor.md` per the `impeccable` skill setup rules.

**Goal:** Resolve all 12 findings (`3` P1, `7` P2, `2` P3) from the Impeccable Technical Audit on the **Living Continuum** Astro 7 landing page, lifting the Audit Health Score from `15/20` to `20/20` while preserving strict CSP and all conversion/analytics contracts.

**Architecture:** Introduce a deterministic Node verification script (`scripts/verify-audit.mjs`) that tests built HTML, CSS tokens, DOM semantics, contrast ratios, and bundle budgets after `astro build`. Remediate tokens/theming, accessibility/reduced-motion semantics, responsive text-zoom & touch targets, WebGL tree-shaking & idle/motion-gated hydration, unused React removal, and `DESIGN.md` + `.impeccable/design.json` documentation in five isolated, verifiable tasks.

**Tech Stack:** Astro `^7.4.10` (static output + hashed CSP), TypeScript `^6.0.3`, Three.js `^0.187.0` (custom GLSL shaders, named ESM imports), GSAP `^3.15.1` (`ScrollTrigger`), Node `>=22.23.4`.

**Spec:** `docs/markup-contract.md`, `PRODUCT.md`, and `/Users/douglashill/.gemini/config/plugins/impeccable/skills/impeccable/reference/{audit,document,craft-floor}.md`.

## Global Constraints

- **Strict Astro CSP (`astro.config.mjs`):** `styleDirective: { resources: ["'self'"] }`, `font-src 'self'`, `scriptDirective: { resources: ["'self'", 'https://www.googletagmanager.com'] }`. Zero `style="..."` HTML attributes and zero `on*=` inline handlers in any `.astro` file or emitted `dist/*.html`.
- **Untouched Client Contract Scripts:** Do NOT edit `public/js/attribution.js`, `public/js/analytics.js`, or `public/js/lead-form.js`.
- **Booking Link Contract (`docs/markup-contract.md`):** Every Calendly link must remain `<a data-book-call="<location>" href="https://calendly.com/douglashill-llcdouglashill/30min" target="_blank" rel="noopener noreferrer">` with `.sr-only` `(opens in a new tab)`. Required locations across the site: `nav`, `hero`, `offer`, `cta`, `form-fallback`, `noscript`, `thank-you`.
- **Lead Form Contract (`docs/markup-contract.md`):** Preserve `form#lead-form[method="post"][action="/api/lead"][novalidate][hidden]`, `#lead-errors`, `#lead-name`, `#lead-email`, `#lead-company`, `#lead-process[aria-describedby="lead-process-hint"]`, `.hp-field > #lead-website`, hidden UTM inputs (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `gclid`, `landing_path`), `button#lead-submit[data-label-idle][data-label-busy] > span.btn-label`, `#lead-status`, `#lead-fallback`, and `<noscript>`.
- **Localhost Rule:** Never probe `localhost` or `127.0.0.1:4321` with CLI tools (`curl`, `wget`, `lsof`, `ps`, `netstat`); verify live browser rendering exclusively through the `browser` subagent.
- **Git Discipline:** Do not commit or push unless explicitly requested by the user; use `npm run build && node scripts/verify-audit.mjs` as the deterministic completion gate at the end of every task.

## Review Focus

1. **`prefers-reduced-motion: reduce` visitor on `/`:** `continuum3d.*.js` is never imported, `.continuum-fallback` SVG remains visible (`opacity: 1`), marquee wraps statically without horizontal scroll, and button/input/accordion hover & focus states keep crisp `180ms` color/border/opacity feedback without spatial `transform` motion.
2. **`150%–200%` browser text zoom at `1040px` desktop width:** `.header-pill` keeps brand wordmark, 5 nav links, and `Book a call` CTA on one row without overlap or horizontal overflow (`scrollWidth <= innerWidth`), while `< 1040px` uses the mobile drawer cleanly.
3. **Mouse pass-through while keyboard focus is inside `.mode-pills`:** Moving the pointer across `.mode-pills` does not auto-switch `aria-selected` or swap `<div role="tabpanel">`; tabs change only on `click` or `ArrowLeft`/`ArrowRight`/`Home`/`End`.
4. **Screen-reader traversal of `<dl class="metrics-strip">` & duplicate SVG `<defs>` IDs:** Every `.metric-card` renders `<dt>` before `<dd>` in DOM order (with visual number-on-top via `flex-direction: column-reverse`), and zero duplicate `id` attributes exist anywhere in `dist/*.html`.
5. **Form error contrast & dark-glass token parity:** `#lead-errors` and `.field-error` use `--c-error-on-night` (`#ff9497`, `>= 8.9:1` on dark glass), and `--c-ink-3` (`#5b6075`) achieves `5.52:1` on `--c-silk` (`#f6f3ee`).

---

## File Responsibility Map

- **Create `scripts/verify-audit.mjs`** — Deterministic Node audit test runner verifying built `dist/*.html` & CSS/JS outputs (WCAG contrast math, zero inline `style=""`, unique DOM `id`s, `<dt>`-before-`<dd>` order, zero `0.01ms !important`, zero `background-clip: text`, zero React client bundle).
- **Modify `src/styles/tokens.css`** — Single normative source of truth for colors (including darkened `--c-ink-3: #5b6075`, `--c-error-on-night`, glass surfaces, and hover accents), typography, spacing, radii, shadows, and motion.
- **Modify `src/styles/global.css`** — Base styles, token-driven buttons, standalone `.text-link` 44px target helper, distilled `.section-kicker` typographic label, and intentional non-destructive `@media (prefers-reduced-motion: reduce)` rules.
- **Modify `src/components/Wordmark.astro`** — Unique per-instance SVG gradient ID (`instance` prop) + token-driven SVG stops/strokes.
- **Modify `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`, & `src/scripts/nav.ts`** — Pass unique `Wordmark` `instance` props, consume glass tokens, and widen desktop nav breakpoint to `1040px` for `WCAG 1.4.4` text scaling.
- **Modify `src/components/LeadForm.astro` & `src/components/home/ContactStudio.astro`** — Replace raw hex/`rgba()` literals with semantic tokens, remove `filter: blur(90px)` offscreen aura in favor of a zero-blur radial gradient, and enforce `44px` tap target on direct `mailto:` link.
- **Modify `src/components/home/HeroStudio.astro`** — Replace `.hero-accent-word` `gradient-text` with solid `var(--c-coral)`, replace `filter: blur(95px)` aura divs and nested `backdrop-filter` rules with zero-blur gradients and semantic glass tokens.
- **Modify `src/components/home/SelectedWork.astro`** — Fix `<dt>`-before-`<dd>` DOM order in `<dl class="metrics-strip">` (`flex-direction: column-reverse`) and replace `.metric-value` `gradient-text` with solid `var(--c-on-night)`.
- **Modify `src/components/home/CapabilitiesBento.astro`, `src/components/home/EngagementFlow.astro`, `src/components/home/StudioFaq.astro`, & `src/layouts/SimpleLayout.astro`** — Replace repetitive `.eyebrow-pill` badges on light-silk sections and subpages with crisp `.section-kicker` labels, and enforce `min-height: 44px` on standalone `.simple-body` text links.
- **Modify `astro.config.mjs` & `package.json`** — Remove unused `@astrojs/react`, `react`, `react-dom`, `@types/react`, and `@types/react-dom`.
- **Modify `src/scripts/continuum3d.ts` & `src/scripts/motion.ts`** — Switch Three.js to explicit named imports, sync 3D accent colors from `:root` CSS custom properties, remove `pointerenter` tab auto-switching, skip WebGL chunk import under `prefers-reduced-motion: reduce`, and defer WebGL hydration via `requestIdleCallback`.
- **Modify `DESIGN.md` & Create `.impeccable/design.json`** — Document the shipped `Living Continuum` design system in canonical Stitch/Impeccable format with `schemaVersion: 2` sidecar.

---

### Task 1: Automated Audit Test Suite, Token Consolidation, Contrast & Anti-Slop Typography

**Resolves Audit Findings:** `#4` (`--c-ink-3` `4.37:1` contrast), `#5` (`gradient-text` detector warnings in `HeroStudio` & `SelectedWork`), `#10` (raw hex/`rgba()` literals across CSS/components).

**Files:**
- Create: `scripts/verify-audit.mjs`
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/global.css:251-305`
- Modify: `src/components/LeadForm.astro:115-220`
- Modify: `src/components/home/HeroStudio.astro:220-370`
- Modify: `src/components/home/SelectedWork.astro:179-196`

**Interfaces:**
- Produces CSS custom properties in `:root` (`src/styles/tokens.css`):
  - `--c-ink-3: #5b6075` (`5.52:1` on `--c-silk`)
  - `--c-ink-hover: #1f2338`
  - `--c-coral-hover: #ff7b5c`, `--c-amber-hover: #ffa066`
  - `--c-error-on-night: #ff9497`, `--c-error-bg-dark: rgba(229, 72, 77, 0.12)`
  - `--c-glass-pill: rgba(14, 16, 28, 0.74)`, `--c-glass-pill-condensed: rgba(11, 12, 20, 0.92)`
  - `--c-glass-drawer: rgba(16, 19, 33, 0.96)`, `--c-glass-card: rgba(20, 23, 38, 0.82)`
  - `--c-glass-dock: rgba(11, 12, 20, 0.72)`
  - `--c-input-bg: rgba(11, 12, 20, 0.65)`, `--c-input-bg-hover: rgba(11, 12, 20, 0.82)`, `--c-input-bg-focus: rgba(11, 12, 20, 0.92)`
  - `--c-focus-ring-coral: rgba(255, 107, 74, 0.24)`
- Produces CLI gate: `node scripts/verify-audit.mjs` (`--phase=1` or full default).

- [ ] **Step 1: Create `scripts/verify-audit.mjs` regression harness**

Create `scripts/verify-audit.mjs`:

```js
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseArg = process.argv.find((a) => a.startsWith('--phase='));
const maxPhase = phaseArg ? Number(phaseArg.split('=')[1]) : 99;

const failures = [];
function check(cond, msg) {
  if (!cond) failures.push(msg);
}

function relLuminance(hex) {
  const rgb = hex
    .replace('#', '')
    .match(/.{2}/g)
    .map((x) => parseInt(x, 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrast(a, b) {
  const l1 = relLuminance(a);
  const l2 = relLuminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// Phase 1 checks: contrast, zero gradient-text, zero inline styles
const tokensCss = fs.readFileSync(path.join(root, 'src/styles/tokens.css'), 'utf8');
const silkMatch = tokensCss.match(/--c-silk:\s*(#[0-9a-fA-F]{6})/);
const ink3Match = tokensCss.match(/--c-ink-3:\s*(#[0-9a-fA-F]{6})/);
check(Boolean(silkMatch && ink3Match), 'Missing --c-silk or --c-ink-3 hex in tokens.css');
if (silkMatch && ink3Match) {
  const ratio = contrast(ink3Match[1], silkMatch[1]);
  check(ratio >= 4.5, `--c-ink-3 (${ink3Match[1]}) on --c-silk (${silkMatch[1]}) is ${ratio.toFixed(2)}:1 (< 4.5:1)`);
}
check(tokensCss.includes('--c-error-on-night:'), 'Missing --c-error-on-night token in tokens.css');

const distFiles = ['index.html', 'privacy.html', 'terms.html', 'thank-you.html'].map((f) =>
  path.join(root, 'dist', f),
);
for (const file of distFiles) {
  const html = fs.readFileSync(file, 'utf8');
  check(!/\sstyle="/i.test(html), `Inline style="" attribute found in ${path.basename(file)}`);
}

const cssDir = path.join(root, 'dist/_astro');
const cssBundles = fs
  .readdirSync(cssDir)
  .filter((f) => f.endsWith('.css'))
  .map((f) => fs.readFileSync(path.join(cssDir, f), 'utf8'))
  .join('\n');

check(!/background-clip:\s*text/i.test(cssBundles), 'background-clip: text (gradient-text) still present in dist CSS');

// Phase 2 checks: no 0.01ms nuke, unique IDs, <dt> before <dd>, no pointerenter tab switch
if (maxPhase >= 2) {
  check(!/0\.01ms\s*!important/i.test(cssBundles), 'Global 0.01ms !important reduced-motion nuke still present in CSS');

  for (const file of distFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    const seen = new Set();
    for (const id of ids) {
      check(!seen.has(id), `Duplicate id="${id}" in ${path.basename(file)}`);
      seen.add(id);
    }
  }

  const indexHtml = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
  const dlMatch = indexHtml.match(/<dl[^>]*class="[^"]*metrics-strip[^"]*"[^>]*>([\s\S]*?)<\/dl>/);
  check(Boolean(dlMatch), 'Could not locate <dl class="metrics-strip"> in dist/index.html');
  if (dlMatch) {
    const cards = [...dlMatch[1].matchAll(/<div[^>]*class="[^"]*metric-card[^"]*"[^>]*>([\s\S]*?)<\/div>/g)];
    check(cards.length === 4, `Expected 4 .metric-card items inside <dl>, found ${cards.length}`);
    for (const [idx, card] of cards.entries()) {
      const dtPos = card[1].indexOf('<dt');
      const ddPos = card[1].indexOf('<dd');
      check(dtPos !== -1 && ddPos !== -1 && dtPos < ddPos, `.metric-card[${idx}] must place <dt> before <dd>`);
    }
  }

  const motionSrc = fs.readFileSync(path.join(root, 'src/scripts/motion.ts'), 'utf8');
  check(!/pointerenter.*activateMode/.test(motionSrc), 'pointerenter still triggers activateMode in motion.ts');
}

// Phase 3 checks: no React client bundle, no import * as THREE, reducedMotion gate, no blur(90px+)
if (maxPhase >= 3) {
  const astroFiles = fs.readdirSync(cssDir);
  check(!astroFiles.some((f) => /^client\..*\.js$/.test(f)), 'Unused React client.*.js bundle still emitted in dist/_astro');
  const contSrc = fs.readFileSync(path.join(root, 'src/scripts/continuum3d.ts'), 'utf8');
  check(!/import\s+\*\s+as\s+THREE/.test(contSrc), 'Namespace import * as THREE still present in continuum3d.ts');
  const motionSrc = fs.readFileSync(path.join(root, 'src/scripts/motion.ts'), 'utf8');
  check(/!reducedMotion/.test(motionSrc) && /requestIdleCallback/.test(motionSrc), 'WebGL import in motion.ts must be gated on !reducedMotion and deferred via requestIdleCallback');
  check(!/filter:\s*blur\(9\dpx\)/i.test(cssBundles), 'Expensive filter: blur(90px+) layer still present in CSS');
}

// Phase 4 checks: DESIGN.md YAML frontmatter + .impeccable/design.json sidecar
if (maxPhase >= 4) {
  const designMd = fs.readFileSync(path.join(root, 'DESIGN.md'), 'utf8');
  check(designMd.startsWith('---\nname:'), 'DESIGN.md missing canonical YAML frontmatter');
  check(!designMd.includes('#e94560'), 'DESIGN.md still contains legacy v1 #e94560 crimson token');
  const sidecarPath = path.join(root, '.impeccable/design.json');
  check(fs.existsSync(sidecarPath), 'Missing .impeccable/design.json sidecar');
  if (fs.existsSync(sidecarPath)) {
    const sidecar = JSON.parse(fs.readFileSync(sidecarPath, 'utf8'));
    check(sidecar.schemaVersion === 2, '.impeccable/design.json must use schemaVersion: 2');
  }
}

if (failures.length) {
  console.error('AUDIT VERIFICATION FAILED:\n' + failures.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}
console.log(`AUDIT VERIFICATION PASSED (through phase ${maxPhase})`);
```

- [ ] **Step 2: Run Phase 1 test to verify it fails against current build**

Run: `cd /Users/douglashill/fun/html-portfolio && node scripts/verify-audit.mjs --phase=1`
Expected: FAIL reporting `--c-ink-3 (#6c7186) on --c-silk (#f6f3ee) is 4.37:1 (< 4.5:1)`, `Missing --c-error-on-night`, and `background-clip: text (gradient-text) still present in dist CSS`.

- [ ] **Step 3: Update `src/styles/tokens.css`, `src/styles/global.css`, `src/components/LeadForm.astro`, `src/components/home/HeroStudio.astro`, and `src/components/home/SelectedWork.astro`**

1. In `src/styles/tokens.css`, update `--c-ink-3` to `#5b6075` and add the semantic dark-glass, input, hover, and error tokens:

```css
  --c-ink: #111320;
  --c-ink-hover: #1f2338;
  --c-ink-2: #434759;
  --c-ink-3: #5b6075;
```

```css
  --c-night: #0b0c14;
  --c-night-2: #121524;
  --c-night-3: #191d31;
  --c-night-glass: rgba(20, 23, 39, 0.68);
  --c-glass-pill: rgba(14, 16, 28, 0.74);
  --c-glass-pill-condensed: rgba(11, 12, 20, 0.92);
  --c-glass-drawer: rgba(16, 19, 33, 0.96);
  --c-glass-card: rgba(20, 23, 38, 0.82);
  --c-glass-dock: rgba(11, 12, 20, 0.72);
  --c-input-bg: rgba(11, 12, 20, 0.65);
  --c-input-bg-hover: rgba(11, 12, 20, 0.82);
  --c-input-bg-focus: rgba(11, 12, 20, 0.92);
```

```css
  --c-coral: #ff6b4a;
  --c-coral-hover: #ff7b5c;
  --c-coral-soft: rgba(255, 107, 74, 0.14);
  --c-coral-ink: #c2391a;
  --c-focus-ring-coral: rgba(255, 107, 74, 0.24);
```

```css
  --c-amber: #ffaa5c;
  --c-amber-hover: #ffa066;
  --c-amber-soft: rgba(255, 170, 92, 0.15);
  --c-amber-ink: #964d08;
```

```css
  --c-error: #e5484d;
  --c-error-on-night: #ff9497;
  --c-error-bg-dark: rgba(229, 72, 77, 0.12);
  --c-error-ink: #b42318;
```

2. In `src/styles/global.css`, replace raw hexes in `.btn-glow`, `.btn-glow:hover`, and `.btn-ink:hover`:

```css
.btn-glow {
  background: linear-gradient(135deg, var(--c-coral) 0%, var(--c-amber) 140%);
  color: var(--c-night);
  font-weight: var(--w-bold);
  box-shadow: 0 12px 32px -10px rgba(255, 107, 74, 0.45);
}

.btn-glow:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 40px -10px rgba(255, 107, 74, 0.62);
  background: linear-gradient(135deg, var(--c-coral-hover) 0%, var(--c-amber-hover) 100%);
}

.btn-ink:hover {
  transform: translateY(-2px);
  background: var(--c-ink-hover);
  box-shadow: 0 18px 36px -12px rgba(17, 19, 32, 0.45);
}
```

3. In `src/components/LeadForm.astro`, replace `#ff9497` and raw `rgba(...)` backgrounds with `var(--c-error-bg-dark)`, `var(--c-error-on-night)`, `var(--c-input-bg)`, `var(--c-input-bg-hover)`, `var(--c-input-bg-focus)`, `var(--c-line-dark-strong)`, and `var(--c-focus-ring-coral)`.

4. In `src/components/home/HeroStudio.astro`, replace `.hero-accent-word` gradient-text with solid `color: var(--c-coral)` and `.mode-pills`/`.mode-card` backgrounds with `var(--c-glass-dock)` and `var(--c-line-dark)`:

```css
  .hero-accent-word {
    color: var(--c-coral);
    padding-right: 0.04em;
  }
```

5. In `src/components/home/SelectedWork.astro`, replace `.metric-value` gradient-text with solid `color: var(--c-on-night)`:

```css
  .metric-value {
    font-family: var(--font-editorial);
    font-size: clamp(2.5rem, 2rem + 2.4vw, 4rem);
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--c-on-night);
  }
```

- [ ] **Step 4: Build and run Phase 1 verification + Impeccable mechanical detector**

Run:
```bash
cd /Users/douglashill/fun/html-portfolio && npm run build && node scripts/verify-audit.mjs --phase=1 && /Users/douglashill/.gemini/config/plugins/impeccable/skills/impeccable/scripts/impeccable detect --json src
```
Expected: `npm run build` exits `0`, `AUDIT VERIFICATION PASSED (through phase 1)`, and `impeccable detect --json src` exits `0` with `[]`.

---

### Task 2: Accessibility, Intentional Reduced Motion, Unique SVG IDs & Responsive Adaptation

**Resolves Audit Findings:** `#1` (global `0.01ms !important` nuke), `#2` (reversed `<dd>` before `<dt>` in `<dl>`), `#6` (duplicate `id="wm-grad"`), `#7` (`pointerenter` auto-switching `role="tab"`), `#9` (`125%–200%` text-zoom header crowding + `< 44px` standalone `.text-link`s).

**Files:**
- Modify: `src/styles/global.css:300-371`
- Modify: `src/components/home/SelectedWork.astro:86-100, 171-196`
- Modify: `src/components/Wordmark.astro:1-38`
- Modify: `src/components/SiteHeader.astro:20-26, 91-155, 270-284`
- Modify: `src/components/SiteFooter.astro:9-13`
- Modify: `src/scripts/nav.ts:32-36`
- Modify: `src/scripts/motion.ts:60-68`
- Modify: `src/components/home/ContactStudio.astro:101-106, 133-141`
- Modify: `src/layouts/SimpleLayout.astro:58-64`

**Interfaces:**
- Consumes tokens from Task 1 (`--c-glass-pill`, `--c-glass-pill-condensed`, `--c-glass-drawer`, `--c-glass-card`).
- Updates `Wordmark.astro` `Props`: `{ tone?: 'ink' | 'light'; instance?: string }` (default `instance = 'main'`, emitting `id={`wm-grad-${instance}`}`).

- [ ] **Step 1: Run Phase 2 test to confirm failure before implementation**

Run: `cd /Users/douglashill/fun/html-portfolio && node scripts/verify-audit.mjs --phase=2`
Expected: FAIL reporting `Global 0.01ms !important reduced-motion nuke still present`, `Duplicate id="wm-grad"`, `.metric-card[0..3] must place <dt> before <dd>`, and `pointerenter still triggers activateMode`.

- [ ] **Step 2: Replace global `0.01ms` nuke and add 44px standalone link tap height in `src/styles/global.css`**

Replace lines `362-371` of `src/styles/global.css` with:

```css
/* ==================== Reduced Motion ==================== */
@media (prefers-reduced-motion: reduce) {
  .btn,
  .btn .btn-icon,
  .bento-card,
  .case-card,
  .faq-toggle {
    transition:
      background-color var(--dur-fast) ease,
      border-color var(--dur-fast) ease,
      color var(--dur-fast) ease,
      opacity var(--dur-fast) ease;
  }

  .btn:hover,
  .btn:active,
  .btn:hover .btn-icon,
  .bento-card:hover,
  .case-card:hover {
    transform: none;
  }
}
```

- [ ] **Step 3: Fix `<dl>` `<dt>`-before-`<dd>` semantics in `src/components/home/SelectedWork.astro`**

Update the `.metrics-strip` template and CSS in `src/components/home/SelectedWork.astro`:

```astro
    <dl class="metrics-strip" data-reveal-group>
      {
        metrics.map((m) => (
          <div class="metric-card" data-reveal>
            <dt class="metric-label">{m.label}</dt>
            <dd
              class="metric-value"
              data-count={m.count}
              data-decimals={m.decimals}
              data-suffix={m.suffix}
            >
              {m.value}
            </dd>
          </div>
        ))
      }
    </dl>
```

```css
  .metric-card {
    display: flex;
    flex-direction: column-reverse;
    justify-content: flex-end;
    gap: 0.55rem;
    padding: clamp(1.25rem, 1rem + 1vw, 1.85rem);
    border-radius: var(--r-card);
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid var(--c-line-dark);
  }

  .metric-label {
    font-size: var(--fs-label);
    line-height: 1.45;
    color: var(--c-on-night-2);
  }
```

- [ ] **Step 4: Deduplicate SVG IDs in `Wordmark.astro` and widen header breakpoint to `1040px`**

1. In `src/components/Wordmark.astro`, add `instance?: string` prop (`const { tone = 'light', instance = 'main' } = Astro.props; const gradId = `wm-grad-${instance}`;`), set `<linearGradient id={gradId} ...>` and `stroke={`url(#${gradId})`}`, and use `var(--c-coral)`, `var(--c-amber)`, `var(--c-sky)` in stop-colors via CSS classes on `<stop>`.
2. In `src/components/SiteHeader.astro`, pass `<Wordmark tone="light" instance="header" />`, replace glass `rgba(...)` literals with `var(--c-glass-pill)`, `var(--c-glass-pill-condensed)`, and `var(--c-glass-drawer)`, adjust `.nav-link` padding to `0.45rem clamp(0.6rem, 0.9vw, 0.9rem)`, and change `@media (min-width: 960px)` to `@media (min-width: 1040px)`.
3. In `src/components/SiteFooter.astro`, pass `<Wordmark tone="light" instance="footer" />`.
4. In `src/scripts/nav.ts`, update line 33 to `const wide = window.matchMedia('(min-width: 1040px)');`.

- [ ] **Step 5: Remove `pointerenter` tab auto-switching in `src/scripts/motion.ts` & add 44px link height on standalone links**

1. In `src/scripts/motion.ts`, remove lines `63-65` (`if (finePointer) { btn.addEventListener('pointerenter', ...); }`) so tabs change only on `click` and keyboard navigation.
2. In `src/components/home/ContactStudio.astro`, use `background: var(--c-glass-card)` on `.contact-form-card` and add `.contact-direct :global(.text-link) { min-height: 44px; }` so the direct email link meets `44×44px` tap size.
3. In `src/layouts/SimpleLayout.astro`, add `.simple-body :global(.text-link) { min-height: 44px; }` so `/privacy`, `/terms`, and `/thank-you` text links meet `44×44px` tap size.

- [ ] **Step 6: Build and run Phase 2 verification**

Run: `cd /Users/douglashill/fun/html-portfolio && npm run build && node scripts/verify-audit.mjs --phase=2`
Expected: `npm run build` exits `0` and `AUDIT VERIFICATION PASSED (through phase 2)`.

---

### Task 3: Bundle Pruning, Tree-Shaken Motion-Gated WebGL, GPU Blur Removal & Editorial Distillation

**Resolves Audit Findings:** `#3` (`526 KB` non-tree-shaken `three` chunk + eager fetch under `prefers-reduced-motion`), `#8` (expensive `filter: blur(90px–95px)` aura layers + redundant nested `backdrop-filter`), `#12` (unused `@astrojs/react` / `react` / `react-dom` + repetitive 8× `.eyebrow-pill` formula).

**Files:**
- Modify: `astro.config.mjs:1-18`
- Modify: `package.json:16-30`
- Modify: `src/scripts/continuum3d.ts:1-60, 200-290`
- Modify: `src/scripts/motion.ts:15-30`
- Modify: `src/styles/global.css:170-210`
- Modify: `src/components/home/HeroStudio.astro:174-197, 312-375`
- Modify: `src/components/home/ContactStudio.astro:58-75`
- Modify: `src/components/home/CapabilitiesBento.astro:61-68`
- Modify: `src/components/home/EngagementFlow.astro:42-49`
- Modify: `src/components/home/StudioFaq.astro:37-44`
- Modify: `src/layouts/SimpleLayout.astro:17-22`

**Interfaces:**
- `initContinuum3D(stage: HTMLElement, canvas: HTMLCanvasElement, reducedMotion: boolean): ContinuumController | null` signature remains unchanged, but internally imports only named symbols from `'three'` and reads `--c-coral`, `--c-sky`, `--c-amber`, `--c-mint` from `getComputedStyle(document.documentElement)`.
- Adds `.section-kicker` utility in `src/styles/global.css` for calm editorial kickers on Warm Silk sections and subpages.

- [ ] **Step 1: Run Phase 3 test to confirm failure before implementation**

Run: `cd /Users/douglashill/fun/html-portfolio && node scripts/verify-audit.mjs --phase=3`
Expected: FAIL reporting `Unused React client.*.js bundle still emitted`, `Namespace import * as THREE still present`, and `Expensive filter: blur(90px+) layer still present`.

- [ ] **Step 2: Remove unused `@astrojs/react`, `react`, and `react-dom`**

1. In `astro.config.mjs`, remove `import react from '@astrojs/react';` and `integrations: [react()],`.
2. Uninstall unused packages cleanly:
   Run: `cd /Users/douglashill/fun/html-portfolio && npm uninstall @astrojs/react react react-dom @types/react @types/react-dom`

- [ ] **Step 3: Switch `continuum3d.ts` to named `three` imports & CSS-token color sync, and gate/defer loading in `motion.ts`**

1. In `src/scripts/continuum3d.ts`, replace `import * as THREE from 'three';` with explicit named imports:

```ts
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  TorusGeometry,
  TorusKnotGeometry,
  Vector2,
  WebGLRenderer,
} from 'three';
```

Read `:root` tokens at initialization (`const rootStyles = getComputedStyle(document.documentElement); const tok = (name: string, fb: string) => rootStyles.getPropertyValue(name).trim() || fb;`) to construct mode palettes from `--c-coral`, `--c-sky`, `--c-amber`, and `--c-mint`.

2. In `src/scripts/motion.ts`, skip loading `continuum3d.ts` when `reducedMotion` is `true` and schedule WebGL hydration cleanly via `requestIdleCallback` (with `setTimeout` fallback):

```ts
if (stageEl && canvasEl && !reducedMotion) {
  const boot3D = () => {
    import('./continuum3d')
      .then(({ initContinuum3D }) => {
        continuum = initContinuum3D(stageEl, canvasEl, false);
        if (continuum) {
          continuum.setMode(currentModeIndex);
          continuum.setScrollProgress(currentScrollProgress);
        }
      })
      .catch(() => {
        // Vector .continuum-fallback remains visible if WebGL fails.
      });
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(boot3D, { timeout: 300 });
  } else {
    globalThis.setTimeout(boot3D, 60);
  }
}
```

- [ ] **Step 4: Replace `filter: blur(90px–95px)` & nested `backdrop-filter`, and distill repetitive `.eyebrow-pill` kickers**

1. In `src/components/home/HeroStudio.astro`:
   - Remove `filter: blur(95px)` from `.hero-glow` and expand `.hero-glow--warm` / `.hero-glow--cool` dimensions (`44rem × 44rem`) using soft multi-stop `radial-gradient(circle, rgba(255, 107, 74, 0.16) 0%, rgba(255, 170, 92, 0.05) 38%, transparent 70%)` so identical ambient glow renders with zero Gaussian blur pass.
   - Remove `backdrop-filter` / `-webkit-backdrop-filter` from `.mode-pills` and `.mode-card` (which sit inside `.continuum-shell`).
2. In `src/components/home/ContactStudio.astro`, remove `filter: blur(90px)` from `.contact-glow` in favor of a soft zero-blur `radial-gradient(...)`.
3. In `src/styles/global.css`, add `.section-kicker`:

```css
.section-kicker {
  font-family: var(--font-editorial);
  font-style: italic;
  font-size: 1.25rem;
  line-height: 1.1;
  color: var(--c-coral-ink);
}

.surface-night .section-kicker {
  color: var(--c-coral);
}
```

4. Replace `<span class="eyebrow-pill">...</span>` with `<p class="section-kicker">...</p>` in `CapabilitiesBento.astro` (`Full-Spectrum Capabilities`), `EngagementFlow.astro` (`How Engagements Work`), `StudioFaq.astro` (`Common Questions`), and `SimpleLayout.astro` (`Douglas Hill Consulting`), reserving `.eyebrow-pill` for key dark-stage anchors (`#hero`, `#work`, `#about`, `#contact`).

- [ ] **Step 5: Build and verify Phase 3 + detector**

Run:
```bash
cd /Users/douglashill/fun/html-portfolio && npm run build && node scripts/verify-audit.mjs --phase=3 && /Users/douglashill/.gemini/config/plugins/impeccable/skills/impeccable/scripts/impeccable detect --json src
```
Expected: `npm run build` exits `0`, `AUDIT VERIFICATION PASSED (through phase 3)`, `impeccable detect --json src` outputs `[]`, and `dist/_astro/` contains zero `client.*.js` React chunks.

---

### Task 4: Canonical `DESIGN.md` & `.impeccable/design.json` Sidecar (`$impeccable document`)

**Resolves Audit Finding:** `#11` (stale root `DESIGN.md` still documenting discarded v1 static HTML/crimson site).

**Files:**
- Modify: `DESIGN.md`
- Create: `.impeccable/design.json`

**Interfaces:**
- Consumes finalized token values from `src/styles/tokens.css`.
- Produces canonical Stitch-compatible YAML frontmatter + 8-section Markdown body in `DESIGN.md` (`Overview`, `Colors`, `Typography`, `Layout`, `Elevation & Depth`, `Shapes`, `Components`, `Do's and Don'ts`) and `schemaVersion: 2` `.impeccable/design.json` sidecar with self-contained `ds-*` component previews.

- [ ] **Step 1: Run Phase 4 check to confirm failure before updating `DESIGN.md`**

Run: `cd /Users/douglashill/fun/html-portfolio && node scripts/verify-audit.mjs --phase=4`
Expected: FAIL reporting `DESIGN.md missing canonical YAML frontmatter` and `Missing .impeccable/design.json sidecar`.

- [ ] **Step 2: Write `DESIGN.md` and `.impeccable/design.json`**

1. Write `DESIGN.md` at `/Users/douglashill/fun/html-portfolio/DESIGN.md` with YAML frontmatter (`colors`, `typography`, `rounded`, `spacing`, `components` referencing `{colors.*}` and `{rounded.*}` strictly within Stitch's 8-prop component schema) and the 8 canonical sections (`## Overview` with **Creative North Star: "The Living Continuum"**, `## Colors`, `## Typography`, `## Layout`, `## Elevation & Depth`, `## Shapes`, `## Components`, `## Do's and Don'ts`) grounded in `tokens.css` and `PRODUCT.md`.
2. Write `.impeccable/design.json` (`schemaVersion: 2`) containing `extensions.colorMeta` (with 8-step OKLCH tonal ramps), `extensions.typographyMeta`, `extensions.shadows`, `extensions.motion`, `extensions.breakpoints`, 6 self-contained `ds-*` components (`Glow CTA Button`, `Ink CTA Button`, `Glass Pill Button`, `Navigation Pill`, `Capability Bento Card`, `Dark Glass Input Field`), and `narrative` matching `DESIGN.md` verbatim.

- [ ] **Step 3: Verify Phase 4**

Run: `cd /Users/douglashill/fun/html-portfolio && node scripts/verify-audit.mjs --phase=4`
Expected: `AUDIT VERIFICATION PASSED (through phase 4)`.

---

### Task 5: Final Batched Browser Verification & Re-Audit (`$impeccable polish` + `$impeccable audit`)

**Files:**
- Verify live rendering on `http://127.0.0.1:4321/` via one bounded `browser` subagent pass and inspect screenshots via `read_file`.

- [ ] **Step 1: Run full static build, audit verifier, and mechanical detector**

Run:
```bash
cd /Users/douglashill/fun/html-portfolio && npm run build && node scripts/verify-audit.mjs && /Users/douglashill/.gemini/config/plugins/impeccable/skills/impeccable/scripts/impeccable detect --json src
```
Expected: `0` Astro errors/warnings, `AUDIT VERIFICATION PASSED (through phase 99)`, and `[]` detector warnings.

- [ ] **Step 2: Run single batched `browser` subagent verification across desktop, zoom, reduced-motion, and mobile**

Send one verification brief to the existing `browser` subagent (`a93edff6-34a8-4b46-9332-4bf23e2af131`) covering all Review Focus cases in a single pass:
1. `1440×900` (`scrollY = 0`): verify solid coral italic `intelligence,` and solid ivory `.metric-value` counters, `0` console/CSP/network errors, `has-webgl === true`, and verify that brushing the pointer across `.mode-pills` without clicking does *not* swap `aria-selected`, while clicking & `ArrowRight` do.
2. `1040×900` with `document.documentElement.style.fontSize = '24px'` (`150%` text scale, then reset): verify `.header-pill` fits cleanly with `scrollWidth <= innerWidth`.
3. `375×667` with emulated `prefers-reduced-motion: reduce`: reload `/`, confirm `has-webgl === false`, `.continuum-fallback` SVG is visible, `continuum3d` JS chunk was *not* loaded in `performance.getEntriesByType('resource')`, and `<h1>` + `a[data-book-call="hero"]` sit above `667px`.
4. `320×640` and `/privacy`, `/terms`, `/thank-you`: verify `scrollWidth <= innerWidth` and standalone `.text-link` height `>= 44px`, then restore `http://127.0.0.1:4321/` at `1440×900` (`scrollY = 0`) for final screenshot inspection.

- [ ] **Step 3: Inspect final screenshot via `read_file` and publish updated `20/20` Impeccable Audit Score**

Read the host-verified screenshot from `BROWSER_HOST_FACTS`, confirm visual craft, update `task.md`, and report the final `20/20` Impeccable Audit summary.
