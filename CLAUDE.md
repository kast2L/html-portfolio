# CLAUDE.md — html-portfolio

## Design Context

Strategy lives in [PRODUCT.md](PRODUCT.md); visual system in [DESIGN.md](DESIGN.md). Read both before any UI work.

- **Register:** brand (portfolio — design IS the product).
- **Primary job:** land consulting clients for Douglas Hill Consulting LLC. "Book a call" is the primary CTA; resume / job-hunt is the secondary path and must never outcompete it.
- **Users:** decision-makers (IT directors, program owners) doing a 60-second credibility check, often forwarding the link.
- **Personality:** calm senior authority — credible, editorial, grounded. Outcomes, not buzzwords. No animation theatrics.
- **Anti-references:** generic SaaS landing, corporate/stock-photo consultancy, over-designed agency, "developer with cool animations."
- **Principles:** (1) outcomes over outputs, (2) senior calm = restraint, (3) one obvious next step, (4) earn the scroll, (5) substance is the aesthetic.
- **Identity (committed — preserve):** Notion-editorial, light only. Newsreader serif headings + Inter body. Crimson accent `#e94560` (decorative/large only) / `#c4324a` (`--accent-text`, body-size). 920px column. Tokens in `css/styles.css`.
- **Accessibility:** WCAG 2.1 AA, already passing. Don't regress skip link, focus rings, aria, contrast. Accent never on small text. Honor `prefers-reduced-motion`.
