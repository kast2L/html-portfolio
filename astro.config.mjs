// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// Settings follow docs/astro-amplify-notes.md (§A2, §A4, §A11).
export default defineConfig({
  site: 'https://william.llcdouglashill.com',
  output: 'static',
  trailingSlash: 'never',
  compressHTML: true,
  build: {
    format: 'file',
    inlineStylesheets: 'never',
  },
  // No Markdown code blocks on the site; Shiki's inline styles would conflict with the CSP.
  markdown: { syntaxHighlight: false },

  // Self-hosted fonts downloaded & subsetted at build time by Astro (font-src 'self' safe).
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Plus Jakarta Sans',
      cssVariable: '--font-sans',
      weights: ['400 800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Instrument Serif',
      cssVariable: '--font-serif',
      weights: ['400'],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif'],
    },
  ],

  // Astro hashes every inline script and style it emits and writes a CSP <meta> per page.
  // No 'unsafe-inline' anywhere. GA4 host allowed by name (analytics.js injects gtag.js).
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

  vite: {
    // Local only: forwards the lead form to scripts/mock-lead-api.py (run it on port 8787),
    // for both `astro dev` and `astro preview`.
    server: { proxy: { '/api': apiProxy() } },
    preview: { proxy: { '/api': apiProxy() } },
  },
});

function apiProxy() {
  return {
    target: 'http://127.0.0.1:8787',
    changeOrigin: true,
    headers: { origin: 'http://127.0.0.1:8787' },
  };
}
