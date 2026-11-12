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
  check(!/0?\.01ms\s*!important/i.test(cssBundles), 'Global 0.01ms !important reduced-motion nuke still present in CSS');

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
  check(
    /!reducedMotion/.test(motionSrc) && /requestIdleCallback/.test(motionSrc),
    'WebGL import in motion.ts must be gated on !reducedMotion and deferred via requestIdleCallback',
  );
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

// Phase 5 checks: final code-review regression guards
if (maxPhase >= 5) {
  // 1. Astro scoped reduced-motion overrides must survive [data-astro-cid-*] specificity
  for (const sel of ['.bento-card[data-astro-cid-', '.case-card[data-astro-cid-', '.faq-toggle[data-astro-cid-', '.menu-btn-bars[data-astro-cid-']) {
    const escaped = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`@media\\s*\\(prefers-reduced-motion:\\s*reduce\\)\\{[^{}]*${escaped}`, 'i');
    check(re.test(cssBundles), `scoped-reduced-motion: missing @media (prefers-reduced-motion: reduce) override for ${sel}* in built CSS`);
  }
  check(
    /@media\s*\(prefers-reduced-motion:\s*reduce\)\{[\s\S]*?\.skip-link\{transition:none\}/i.test(cssBundles),
    'scoped-reduced-motion: missing .skip-link { transition: none } inside @media (prefers-reduced-motion: reduce)',
  );

  // 2. WCAG 1.4.4 200% text-zoom resilience: desktop nav breakpoint must use 65em, not px
  const siteHeaderSrc = fs.readFileSync(path.join(root, 'src/components/SiteHeader.astro'), 'utf8');
  const navTsSrc = fs.readFileSync(path.join(root, 'src/scripts/nav.ts'), 'utf8');
  check(
    siteHeaderSrc.includes('(min-width: 65em)') && !siteHeaderSrc.includes('(min-width: 1040px)'),
    'em-desktop-nav-breakpoint: SiteHeader.astro must use (min-width: 65em) instead of 1040px',
  );
  check(
    navTsSrc.includes('(min-width: 65em)') && !navTsSrc.includes('(min-width: 1040px)'),
    'em-desktop-nav-breakpoint: nav.ts must use (min-width: 65em) instead of 1040px',
  );

  // 3. Cross-browser backdrop-filter: standard unprefixed backdrop-filter must survive LightningCSS minification
  const webkitCount = (cssBundles.match(/-webkit-backdrop-filter:/gi) || []).length;
  const standardCount = (cssBundles.match(/(?:^|[;{])backdrop-filter:/gi) || []).length;
  check(
    standardCount >= 4 && standardCount >= webkitCount,
    `standard-backdrop-filter: expected >= 4 unprefixed backdrop-filter declarations (>= webkit ${webkitCount}), found ${standardCount}`,
  );

  // 4. Design-doc & SelectedWork 2x2 grid parity
  const selectedWorkSrc = fs.readFileSync(path.join(root, 'src/components/home/SelectedWork.astro'), 'utf8');
  check(
    !/\.work-grid\s*\{\s*grid-template-columns:\s*repeat\(3/.test(selectedWorkSrc),
    'design-doc-css-parity: SelectedWork.astro .work-grid still uses 3+1 orphan grid instead of documented 2x2 grid',
  );
  const designMd = fs.readFileSync(path.join(root, 'DESIGN.md'), 'utf8');
  const sidecarRaw = fs.readFileSync(path.join(root, '.impeccable/design.json'), 'utf8');
  check(
    designMd.includes('padding: "0.72rem 1.45rem"') &&
      designMd.includes('height: "3.25rem"') &&
      !designMd.includes('3.15rem') &&
      designMd.includes('65em'),
    'design-doc-css-parity: DESIGN.md measurements/breakpoints out of sync with shipped CSS',
  );
  check(
    sidecarRaw.includes('min-height: 3.25rem; padding: 0.72rem 1.45rem') &&
      !sidecarRaw.includes('3.15rem') &&
      sidecarRaw.includes('translateY(-4px)') &&
      sidecarRaw.includes('65em'),
    'design-doc-css-parity: .impeccable/design.json component CSS/breakpoints out of sync with shipped CSS',
  );
}

if (failures.length) {
  console.error('AUDIT VERIFICATION FAILED:\n' + failures.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}
console.log(`AUDIT VERIFICATION PASSED (through phase ${maxPhase})`);
