# Astro on AWS Amplify Hosting: verification notes and migration plan

Written 2026-11-10 for Douglas Hill Consulting LLC (`https://william.llcdouglashill.com`). Scope: move the site to Astro, host it on AWS Amplify Hosting, keep the Lambda lead API in `infra/lead-api/`.

The scope widened while this was being written. Douglas now wants a fully customizable front end. The decisions below reflect that:

- **All existing hand-written pages are ported to Astro** (same look, shared layout, not a redesign). Serving them unchanged from `public/` is kept as the fallback (§A3).
- **The CSP rule changes.** It is no longer "no inline script or style, plain external JS only". It is now: a Content Security Policy as strict as practical while allowing Astro components, TypeScript, and UI-framework islands.

Nothing in this file was deployed, installed, or changed in AWS. No Astro project was created. Read-only checks run for this note: package metadata from the npm registry, `curl -I` against the live site and one other site, DNS lookups, and public GitHub issue reads.

## How to read the sources

- **Fetched** means the page was retrieved in this session and the statement comes from its text.
- **Not fetched** means the URL is given for reference, but the statement comes from memory or inference.
- **Unverified** means no source in this session confirmed it. It must be tested on a real deployment.
- The AWS docs MCP tool and WebFetch were used. WebFetch returns a model summary of the page, not raw text, so short quotes from it are close to the page but not guaranteed verbatim. Where a fact was load-bearing, it was cross-checked (for example, the Node requirement against the npm registry).

---

## 0. Verdict on the working decisions

| Decision | Verdict |
|---|---|
| Astro in static output mode, no SSR | **Sound.** Nothing in scope needs SSR. The form posts to the separate Lambda API. See §A10 for what would force SSR. |
| Four new pages as Astro pages with a shared layout | **Sound.** |
| Existing pages kept unchanged in `public/` | **Superseded** by the scope change: they are now ported. Still workable as a fallback (§A3). One concrete trap: the repo **already has a `public/` folder** (`about.html`, `birthday-invite.html`, `contact.html`, `movie-ranking.html`). These are not on the live site and the old deploy notes excluded `public/*`. Astro copies everything in `public/` into the build output, so these files **would be published** unless they are moved out first. |
| Plain JS files loaded with `defer`, strict CSP with no inline script or style | **Superseded.** The new rule is a hash-based CSP that allows Astro's own inline scripts and styles (§A4). The three plain JS files still work, and keeping them as external files is the lowest-risk first step (§C). |
| GitHub remote `https://github.com/kast2L/html-portfolio.git` | Confirmed in `git remote -v`. **The repository is public**: the GitHub API answered `200` without authentication. That matters for Amplify web previews (§B15) and means everything committed is already readable by anyone. |
| Same-origin `/api/lead` with a secret `x-origin-verify` header added by the edge | **Not achievable on Amplify Hosting as documented.** Amplify custom headers are response headers. No documented way exists to add a request header to a reverse-proxy rewrite (§B10). The Lambda's secret check must change (§E). |

---

## Part A. Astro

### A1. Version, Node.js, project layout

- **Current stable major: Astro 7.** npm `astro@latest` is **7.4.10** (registry read, 2026-11-10). Astro 7.0 was announced on 2026-06-22 (https://astro.build/blog/astro-7/, seen in search results, not fetched). The October 2026 roundup lists 7.4 as the latest release (https://astro.build/blog/whats-new-october-2026/, fetched).
- **Node.js: `v22.23.4` or higher. Odd-numbered versions are not supported.** Source: https://docs.astro.build/en/install-and-setup/ (fetched). Cross-checked: `astro@7.4.10` declares `engines.node: ">=22.23.4"`, and `@astrojs/react@7.1.7` declares the same (npm registry). Node 24 (even-numbered) should satisfy this. Not tested.
- **Astro 7 changes that affect a port** (https://docs.astro.build/en/guides/upgrade-to/v7/, fetched): Vite 8. A Rust compiler that is stricter: "Templates that previously built without errors may now fail", for example unclosed tags or invalid nesting. `compressHTML` now defaults to `'jsx'`, so whitespace between inline elements can disappear. That is a visual-parity risk for ported pages. Set `compressHTML: true` to get the older behavior, or check each page. `src/fetch.ts` is a reserved file name.
- **Layout:** `src/pages/` (each `.astro` file becomes a route), `src/layouts/` (shared page shells), `src/components/`, `public/` (copied as-is), `astro.config.mjs` at the root. `publicDir` defaults to `"./public"`. "These files are always served or copied as-is, without transform or bundling." Source: https://docs.astro.build/en/reference/configuration-reference/ (fetched).

### A2. Clean URLs: `build.format` and `trailingSlash`

From the configuration reference (fetched):

- `build.format`: `'directory'` (default) writes `privacy/index.html`. `'file'` writes `privacy.html`. `'preserve'` writes files exactly as they sit in `src/pages`.
- The reference pairs them: `directory` with `trailingSlash: 'always'`, and `file` with `trailingSlash: 'never'`.
- `trailingSlash` (default `'ignore'`) controls the dev server and on-demand pages only. "Trailing slashes on prerendered pages are handled by the hosting platform."

What Amplify does (https://docs.aws.amazon.com/amplify/latest/userguide/redirect-rewrite-examples.html, fetched, "Trailing slashes and clean URLs"):

| Browser asks for | Address bar | Document served |
|---|---|---|
| `/about` | `/about` | `/about.html` |
| `/about` (when `about.html` is 404) | `/about/` | `/about/index.html` |
| `/about/` | `/about/` | `/about/index.html` |

**Setting for clean URLs with no trailing slash on Amplify: `build.format: 'file'` plus `trailingSlash: 'never'`.** Then `src/pages/privacy.astro` becomes `privacy.html`, and Amplify serves `/privacy` from it without a redirect. `'directory'` would make Amplify redirect `/privacy` to `/privacy/`, which is the URL form the PRD rules out.

Two side effects of `'file'`:
1. **`/privacy.html` also answers 200** with the same page. Each page needs a canonical link to the clean URL. This also keeps old links to `/services.html`, `/projects.html` and the rest working with no redirect rules.
2. **The planned 301 from `/thank-you.html` to `/thank-you` may loop.** `/thank-you` is served from `thank-you.html`. Whether Amplify re-applies the redirect rule to its own internal clean-URL lookup is **unverified**. Recommendation: do not add that 301. When `contact.html` is ported, change its Formspree `_next` value (today `https://william.llcdouglashill.com/thank-you.html`) to `/thank-you`. The old URL then keeps working as a `noindex` page. If Douglas still wants the 301, test it on a branch preview first.

An alternative that keeps `'directory'`: one 200 rewrite per page (`/privacy` to `/privacy/index.html`). It works in principle but adds a rule per page. Not recommended.

### A3. Plain `.html` in `public/` (now the fallback)

- Files in `public/` are copied byte-for-byte: "copied as-is, without transform or bundling" (configuration reference, fetched; images guide, fetched).
- `public/index.html` with no `src/pages/index.astro`: **no documented conflict.** Astro would emit no index route, so the copied file is the only `index.html`. With both present, the build output path collides, and which one wins is **unverified**. Never have both.
- The cleanest byte-for-byte fallback: move the existing pages and their assets into `public/` at the same paths (`public/index.html`, `public/services.html`, `public/css/styles.css`, `public/js/main.js`, `public/assets/...`). Add only the new pages under `src/pages/`. First move the current `public/` folder's contents out of the way (for example to `archive/old-public/`), or set `publicDir` to a new folder.
- The fallback is now plan B. Use it only if the port (§C) misses its parity checks and the new pages must ship first.

### A4. Inline scripts and styles, and CSP

**What Astro inlines:**
- **Stylesheets.** `build.inlineStylesheets`: `'auto'` (default) inlines stylesheets smaller than Vite's `assetsInlineLimit` (4 kB). `'never'` always writes external files. `'always'` inlines everything. Source: configuration reference and https://docs.astro.build/en/guides/styling/ (both fetched).
- **Processed `<script>` tags.** "If the script is small enough, Astro will inline it directly into the HTML." The page gives no threshold and no option to turn this off. Source: https://docs.astro.build/en/guides/client-side-scripts/ (fetched). That Vite's `build.assetsInlineLimit: 0` also stops script inlining is **unverified** (memory). Processed scripts become `type="module"` (same page).
- **`is:inline`** leaves a `<script>` or `<style>` exactly as written. It is not processed, so TypeScript and imports do not work in it (https://docs.astro.build/en/reference/directives-reference/, fetched). `<script is:inline defer src="/js/attribution.js">` renders as a plain external script tag. That is not inline code and needs no hash.
- **`define:vars` on a `<script>`** implies `is:inline` and always produces an inline script (directives reference, fetched). Avoid it on CSP pages.
- **The `style` attribute** in templates produces inline `style=""` attributes (styling guide, fetched). A hash cannot allow them. They need `'unsafe-hashes'` plus a hash, or `'unsafe-inline'` for attributes. Avoid them. `resume.html` has 6 today; replace them with classes during the port.
- **`<Image />`** with a responsive layout adds `style="--fit: cover; --pos: center;"` to the `<img>` (images guide, fetched). The Astro 6 release notes say responsive image styles are covered by the CSP feature through classes and `data-*` attributes (https://astro.build/blog/astro-6/, fetched). Check the built output.
- **Islands.** Hydrated framework components need Astro's small island loader. It is emitted as an inline `<script>` and an inline `<style>` for `astro-island` (memory, **unverified** in this session, but the CSP docs' mention of islands under `strictDynamic` is consistent with it). This is why "no inline script at all" and "islands" cannot both hold without hashes.
- **Dev toolbar.** It is dev-only (`devToolbar.enabled`, default `true`, configuration reference, fetched). That it never appears in `astro build` output is from memory. Check by grepping `dist/`.
- **View transitions.** `<ClientRouter />` is a JavaScript router (https://docs.astro.build/en/guides/view-transitions/, fetched). It is **not supported** by Astro's CSP feature (configuration reference, fetched). Native cross-document view transitions (CSS only, no router) are supported by browsers and need no script.

**Astro's built-in CSP** (configuration reference, fetched; https://docs.astro.build/en/reference/experimental-flags/csp/, fetched; https://astro.build/blog/astro-6/, fetched):
- Config key `security.csp`, added in astro@6.0.0. **Stable since Astro 6.** The Astro 6 post names it stable. In Astro 5.9 it was `experimental.csp`.
- It hashes the scripts and styles Astro emits (SHA-256 by default, configurable) and writes **a `<meta http-equiv="content-security-policy">` element** in each page's `<head>`. Static pages are hashed at build time.
- Options: `algorithm`, `directives` (other directives such as `img-src`), `scriptDirective` and `styleDirective` (`resources` for hosts, `hashes` for your own inline code, `strictDynamic`). Since 7.1, `styleDirective` entries can take `kind: "element" | "attribute"`.
- **Not covered:** external scripts and styles (allow them by host in `resources`, or give hashes), `<ClientRouter />`, Shiki code highlighting, and `astro dev`. Test with `astro build` and `astro preview`. If `'unsafe-inline'` is in a directive, Astro emits no hashes for that directive.
- `strictDynamic` needs browsers with import-map integrity support (Chrome 127, Firefox 138, Safari 18). Under `'strict-dynamic'`, host allowlists are ignored. The Google tag loader that `analytics.js` injects would then need another route. Recommendation: do not use `strictDynamic`. Allow `https://www.googletagmanager.com` by host.

**Meta tag plus Amplify headers.** When a page has a CSP header and a CSP meta tag, the browser enforces both. A resource must pass both policies. That comes from the CSP specification (memory, not fetched in this session). Practical consequences:
- A meta CSP cannot carry `frame-ancestors`, `report-uri` or `report-to`, or `sandbox`, and cannot be report-only (CSP spec, memory). Those go in the `customHttp.yml` header.
- If the header has its own `script-src` or `default-src` without the hashes, it blocks the hashed inline scripts. So either leave `script-src`, `style-src` and `default-src` out of the header and let the meta tag carry them, or give the header a permissive `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com` and let the meta tag narrow it. The first is cleaner.
- Generating per-page hashes into `customHttp.yml` at build time is possible in principle. Whether Amplify reads a `customHttp.yml` produced in the build, rather than the one committed at the repo root, is **unverified**. Not recommended.

**Strictest realistic policy:**

(i) Pages with no islands (all ported pages and the four new ones, as recommended in §C). Meta from Astro:
```
default-src 'self';
script-src 'self' https://www.googletagmanager.com [Astro hashes, if any];
style-src 'self' [Astro hashes, if any];
img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com;
connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com;
font-src 'self';
form-action 'self';
base-uri 'self';
object-src 'none';
upgrade-insecure-requests
```
Plus the header: `frame-ancestors 'none'`. This assumes fonts are self-hosted (§A11). With Google Fonts, add `https://fonts.googleapis.com` to `style-src` and `https://fonts.gstatic.com` to `font-src`. No `'unsafe-inline'` and no `'unsafe-eval'` anywhere. The GA4 hosts follow the PRD (§7.3). Google's CSP guidance was not fetched in this session either.

(ii) Pages with islands: the same policy. The only difference is that Astro adds hashes for the island loader script and style. React's production build does not need `'unsafe-eval'` (memory, **unverified**; check the console). Avoid libraries that inject `<style>` at runtime (most CSS-in-JS). They would need `'unsafe-inline'` in `style-src`.

(iii) The exception: `contact.html` today uses the Calendly popup widget. That means a script and style from `assets.calendly.com`, a `calendly.com` frame, and an `onclick`. `security.csp` is project-wide config. Per-page additions from `.astro` code are possible through a runtime CSP API (memory, **unverified** for static pages). Options: (a) replace the popup with a plain link that opens Calendly, as the landing page already does (smallest CSP, but a behavior change Douglas must approve); (b) add the Calendly hosts site-wide (looser for every page). Recommendation: (a).

**Settings that guarantee the "no unhashed inline" outcome:**
```js
// astro.config.mjs (proposal; not created)
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://william.llcdouglashill.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'never' },
  compressHTML: true, // keep pre-v7 whitespace behavior for visual parity; review later
  integrations: [
    react(),
    sitemap({ filter: (page) => !page.includes('/lp/') && !page.includes('/thank-you') }),
  ],
  security: {
    csp: {
      scriptDirective: { resources: ["'self'", 'https://www.googletagmanager.com'] },
      styleDirective: { resources: ["'self'"] },
      directives: [
        "default-src 'self'",
        "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com",
        "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
        "font-src 'self'",
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        'upgrade-insecure-requests',
      ],
    },
  },
});
```
No config option "guarantees" zero inline code, because islands and small processed scripts are inlined by design. The guarantee comes from two things: `security.csp` hashes everything Astro emits, and a post-build check (§C, `scripts/check.sh`) fails the build if `dist/` contains any inline `<script>` or `<style>` whose hash is not in that page's meta policy, any `style=""` attribute, any `on*=` attribute, or `<ClientRouter`. That `'self'` is not already in Astro's default resources, so it must be listed, is **unverified**. Listing it does no harm.

### A5. Referencing `public/` files

Files in `public/` are served at `/`, so reference them with root-absolute paths (`/js/attribution.js`, `/assets/og-image.png`). They are not renamed or hashed: "always served or copied as-is" (configuration reference, fetched). Files imported from `src/` (CSS, scripts, images through `astro:assets`) are bundled and get hashed names under `/_astro/` (memory; matches the bundling statements in the styling and scripts guides). Existing pages use relative paths (`js/main.js`). With `build.format: 'file'` and top-level pages these still resolve. The port should still switch them to root-absolute paths, as the markup contract requires.

### A6. Sitemap

`@astrojs/sitemap` (https://docs.astro.build/en/guides/integrations-guide/sitemap/, fetched) needs `site` in the config. It writes `sitemap-index.xml` and `sitemap-0.xml`. It includes every page by default. **It does not read `noindex`.** Exclude pages with `filter()`, as in the config above. How it renders URLs under `build.format: 'file'` is not documented on that page. Check `sitemap-0.xml` after the first build (expect `/privacy`, not `/privacy.html`). If it uses the integration, `robots.txt` must point to `/sitemap-index.xml`.

A hand-written `public/sitemap.xml` is also fine for about 10 pages, and it is explicit. Recommendation: use the integration with the filter. Then add a check that fails the build if `/lp/` or `/thank-you` appears in any sitemap file. Delete the root `sitemap.xml`. Either way, the existing sitemap lists `.html` URLs, and those must change to the clean canonical form.

### A7. UI framework islands

- **Adding React:** `npx astro add react` installs `@astrojs/react` and edits the config (memory. The framework-components page, fetched, points to the integrations guide for setup but does not show the command). `@astrojs/react` is at 7.1.7 (npm). Vue (`@astrojs/vue`) and Svelte (`@astrojs/svelte`) are added the same way (memory, not fetched).
- **Default: no JavaScript.** "By default, your framework components will only render on the server, as static HTML" (https://docs.astro.build/en/guides/framework-components/, fetched).
- **Directives** (framework-components and directives reference, both fetched): `client:load` imports the JS when the page loads. `client:idle` hydrates after load and `requestIdleCallback`, with an optional `timeout`. `client:visible` waits until the component scrolls into view. `client:media={query}` waits for a media query. `client:only="react"` skips server rendering and renders only in the browser; the framework name is required.
- **JS cost:** each island ships its component code plus the framework runtime. The runtime is sent once per page even with several islands (fetched). Sizes: React plus React DOM is roughly 45–60 kB gzipped. Preact is a few kB. Svelte and Vue compile to small runtimes. These figures are **memory, unverified**. Measure with `astro build` output.
- **Recommendation: React as the default for future interactive components.** No strong reason exists to pick another. React has the largest ecosystem and is the most hireable skill. Douglas's Power Platform work (Code Apps, PCF) uses React and TypeScript. The cost is paid only on pages that use an island. If a public page ever needs a tiny widget and the React runtime breaks the §8.1 load budget, Preact is the fallback. Use islands only where a component needs state on the client. Do not wrap static content in React.

### A8. TypeScript

Astro ships three tsconfig presets: `base`, `strict`, `strictest`. The docs recommend `strict` or `strictest` for TypeScript code. `astro build` does **not** type-check. `astro check` does, and the docs suggest the build script `astro check && astro build` (https://docs.astro.build/en/guides/typescript/, fetched). `astro check` uses the `@astrojs/check` package plus `typescript` (memory; `@astrojs/check` is at 0.9.12 on npm). **Recommendation: the `strict` preset, and `astro check` in the Amplify build**, so a type error stops the deploy. Expect roughly 10–30 seconds of extra build time (estimate).

### A9. Styling, Tailwind, design tokens

- `<style>` in a component is scoped by default. Use `:global()` or `is:global` to escape. A stylesheet imported in a component's frontmatter is bundled. Stylesheets in `public/` can be loaded with a plain `<link>` and are not processed (styling guide, fetched).
- **Tailwind:** for Astro 5.2 and later, `npx astro add tailwind` installs the official Tailwind Vite plugin (`@tailwindcss/vite`, now 4.3.5 on npm). Then `@import "tailwindcss";` goes in a CSS file such as `src/styles/global.css`. The old `@astrojs/tailwind` integration is described as needed only for "legacy Tailwind 3 compatibility" (styling guide, fetched).
- **Design tokens: one source.** Move `css/styles.css` to `src/styles/global.css` unchanged at first. Import it once in `src/layouts/BaseLayout.astro`. Its `:root` custom properties stay the only place tokens are defined (77 `var(--...)` uses in the file today). Page-specific CSS (each existing page's inline `<style>` block, `lp.css`, `legal.css`) becomes either a CSS file imported by that page or a scoped `<style>` in the page. For parity, prefer imported CSS files over scoped styles at first. Scoped styles add `data-astro-cid-*` attribute selectors, which raise specificity and can change the cascade (memory).
- **Tailwind: not now.** The site's look is already written in plain CSS with tokens. Adding Tailwind during a parity port adds a second styling system and a second token list. If Douglas adds it later, map Tailwind theme values to the existing CSS variables (Tailwind v4's `@theme` block can reference `var(--...)`; memory, **unverified**) so `global.css` stays the source.

### A10. Static output versus SSR on Amplify

Static output stays right. Every page is the same for every visitor. The only dynamic part, the lead form, is handled by the Lambda API.

What would force on-demand rendering (SSR): per-request personalization or A/B tests decided on the server; Astro API endpoints such as handling the form in Astro instead of Lambda; logins and sessions; server islands (`server:defer`); on-demand image transforms (`/_image` needs a server, per the images guide, fetched); reading secrets at request time.

What it requires on Amplify: the **third-party, community-maintained** adapter `astro-aws-amplify`, `output: "server"`, and a different `amplify.yml` (`baseDirectory: .amplify-hosting`, `node_modules` moved into `.amplify-hosting/compute/default`). Source: https://docs.astro.build/en/guides/deploy/aws/ (fetched). Manual deploys are not supported for SSR apps (https://docs.aws.amazon.com/amplify/latest/userguide/manual-deploys.html, fetched). Cost: 500,000 SSR requests and 100 GB-hours free a month during the free tier, then $0.30 per million requests and $0.20 per GB-hour (https://aws.amazon.com/amplify/pricing/, fetched). That is cents at this traffic. The real cost is reliance on a community adapter and a server runtime to keep current.

### A11. Other features, one or two lines each

- **Content collections and MDX:** typed Markdown or MDX content in `src/content/`, useful for case studies or a future blog. https://docs.astro.build/en/guides/content-collections/ and https://docs.astro.build/en/guides/integrations-guide/mdx/ (**not fetched**). Astro 7 renders Markdown and MDX with a new engine (Sätteri) by default (upgrade guide, fetched).
- **Images:** `<Image />` and `<Picture />` from `astro:assets` optimize images in `src/` at build time with Sharp for prerendered pages. Static hosting works because the output is plain files. Images in `public/` are not processed (images guide, fetched). That Sharp installs and runs on Amplify's Amazon Linux 2023 build image is **unverified**. Test on the first build. Good first use: the 59 kB portrait and a responsive `srcset`.
- **View transitions:** native cross-document transitions need no JavaScript (view-transitions guide, fetched). Avoid `<ClientRouter />`: it is not CSP-compatible, it forces re-initializing scripts after each navigation, and calm, restrained motion is the brand anyway.
- **Fonts:** the Fonts API (`fonts` in config, `<Font />` from `astro:assets`, added in 6.0) downloads and self-hosts fonts from providers such as Google, generates fallbacks, and adds preload hints (configuration reference and Astro 6 post, both fetched). The configuration reference lists it as a regular option, not experimental. It only includes weight 400 unless weights are listed. It removes Google from the CSP and from the privacy page. Whether `<Font />` emits inline `<style>` (which the CSP feature would then hash) is **unverified**. **Recommendation:** use it for Newsreader (400, 500, 600, 400 italic) and Inter (400, 500, 600) in the port, and compare rendering against the live site.
- **Environment variables:** only `PUBLIC_`-prefixed variables reach client code. With `astro:env`, `context: "client"` variables are bundled into the browser JS, and `context: "server", access: "secret"` variables are never bundled. In a static build, values are replaced at build time (https://docs.astro.build/en/guides/environment-variables/, fetched). So anything `PUBLIC_` (for example a GA4 ID) ends up in `dist/` and is public by design. Never give a secret a `PUBLIC_` name. A static site has no runtime secrets, so it should need none at build time either.

---

## Part B. AWS Amplify Hosting

### B7. Deploying a static Astro site

- Connect the GitHub repo in the Amplify console. Amplify reads build settings from the console or from an `amplify.yml` at the repo root. A committed file overrides the console (https://docs.aws.amazon.com/amplify/latest/userguide/build-settings.html, fetched). The GitHub connection is made through the Amplify GitHub App (memory).
- Astro's documented static spec (https://docs.astro.build/en/guides/deploy/aws/, fetched): `npm ci` in `preBuild`, `npm run build` in `build`, `baseDirectory: /dist`, cache `node_modules/**/*`.
- Spec fields (https://docs.aws.amazon.com/amplify/latest/userguide/yml-specification-syntax.html, fetched): `artifacts.baseDirectory` is "the directory in which your build artifacts exist". `artifacts.files` selects what to deploy. Cache paths are relative to the project root.
- **Node version:** set it in the build, not by default. Options: live package updates in the console (an exact version; "latest" makes Node builds fail), or `nvm` commands (https://docs.aws.amazon.com/amplify/latest/userguide/custom-build-image.html, fetched; https://docs.aws.amazon.com/amplify/latest/userguide/ssr-supported-features.html, fetched, which lists Node 20, 22 and 24 as supported for Amplify compute). Whether the build image's preinstalled Node 22 is at least 22.23.4 is **unverified**. Install it explicitly.
- **No monorepo or `appRoot` setting is needed** if the Astro project sits at the repo root. If Douglas prefers the site in a subfolder (for example `site/`), Amplify's monorepo setting is needed and `customHttp.yml` stays at the repo root (custom headers YAML reference, fetched).
- **Manual deploys without Git** are supported for static sites: drag-and-drop a zip of the build output, or deploy from S3 or a URL. Zip limit 5 GB (manual-deploys page, fetched). Not recommended here. It loses the "build from Git only" protection in §B12.

Proposed `amplify.yml` (not created):
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm install 22   # unverified that this resolves to >= 22.23.4; pin an exact version once known
        - nvm use 22
        - node --version
        - npm ci
    build:
      commands:
        - npx astro check
        - npx astro build
        - bash scripts/check.sh dist   # fails the build, so nothing deploys
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### B8. Custom headers (`customHttp.yml`)

Sources: https://docs.aws.amazon.com/amplify/latest/userguide/custom-header-YAML-format.html and https://docs.aws.amazon.com/amplify/latest/userguide/setting-custom-headers.html (both fetched).
- Set headers in the console, or in `customHttp.yml` at the repo root. The file overrides the console. A redeploy is needed to apply changes.
- Format: `customHeaders:` is a list of `pattern:` entries, each with `headers:` as `key`/`value` pairs. Example patterns: `'**'`, `'**/*'`, `'*.json'`, `'/path/*'`.
- **Different headers per path: yes.** Patterns are globs. Two things are **unverified**: how overlapping patterns combine (for example `**` and `/lp/*` both setting `Content-Security-Policy`), and whether a pattern matches the request path (`/lp/process-automation`) or the served file (`/lp/process-automation.html`). To stay safe, give each header key exactly one matching pattern, and keep the per-page CSP in Astro's meta tag (§A4), so the header file needs no per-path split.
- `Cache-Control` custom headers apply only to `200` responses. The default edge `s-maxage` is described as 600 seconds (setting-custom-headers page).
- Limits on header count or value length: **not documented on the pages fetched**.
- **HSTS by default:** **not documented.** One Amplify-adjacent site returned `strict-transport-security: max-age=31536000; includeSubDomains` (`docs.amplify.aws`, `curl -I`), but that site may set it itself. Set HSTS explicitly.

Proposed `customHttp.yml` (not created):
```yaml
customHeaders:
  - pattern: '**'
    headers:
      - key: 'Strict-Transport-Security'
        value: 'max-age=300'          # raise to 31536000 after a week, as PRD §7.3 says
      - key: 'X-Content-Type-Options'
        value: 'nosniff'
      - key: 'Referrer-Policy'
        value: 'strict-origin-when-cross-origin'
      - key: 'X-Frame-Options'
        value: 'DENY'
      - key: 'Permissions-Policy'
        value: 'camera=(), microphone=(), geolocation=(), payment=()'
      - key: 'Content-Security-Policy'
        value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'"
  - pattern: '/_astro/*'
    headers:
      - key: 'Cache-Control'
        value: 'public, max-age=31536000, immutable'   # hashed file names
```

### B9. Redirects and rewrites

Sources: https://docs.aws.amazon.com/amplify/latest/userguide/redirects.html and the examples page (both fetched).
- Rule fields: `source`, `target`, `status` (`301`, `302`, `200` rewrite, `404`), `condition` (country code). Rules apply top-down.
- Rules live in the console (Hosting, Rewrites and redirects, with a JSON editor) or are set through the API as `customRules` on `UpdateApp` (https://docs.aws.amazon.com/sdk-for-kotlin/api/latest/amplify/aws.sdk.kotlin.services.amplify.model/-update-app-request/custom-rules.html, found in search, not fetched). No repo file for redirects is documented; a long-open GitHub issue asks for one (aws-amplify/amplify-hosting #18, title read via the GitHub API). Keep a copy of the JSON in the repo (for example `infra/amplify/rewrites.json`) and apply it with the CLI, so the rules are reviewed like code.
- `<*>` is allowed once, at the end of the source. Query strings are forwarded on 301 and 302, unless the source pins a query value or the target has its own query string. UTMs survive.
- 301 example: `{"source": "/thank-you.html", "status": "301", "target": "/thank-you", "condition": null}`. See §A2 for why this one is **not** recommended with `build.format: 'file'`.
- Clean URLs: built in, as in the table in §A2.
- **404:** the examples show `{"source": "/<*>", "status": "404", "target": "/404.html"}`. New Amplify apps are often created with a default SPA rule that rewrites everything to `/index.html` (memory, **unverified**). That rule must be replaced, or unknown paths return the home page with 200. Whether Amplify serves `404.html` automatically without a rule is **unverified**. Add the rule.
- Order: the `/api/<*>` proxy rule first, the 404 catch-all last.

Proposed rules (not applied):
```json
[
  { "source": "/api/<*>", "status": "200", "target": "https://<api-id>.execute-api.<region>.amazonaws.com/api/<*>", "condition": null },
  { "source": "/<*>", "status": "404", "target": "/404.html", "condition": null }
]
```

### B10. Reverse-proxy rewrite to the API

What the docs say:
- A `200` rewrite to an external `https://` URL is a reverse proxy. "HTTPS is the only protocol supported for reverse proxies" (examples page, fetched).
- Reverse-proxy paths use the Amplify-Default or Amplify-DefaultNoCookies cache policy: minimum and default TTL 0, cache key includes `Authorization`, `Accept`, `CloudFront-Viewer-Country`, `Host`, and query strings (https://docs.aws.amazon.com/amplify/latest/userguide/cache-configuration-type.html, fetched). With TTL 0 and `Cache-Control: no-store` from the function, nothing is cached.
- Since 2024, Amplify forwards more CloudFront viewer headers to origins, such as `user-agent`, `referer`, and `cloudfront-viewer-*`, and Brotli is on for all apps (https://aws.amazon.com/blogs/mobile/cdn-caching-improvements-for-better-app-performance-with-aws-amplify-hosting/, found in search, chunk read, page not fetched).
- Amplify custom headers are **response** headers: "Custom HTTP headers enable you to specify headers for every HTTP response" (https://docs.aws.amazon.com/amplify/latest/userguide/custom-headers.html, search chunk).

Answers to each question:

| Question | Answer | Status |
|---|---|---|
| POST with a JSON body forwarded? | No AWS page states it. An AWS blog describes routing `/api/<*>` from an SPA to a backend API this way (https://aws.amazon.com/blogs/mobile/resolve-single-page-application-integration-issues-with-legacy-apis-that-do-not-support-cors-using-aws/, search chunk). An Amplify team member on GitHub issue #527 advised a 200 rewrite for API calls including POST. Likely yes. | **Unverified.** First test on a branch preview. |
| Which request headers reach the target? | Not documented. GitHub issue #2316 (title read: "ACCEPT header stripped off by Amplify before forwarding request to target server", closed) and #2459 (closed in 2024 with the header-forwarding launch) show the forwarded set has changed over time. Whether `Content-Type` and `Origin` arrive, and what `Host` is sent, is not documented. Issue #87 (open) asks to rewrite `Host` to the target, which suggests the original `Host` may be sent. API Gateway's default endpoint routes on `Host`, so a wrong `Host` would give 403. | **Unverified. This is the biggest open risk.** |
| Query strings preserved? | Documented for 301 and 302. Not stated for 200 proxies. | **Unverified.** Not needed: `POST /api/lead` uses no query. |
| Timeout | An Amplify team member wrote on GitHub issue #1711 (2021-04-14): "Our current reverse proxy timeout is 15 seconds with up to 3 retries. Additionally there is a cloudfront distribution timeout of 30 seconds." Not in the official docs. | **Unverified for 2026.** The Lambda timeout is 10 s, under 15 s. **Retries on a POST could store a lead twice.** See §E. |
| Body-size limit | Not documented for Amplify. | **Unverified.** The form caps bodies at 10 KB, far under any plausible limit. |
| Add a custom request header (the `x-origin-verify` secret)? | **No documented way.** Rewrite rules have only `source`, `target`, `status`, `condition`. Custom headers are response headers. | Not possible as documented. |

**Ways to stop direct calls from bypassing the site, since the secret header cannot be added:**

| Option | How | Tradeoffs |
|---|---|---|
| A. Amplify same-origin proxy; accept that direct calls exist | `/api/<*>` rewrite. The function checks `Origin` when present, plus honeypot, timing, field limits, route throttling (1/s, burst 5), and reserved concurrency 2. | Simplest. CSP stays `connect-src 'self'`, no CORS. A non-browser caller can fake `Origin` and post straight to `execute-api`, then store junk and trigger emails, up to the throttle. Cost stays bounded at about $3–$5 for a month of maximum abuse (PRD §7.2 arithmetic). Depends on the proxy passing POST, `Content-Type`, and a workable `Host`. |
| B. Own CloudFront distribution in front of Amplify | Keep the PRD's CloudFront design (an `/api/*` behavior with the origin custom header) and use the Amplify app as the default origin. | Keeps the secret header. But it means two CDNs, two sets of headers and cache rules, and CloudFront needs the right `Host` for Amplify's routing. Amplify says its own CloudFront URL answers 404 because it routes by host name (https://docs.aws.amazon.com/amplify/latest/userguide/troubleshooting-custom-domains.html, fetched). Brings back most of the complexity the move was meant to remove. |
| C. Cross-origin call with CORS | The browser posts to `https://<api-id>.execute-api.<region>.amazonaws.com/api/lead`, or to an API custom domain. The HTTP API allows exactly `https://william.llcdouglashill.com`. CSP `connect-src` adds that host. | Does not depend on Amplify proxy behavior. Adds a CORS preflight (an extra round trip on submit), puts an AWS host in the CSP, and gives the same bypass exposure as A. CORS only stops other web pages, not scripts. |
| D. Secret in the proxy target path | For example `target: https://<api>/api/<secret>/lead`. | **Rejected.** Amplify warns not to put secrets in paths because they show in its access logs (examples page, fetched). |

**Recommendation for a low-volume lead form: A, with C as the fallback.** The secret header protected against junk leads and emails, not against cost, and throttling already bounds cost. At a few submissions a day, junk is visible and easy to delete. The honeypot and timing checks catch simple bots. Add an AWS Budgets alert (Douglas's call, PRD §7.2). If the branch-preview test shows that the proxy drops the body or `Content-Type`, or that API Gateway rejects the forwarded `Host`, switch to C. Do not adopt B for this site.

### B11. Moving `william.llcdouglashill.com` to Amplify

What was found (read-only, 2026-11-10):
- **DNS is in Route 53.** `llcdouglashill.com` uses `awsdns` name servers (`dig NS`). `william` has no CNAME (`dig CNAME` empty), so it is most likely a Route 53 alias A/AAAA record to the CloudFront distribution. Live responses come through CloudFront with `server: AmazonS3`.
- Whether that hosted zone is in the **same AWS account** that will hold the Amplify app is **unknown**. Check it. In the same account, Amplify can create the DNS records itself. Otherwise the records are added by hand.

What the docs say:
- A host name can be attached to only one CloudFront distribution at a time. If it is still on the old one, Amplify fails with `CNAMEAlreadyExistsException`. Fix: remove it from the old distribution's alternate domain names (https://docs.aws.amazon.com/amplify/latest/userguide/troubleshooting-custom-domains.html, fetched).
- Certificates: an Amplify-managed ACM certificate (validated by a CNAME record, valid 13 months, auto-renews while the validation record stays), or a custom ACM certificate (https://docs.aws.amazon.com/amplify/latest/userguide/custom-domains.html and the third-party DNS page, both fetched). If CAA records exist, they must allow Amazon's CA (troubleshooting page, fetched).
- By default, Amplify proposes both the apex and `www`, with a redirect from root to `www`. Change this to the `william` subdomain only (third-party DNS page, fetched). **This matters:** the apex likely carries other records (email, for example). Amplify must not take it over.
- Verification and propagation for third-party DNS can take up to 48 hours (third-party DNS page, fetched). For Route 53 it is usually faster. No time is documented.

Cutover steps. **[PROD]** marks steps that change production.
1. Build and approve the site on the Amplify branch URL (`https://main.<app-id>.amplifyapp.com`), password-protected (§B15). Run every check in §C step 10 there.
2. Record the old setup for rollback: distribution ID, alternate domain names, ACM certificate ARN, and the exact Route 53 record for `william` (type, alias target). Read-only.
3. Pick a quiet time. Optionally prepare a custom ACM certificate in `us-east-1` for `william.llcdouglashill.com`. The existing CloudFront certificate may already cover it. That Amplify needs `us-east-1` for custom certificates is memory, **unverified**. Using a ready certificate removes the validation wait from the outage window.
4. **[PROD] Outage starts.** Remove `william.llcdouglashill.com` from the old distribution's alternate domain names. DNS still points there, so visitors get CloudFront errors until step 6.
5. **[PROD]** In Amplify, under Hosting, Custom domains, add `llcdouglashill.com`. Map only the `william` subdomain to the production branch. Untick apex and `www`. Choose the certificate. If the zone is in the same account, let Amplify write the records. Otherwise add the validation CNAME and change the `william` record to the value Amplify shows.
6. **[PROD]** Wait for status AVAILABLE. Check `https://william.llcdouglashill.com/` and the §C step 10 list. **Outage ends.**
7. Keep the old distribution and bucket untouched (disabled is fine) for 30 days.

**Expected downtime:** step 4 to step 6. Estimate 5–60 minutes with Route 53 and a ready certificate, longer if certificate validation stalls. **Unverified.** No documented zero-downtime path exists, because Amplify manages its own distribution.

**Rollback:** delete the domain from the Amplify app. Re-add the alternate domain name and certificate on the old distribution. Point the Route 53 record back at the old distribution's `dxxxx.cloudfront.net` alias. Wait about an hour if CloudFront still holds the name (troubleshooting page: "try again after at least one hour"). Rollback has its own outage of similar length.

What must be known about DNS: which account holds the hosted zone; who can edit it; the current `william` record; any CAA records; whether other services use `william` or the apex (email, verification TXT records). Leave all of those untouched.

### B12. What can be published, and what can leak

- Only the build artifacts are published: `artifacts.baseDirectory` (`dist`) filtered by `artifacts.files` (build spec reference, fetched). Anything outside `dist/` is never served. That covers `infra/`, `marketing-launch/`, `docs/`, `scripts/` and `lightroom-sync/`. An Astro build places only `public/` copies and built pages and assets in `dist/`. So **`public/` is the one way a stray file gets published.** Hence the warning about the existing `public/` folder (§0).
- Amplify builds from what is committed to Git. `lightroom-sync/` (including `.adobe-credentials.json`) is **not tracked** (`git ls-files` shows nothing under it, and the file is in `.gitignore`), so Amplify never sees it. Note: the repo is public, so everything that is committed is already public on GitHub.
- **Environment variables:** Amplify encrypts them but says "Don't use environment variables to store secrets", and points to Secrets management or SSM Parameter Store (https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html, search chunk). Astro inlines `PUBLIC_` values into the browser bundle (§A11). This site needs no secrets at build time. Keep it that way.
- **Build logs:** they show every command and its output. Never `echo` a variable, and avoid commands that print config. Whether Amplify masks secret values in logs is **unverified**.
- **Access logs:** Amplify keeps access logs that include full URLs (examples page warning, fetched). The privacy page's hosting section must name Amplify and say how long these logs are kept. Retention is **unverified**.
- **Source maps:** Astro does not emit them by default (memory). The post-build check should fail on any `*.map` file.

### B13. Pricing and estimate

From https://aws.amazon.com/amplify/pricing/ (fetched 2026-11-10; no region is stated on the page):

| Item | Free tier ("Free for 12 months") | After |
|---|---|---|
| Build (Standard, 8 GB, 4 vCPU) | 1,000 minutes a month | $0.01 per minute |
| Storage on CDN | 5 GB a month | $0.023 per GB-month; "recurs until the app is deleted" |
| Data transfer out | 15 GB a month | $0.15 per GB |
| SSR requests | 500,000 a month | $0.30 per million |
| SSR duration | 100 GB-hours a month | $0.20 per GB-hour |
| WAF (optional) | none | $15 a month per app, plus WAF charges |

No per-request charge is listed for static content. New customers since 2025-07-15 can get up to $200 in Free Tier credits, used within 12 months.

**Estimate (an estimate, not a quote).** Assumptions: 1,000 page views a month at about 200 KB each (HTML, CSS, JS, portrait; fonts self-hosted), so about 0.2 GB. 3 builds a week (about 13 a month) at about 2 minutes each, with `astro check`. A build output of about 5 MB (pages, CSS and JS, PDF résumé, images; the repo's publishable files total 4.2 MB today), stored once per deploy.
- Inside the free tier: **$0.**
- After it: builds 26 min × $0.01 = $0.26. Transfer 0.2 GB × $0.15 = $0.03. Storage: 13 deploys × 5 MB ≈ 0.07 GB added a month, about 0.8 GB after a year, × $0.023 ≈ $0.02. **About $0.31 a month**, plus the lead API's under $0.01 (PRD §7.2). Whether every old deploy really keeps accruing storage is **unverified**. The page's wording suggests it does.
- For comparison, the earlier hosting note estimated $0.15 a month for 4 builds. The difference here is build count.

### B14. HTTPS, caching, HTTP/2 and HTTP/3, compression

- **HTTP to HTTPS:** the Amplify docs pages fetched do not say it in so many words. The third-party DNS page says that once ownership is validated, "all traffic will be served using HTTPS/2". The FAQ says Amplify generates HTTPS for all sites (https://aws.amazon.com/amplify/faqs/, search chunk). `http://docs.amplify.aws/` returned `301` to `https://` from CloudFront (`curl -I`), but it is not certain that site runs on Amplify Hosting. **Unverified for this app.** Test with `curl -sI http://william.llcdouglashill.com/lp/process-automation` after cutover (PRD §8.6).
- **Caching:** static content uses Amplify-StaticContent: TTL minimum 0, default 0, maximum one year. No query strings or cookies in the cache key. Gzip and Brotli on (cache-configuration-type page, fetched). Amplify honors origin `Cache-Control` unless a custom header overrides it (setting-custom-headers page, fetched). An AWS blog describes "instant cache invalidation" on each deploy, with headers that make browsers revalidate (https://aws.amazon.com/blogs/mobile/aws-amplify-console-supports-instant-cache-invalidation-and-delta-deployments/, search chunk). The exact default `Cache-Control` on HTML is **unverified**. `docs.amplify.aws` sent `public, max-age=0, s-maxage=31536000`, which fits that description. The `/_astro/*` immutable header in §B8 is the main tuning step.
- **Compression:** Gzip and Brotli are on by default (cache page, fetched; 2024 blog).
- **HTTP/2:** stated ("HTTPS/2"). **HTTP/3:** not documented. `docs.amplify.aws` advertises `alt-svc: h3=":443"` (`curl -I`), but that is not proof for this app. **Unverified.**

### B15. Branch previews and password protection

- **Password protection:** per branch or for all branches, with a user name and password, set under Hosting, Access control. Amplify throttles failed attempts (https://docs.aws.amazon.com/amplify/latest/userguide/access-control.html, fetched). No separate price is listed on the pricing page. Builds and transfer are billed as usual.
- **Branch deployments:** each connected branch gets its own URL (`https://<branch>.<app-id>.amplifyapp.com`). Up to 50 branches per app (https://docs.aws.amazon.com/amplify/latest/userguide/quotas-chapter.html, fetched).
- **Pull-request previews:** Amplify has "web previews" for pull requests (memory, not fetched). For security, Amplify restricts previews on **public** repositories (memory, **unverified**), and this repo is public. Plan on a password-protected `preview` branch instead of PR previews, or make the repo private.
- Use: connect `main` for production and a `preview` branch with a password. Show Douglas the preview URL before cutover. The proxy and API tests in §B10 run there, with the branch host added to the function's allowed origins (§E).

---

## Part C. Migration plan

Ordered. Each step names who acts. "Builder" means whoever does the code work. Nothing here touches AWS until step 11.

1. **Builder: clear the `public/` hazard.** Move the current `public/` contents (`about.html`, `birthday-invite.html`, `contact.html`, `movie-ranking.html`) to `archive/old-public/` (not published) or delete them, as Douglas chooses. Also confirm `s3-current/` and `goal.png` stay outside `public/` and `src/`.
2. **Builder: scaffold Astro at the repo root on a branch.** Add `package.json`, `package-lock.json`, `astro.config.mjs` (§A4), `tsconfig.json` extending `astro/tsconfigs/strict`, `src/`, `public/`, `amplify.yml` (§B7), `customHttp.yml` (§B8). Install `astro`, `@astrojs/react`, `@astrojs/sitemap`, `@astrojs/check`, `typescript`. Add `dist/` and `.astro/` to `.gitignore`. Pin Node in `.nvmrc`.
3. **Builder: shared pieces.**
   - `src/layouts/BaseLayout.astro`: `<head>` (meta, canonical from props, `og:*`, fonts, global CSS import), skip link, header, footer, slot. Built from the header and footer the existing pages already share.
   - `src/components/SiteHeader.astro`, `SiteFooter.astro`, `BookCallLink.astro` (renders the `data-book-call` attribute from the markup contract), `Seo.astro` (robots and canonical per page).
   - `src/layouts/LegalLayout.astro` (extends Base, imports `legal.css`) and `src/layouts/LandingLayout.astro` (imports `lp.css`).
4. **Builder: move styles.**

   | Now | Becomes |
   |---|---|
   | `css/styles.css` | `src/styles/global.css` (unchanged at first; the single token source) |
   | `css/lp.css` | `src/styles/lp.css`, imported by `LandingLayout.astro` |
   | `css/legal.css` | `src/styles/legal.css`, imported by `LegalLayout.astro` |
   | Each existing page's inline `<style>` block | `src/styles/pages/<page>.css`, imported by that page (not scoped, for parity) |
   | `style=""` attributes in `resume.html` (6) | Classes in `src/styles/pages/resume.css` |

5. **Builder: move scripts, in two phases.**
   - **Phase 1 (lowest risk, ships first):** keep `js/attribution.js`, `js/analytics.js`, `js/lead-form.js`, `js/main.js` byte-for-byte as `public/js/*.js`. Load them from the layouts with `<script is:inline defer src="/js/...">` in the order the markup contract gives. The output is identical to the hand-written plan: external files, `defer`, no inline code. The `window` globals contract is unchanged.
   - **Phase 2 (after go-live):** convert each to TypeScript in `src/scripts/` (`attribution.ts`, `analytics.ts`, `lead-form.ts`, `site.ts` from `main.js`). Import them with processed `<script>` tags. Replace the `window` globals with imports where one script uses another. Processed scripts become deferred modules that Astro may bundle together, so test the load order and the GA4 GPC check again.
   - Inline `<script>` blocks and `onclick` handlers in existing pages: rewrite as `addEventListener` code in a page script. Module scripts run after parsing, not where the inline block sat. Check anything that ran early.
6. **Builder: port the four new pages.**

   | Being written now | Becomes |
   |---|---|
   | `lp/process-automation/index.html` | `src/pages/lp/process-automation.astro` (built as `lp/process-automation.html`) using `LandingLayout`. Sections become `src/components/lp/*.astro` if that helps. The form becomes `src/components/LeadForm.astro`. |
   | `thank-you/index.html` | `src/pages/thank-you.astro` (`noindex, nofollow`) |
   | `privacy/index.html` | `src/pages/privacy.astro` (hosting section updated for Amplify, §B12) |
   | `terms/index.html` | `src/pages/terms.astro` |
   | `sitemap.xml` (root) | Generated by `@astrojs/sitemap` with the filter (§A6); `robots.txt` moves to `public/robots.txt` and points to `/sitemap-index.xml` |

   **Lead form: a plain Astro component, not a React island.** `LeadForm.astro` holds the exact markup from `docs/markup-contract.md`. The behavior stays in `lead-form.js` (phase 1) or `lead-form.ts` (phase 2). Reasons: the script is written and tested against the contract and the mock; the form works without JavaScript through its fallback `action`; no framework runtime lands on the page the load budget (PRD §8.1) is measured on; no hydration delay before the form responds; the CSP stays at its simplest. React is for future widgets that need client-side state.
7. **Builder: port the existing pages** into `src/pages/`: `index.astro`, `services.astro`, `projects.astro`, `contact.astro`, `resume.astro`, `404.astro`. Do the same for `og-image.html` and `solution.html` only if they are meant to be published; today neither is on the live site. Move the old root `thank-you.html` into the new `thank-you.astro` (it is the same page). Keep the visible text, the class names, and the DOM order. Change only what the port needs: root-absolute paths, shared header and footer, no inline code, canonical links. In `contact.astro`, set Formspree `_next` to `https://william.llcdouglashill.com/thank-you`. The Calendly popup decision is §A4 (iii). `assets/` moves to `public/assets/` (or into `src/assets/` for images that use `<Image />`). The 5.3 MB `IMG_9852-original.jpg` is not published. `favicon.*` moves to `public/`.
8. **Builder: visual parity check.** Done outside the repo or in dev tooling only.
   - Serve the old site (current files, `python3 -m http.server`) and the new build (`astro preview`) side by side.
   - Playwright: for each page, take full-page screenshots at 375, 768 and 1280 px wide in Chromium and WebKit, with fonts loaded and `prefers-reduced-motion: reduce`. Pixel-diff old against new. Pass: under 0.1% differing pixels per page, or each difference listed and approved by Douglas.
   - Compare the visible text (`innerText`) of old and new for each page. Pass: identical except intended edits.
   - Run axe on every page (WCAG 2.1 AA; CLAUDE.md says the site passes today). Pass: no new violations. Check the skip link, focus rings, and keyboard path by hand.
   - Run a link check across the build. Watch `compressHTML` whitespace changes between inline elements (§A1).
9. **Builder: adapt the scripts and infra folders.**

   | File | Fate |
   |---|---|
   | `scripts/check.sh` | **Keep and adapt.** Run it against `dist/` in the Amplify build after `astro build` (§B7), so a failure blocks the deploy. Checks: `__REQUIRED_INPUT:` placeholders; price block markers; secret patterns (keys, `credentials`, `.env`, `samconfig`, `-original.`); no path in `dist/` outside an allowlist (no `.map`, no `.py`, nothing from `infra/` or `docs/`); no inline `<script>` or `<style>` whose hash is missing from the page's CSP meta; no `style=""` or `on*=` attributes; no `<ClientRouter`; `/lp/` and `/thank-you` absent from the sitemaps; each page has a canonical clean URL. |
   | `scripts/deploy.sh` | **Obsolete.** Amplify deploys on push. Do not write it, or delete it if it exists. |
   | `scripts/mock-lead-api.py` | **Keep.** Run it on port 8787 for `POST /api/lead` only. Point Astro's dev server at it with Vite's `server.proxy` (`'/api': 'http://localhost:8787'`). Its static serving and URL rewrite are no longer needed. |
   | `infra/cloudfront/url-rewrite.js`, `url-rewrite.test.js` | **Obsolete** on Amplify; clean URLs are built in. Delete after cutover. Their test cases (`//evil.example/`, trailing slash, `/thank-you.html`, UTMs) move into the live check list in step 10. |
   | Planned `infra/cloudfront/headers-*.json` | **Replaced** by `customHttp.yml` plus Astro's CSP meta. |
   | Planned `infra/cloudfront/README.md` `/api/*` checklist | **Replaced** by the Amplify rewrite JSON (`infra/amplify/rewrites.json`) and the §B10 tests. |
   | Old CloudFront distribution and S3 bucket | Kept unchanged until 30 days after cutover, for rollback. Then Douglas decides. |

10. **Builder and Douglas: preview checks** on the password-protected preview branch: every PRD §8 check that can run there; CSP console check on every page; `curl` checks of headers; the §B10 proxy tests (POST with JSON reaches the function; `Content-Type` and `Origin` arrive; no 403 from API Gateway; no duplicate item after a slow response); 404 behavior; `/privacy` and `/privacy.html` both 200 with the same canonical; HTTP to HTTPS on the branch URL.
11. **Douglas: deploy gate, then cutover** (§B11), then the PRD §8.11 end-to-end test against `https://william.llcdouglashill.com/api/lead`.
12. **Builder: clean up** after 30 stable days. Delete the old root HTML, `css/` and `js/` copies, and `infra/cloudfront/`. Update `docs/markup-contract.md` (paths, the local preview command) and PRD §7 (hosting, clean URLs, headers, API path).

## Part D. Notes for `docs/markup-contract.md` (not edited here)

- "No inline `<script>`, no inline `<style>`" becomes "no inline code except what Astro emits and hashes; never `style=""`, `on*=`, `define:vars` on scripts, or `set:html` with untrusted data".
- "Local preview: `python3 scripts/mock-lead-api.py` serves the repo root" becomes "`npm run dev` with the Vite proxy to the mock API; `npm run build && npm run preview` for CSP testing".
- File ownership changes from `lp/process-automation/index.html` to `src/pages/lp/process-automation.astro` and `src/components/LeadForm.astro`.

## Part E. What changes for the Lambda backend (`infra/lead-api/`)

- **Origin secret (`OriginVerifySecret`, `x-origin-verify`).** Amplify cannot add it (§B10). Make the check conditional: when the parameter is empty, skip it. Default the parameter to empty for the Amplify setup. Keep the code path in case option B is ever chosen. Update unit test U10 to cover both modes. Remove the "enter the secret in CloudFront" steps from the README.
- **`Origin` check.** Keep it, with a list: change `AllowedOriginHost` to `AllowedOriginHosts` (comma-separated), defaulting to `william.llcdouglashill.com`. Add the preview branch host (`preview.<app-id>.amplifyapp.com`) only while testing. Reject when `Origin` is present and not on the list. Whether to reject a **missing** `Origin` depends on whether Amplify forwards it (§B10, unverified). Decide after the preview test. Note in the README that this check stops other web pages, not scripts.
- **Duplicate submissions from proxy retries.** The Amplify team described up to 3 retries after a 15-second proxy timeout (§B10, unverified). Keep the Lambda timeout at 10 s. Optional and cheap: the client sends a random `submission_id`, and the function uses it as `lead_id` with a conditional `PutItem` (`attribute_not_exists`), so a retried request cannot store twice or email twice. This adds one field to the PRD §5.8 contract; Douglas's call.
- **CORS:** none with option A. With fallback C, set `CorsConfiguration` on the HTTP API: `AllowOrigins: [https://william.llcdouglashill.com]`, `AllowMethods: [POST]`, `AllowHeaders: [content-type]`, `MaxAge: 600`. The landing page CSP `connect-src` then adds the API host.
- **Unchanged:** the route `POST /api/lead` (the Amplify target keeps the `/api` prefix), payload format 2.0, throttling (1/s, burst 5), reserved concurrency 2, DynamoDB, SES, alarms, `RetentionDays` with no default.
- **SAM parameters after the change:** `NotificationEmail`, `AllowedOriginHosts`, `TableName`, `RetentionDays`, and `OriginVerifySecret` (optional, `NoEcho`, default empty). Add an `ApiHost` stack output to paste into the Amplify rewrite.
- **Privacy page:** item 4 changes "passes through Amazon CloudFront" to "passes through AWS Amplify Hosting (which uses Amazon CloudFront)". Item 10 changes the hosting provider to Amplify Hosting and covers its access logs.

## Part F. What Douglas must do himself, in order

**[PROD]** marks steps that change production.

1. Decide: approve the port of all pages (Part C), the Calendly popup change on `contact` (§A4 iii), clean canonical URLs for existing pages (`/services` instead of `/services.html`), and dropping the `/thank-you.html` 301.
2. Decide what to do with the current `public/` folder contents (§C step 1).
3. Confirm which AWS account holds the `llcdouglashill.com` hosted zone and the current CloudFront distribution. Choose the Amplify account and region. Read-only.
4. In the Amplify console, create the app and connect GitHub `kast2L/html-portfolio`. This installs the Amplify GitHub App on the repo and grants it read access (an OAuth or app permission grant he approves himself). Connect the `preview` branch first, with access control on (§B15). Not production.
5. Apply the rewrite rules (proxy first, 404 last) and confirm the build uses the committed `amplify.yml`. Not production.
6. Deploy the lead API with `sam deploy` (PRD §10 input 15) with the new parameters (Part E). Creates AWS resources; not yet linked to the live site.
7. Review the preview and approve it (gate). Run or watch the §C step 10 checks.
8. Connect `main` as the production branch. Its `amplifyapp.com` URL goes live, but the domain is unchanged.
9. **[PROD]** Domain cutover, §B11 steps 4–6, in a quiet window. Outage expected.
10. **[PROD]** Run the PRD §8.11 end-to-end test and the HTTPS and header checks on the live domain. Only then put the landing page link into outreach.
11. After 30 days: decide whether to delete the old distribution and bucket, and set an AWS Budgets alert if wanted.

## Part G. Risks: what gets worse and what gets better

**Worse than the S3 and CloudFront plan:**
- **A Node toolchain and a build step.** Every change goes through `npm ci` and `astro build` on Amplify. A broken dependency or a Node version mismatch (Astro needs at least 22.23.4) stops deploys.
- **More dependencies.** Astro, Vite, React, the sitemap integration, `@astrojs/check`, TypeScript, and their transitive packages. They need regular updates and security alerts. Astro ships a major version roughly yearly (6.0 in March 2026, 7.0 in June 2026), and each has breaking changes. Budget an hour or two a month, more around major versions. Pin versions with the lockfile, and enable Dependabot on the repo.
- **A larger migration.** All 6 existing pages are rebuilt, not just 4 new ones. That is more work before the landing page test can start, unless the new pages ship first on the fallback (§A3).
- **Parity risk on existing pages.** The Rust compiler's stricter parsing, the `compressHTML` whitespace change, scoped-style specificity, and module script timing can each change the look or behavior quietly. Mitigated only by the §C step 8 checks.
- **The domain cutover has an outage** of minutes to an hour, and rollback has one too (§B11).
- **Less control at the edge.** No request headers can be added at the edge, so the origin secret is lost. Rule options are limited (no Host rewrite, one wildcard). Proxy timeout and retries are fixed and only documented in a GitHub comment. HTTP/3, HSTS defaults, and header merge rules are not documented. Redirect rules live in the console or API, not in a file Amplify reads from the repo.
- **The API can be called directly** with option A or C (§B10). Junk leads are possible, bounded by throttling.
- **Data transfer costs more per GB** ($0.15 against CloudFront's $0.085, from the earlier hosting note). That is cents at this traffic.
- **A new third party in the delivery path:** the GitHub App connection, which is another credential to secure.

**Better:**
- **Only `dist/` is published.** The credentials-file and `infra/` leak risk from the old `aws s3 sync` deploy (PRD §7.5) goes away, as long as `public/` stays clean.
- **Clean URLs are built in.** No CloudFront Function runs on every request, and there is no function bug that could take down the whole site.
- **A shared layout.** Header, footer, fonts, analytics, and SEO tags live in one place, not copied into every page.
- **Hash-based CSP on every page,** including the existing ones, which today would need `'unsafe-inline'`.
- **Git-driven deploys with password-protected previews** and one-click redeploy of earlier builds.
- **Room to grow:** TypeScript, components, islands, image optimization, self-hosted fonts, and content collections, all without a server.

## Part H. Open questions only a real deployment can answer

1. Does the Amplify `200` proxy pass a POST body, `Content-Type: application/json` and `Origin` to API Gateway? What `Host` does it send, and does API Gateway accept it? (Decides option A or C.)
2. Are the proxy's 15-second timeout and up to 3 retries still current? Does a slow response store duplicate leads?
3. With `build.format: 'file'`, does a 301 from `/x.html` to `/x` loop?
4. How does `customHttp.yml` combine overlapping patterns, and do patterns match the request path or the served file?
5. Does Amplify send HSTS by default? Does it redirect HTTP to HTTPS on the custom domain? Does it serve HTTP/3? What `Cache-Control` does it send on HTML?
6. Without a rule, does Amplify serve `404.html` with status 404? Does the new app get a default SPA rewrite that must be removed?
7. Does `nvm install 22` on the Amplify build image give at least 22.23.4? Does Sharp work there?
8. Are Amplify web previews available for this public repository?
9. How long is the real outage at cutover with Route 53 and a ready certificate?
10. Do the Astro Fonts API, the responsive `<Image />` styles, and the island loader all come out hashed in the CSP meta, with zero console violations?
11. How does `@astrojs/sitemap` write URLs under `build.format: 'file'`?
12. How long does Amplify keep access logs, and are secret values masked in build logs?

## Sources

| URL | Used for | Fetched |
|---|---|---|
| https://docs.astro.build/en/install-and-setup/ | Node `v22.23.4`+ | Yes |
| https://registry.npmjs.org/astro/latest (and `@astrojs/react`, `@astrojs/sitemap`, `@tailwindcss/vite`, `@astrojs/check`) | Versions, `engines` | Yes (registry JSON) |
| https://astro.build/blog/whats-new-october-2026/ | 7.4 latest | Yes |
| https://astro.build/blog/astro-7/ | 7.0 date | No (search result) |
| https://docs.astro.build/en/guides/upgrade-to/v7/ | v7 breaking changes | Yes |
| https://astro.build/blog/astro-6/ | CSP stable in 6, Node 22, Fonts API | Yes |
| https://docs.astro.build/en/reference/configuration-reference/ | `build.format`, `trailingSlash`, `inlineStylesheets`, `publicDir`, `devToolbar`, `security.csp`, `fonts` | Yes |
| https://docs.astro.build/en/reference/experimental-flags/csp/ | CSP details, limitations | Yes |
| https://docs.astro.build/en/guides/client-side-scripts/ | Script inlining, `is:inline` | Yes |
| https://docs.astro.build/en/reference/directives-reference/ | Client directives, `is:inline`, `define:vars`, `set:html` | Yes |
| https://docs.astro.build/en/guides/framework-components/ | Islands, JS cost | Yes |
| https://docs.astro.build/en/guides/styling/ | Scoped styles, Tailwind | Yes |
| https://docs.astro.build/en/guides/typescript/ | Presets, `astro check` | Yes |
| https://docs.astro.build/en/guides/environment-variables/ | `PUBLIC_`, `astro:env` | Yes |
| https://docs.astro.build/en/guides/images/ | `<Image />`, static | Yes |
| https://docs.astro.build/en/guides/view-transitions/ | Native and `<ClientRouter />` | Yes |
| https://docs.astro.build/en/guides/integrations-guide/sitemap/ | Sitemap filter, file names | Yes |
| https://docs.astro.build/en/guides/deploy/aws/ | `amplify.yml`, SSR adapter | Yes |
| https://docs.astro.build/en/guides/content-collections/, https://docs.astro.build/en/guides/integrations-guide/mdx/ | Reference only | No |
| https://docs.aws.amazon.com/amplify/latest/userguide/redirect-rewrite-examples.html | Rules, proxy, clean URLs, 404 | Yes |
| https://docs.aws.amazon.com/amplify/latest/userguide/redirects.html | Types, order, query strings | Yes |
| https://docs.aws.amazon.com/amplify/latest/userguide/custom-header-YAML-format.html | `customHttp.yml` format | Yes |
| https://docs.aws.amazon.com/amplify/latest/userguide/setting-custom-headers.html | Console or file, Cache-Control | Yes |
| https://docs.aws.amazon.com/amplify/latest/userguide/custom-headers.html | Headers are response headers | Search chunk |
| https://docs.aws.amazon.com/amplify/latest/userguide/cache-configuration-type.html | Cache policies, compression | Yes |
| https://docs.aws.amazon.com/amplify/latest/userguide/build-settings.html | `amplify.yml` location | Yes |
| https://docs.aws.amazon.com/amplify/latest/userguide/yml-specification-syntax.html | Artifacts, cache | Search chunk |
| https://docs.aws.amazon.com/amplify/latest/userguide/custom-build-image.html | Node version via live updates | Search chunk |
| https://docs.aws.amazon.com/amplify/latest/userguide/ssr-supported-features.html | Node 20, 22, 24 | Search chunk |
| https://docs.aws.amazon.com/amplify/latest/userguide/manual-deploys.html | Deploy without Git | Yes |
| https://docs.aws.amazon.com/amplify/latest/userguide/custom-domains.html | Domains, certificates | Yes |
| https://docs.aws.amazon.com/amplify/latest/userguide/to-add-a-custom-domain-managed-by-a-third-party-dns-provider.html | DNS steps, HTTPS/2, 48 hours | Yes |
| https://docs.aws.amazon.com/amplify/latest/userguide/troubleshooting-custom-domains.html | `CNAMEAlreadyExistsException`, CAA, 404 on CloudFront URL | Yes |
| https://docs.aws.amazon.com/amplify/latest/userguide/access-control.html | Password protection | Yes |
| https://docs.aws.amazon.com/amplify/latest/userguide/quotas-chapter.html | Quotas | Yes |
| https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html | Secrets guidance | Search chunk |
| https://aws.amazon.com/amplify/pricing/ | Prices, free tier | Yes |
| https://aws.amazon.com/amplify/faqs/ | HTTPS | Search chunk |
| https://aws.amazon.com/blogs/mobile/cdn-caching-improvements-for-better-app-performance-with-aws-amplify-hosting/ | Forwarded headers, Brotli | Search chunk |
| https://aws.amazon.com/blogs/mobile/resolve-single-page-application-integration-issues-with-legacy-apis-that-do-not-support-cors-using-aws/ | `/api/<*>` proxy pattern | Search chunk |
| https://aws.amazon.com/blogs/mobile/aws-amplify-console-supports-instant-cache-invalidation-and-delta-deployments/ | Invalidation on deploy | Search chunk |
| https://github.com/aws-amplify/amplify-hosting/issues/1711 | Proxy timeout 15 s, 3 retries (team comment, 2021) | Yes (GitHub API) |
| https://github.com/aws-amplify/amplify-hosting/issues/2316, /2459, /527, /87, /18 | Header forwarding history, Host, rules file | Yes (GitHub API) |
| https://docs.aws.amazon.com/sdk-for-kotlin/api/latest/amplify/aws.sdk.kotlin.services.amplify.model/-update-app-request/custom-rules.html | `customRules` in the API | No (search result) |
| `curl -I` to `https://william.llcdouglashill.com/`, `https://docs.amplify.aws/`, `http://docs.amplify.aws/`; `dig` for `llcdouglashill.com` | Live headers, Route 53 | Run 2026-11-10 |
