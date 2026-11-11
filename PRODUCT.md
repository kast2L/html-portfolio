# Product

## Register

brand

## Users

Decision-makers evaluating Douglas Hill for enterprise Power Platform and cloud work.

- **Primary:** prospective consulting clients — IT directors, program owners, and engineering managers at government agencies, Fortune 50 healthcare, utilities, state programs, and higher education. They arrive from LinkedIn, a referral, or alongside a proposal, and they want to verify one thing fast: *"Can this person de-risk my modernization?"*
- **Secondary:** recruiters / hiring managers and technical peers.

Context of use: skimming on a laptop between meetings. A 60-second credibility check, often forwarded to a colleague before any reply. They are not browsing; they are deciding whether to take the next conversation.

## Product Purpose

Turn that 60-second skim into a booked call. This is the lead-generation storefront for **Douglas Hill Consulting LLC** — it establishes senior-architect credibility through real enterprise outcomes (MN PetroFund, Humana governance, IRS modernization, DHS) and makes "Book a call" the obvious next step.

Success = qualified inbound consulting conversations. Full-time interest is a welcome secondary outcome but not the design's job. This is **not** a feature tour and **not** a code showcase.

## Brand Personality

Calm senior authority. Three words: **credible, editorial, grounded.**

Voice is a plain-spoken expert who talks in business outcomes — adoption, records replaced, environments governed — not buzzwords or hype. The interface should evoke trust and competence: the feeling that "this person has done the hard version of my problem before." No swagger, no animation theatrics, no proving-I-can-code.

## Anti-references

- **Generic SaaS landing** — gradient hero, identical feature-card grid, the hero-metric template, a tracked uppercase eyebrow above every section.
- **Corporate / stock-photo consultancy** — navy-and-gray palette, stock handshakes, soulless enterprise template.
- **Over-designed agency** — maximalist experimental type and motion-for-motion's-sake that buries the substance.
- **"Developer with cool animations"** (carried from the redesign spec) — the work speaks; the chrome doesn't.

## Design Principles

1. **Outcomes over outputs.** Lead every project with the business result (1,188 records off Excel, 200+ environments governed, 1.2M customers reached), not the tech stack. Tags are supporting evidence, never the headline.
2. **Senior calm.** Restraint is the credibility signal. Generous whitespace, one accent, and the deliberate absence of anything a junior would add to look impressive.
3. **One obvious next step.** Every screen funnels toward "Book a call." The resume / job-hunt path stays available but never competes for the primary action.
4. **Earn the scroll.** The 60-second skimmer must get the core case in the hero and in each section's first line; depth rewards those who keep reading.
5. **Substance is the aesthetic.** Real client names, real numbers, real constraints (government, compliance, Fortune 50) *are* the design. Don't dress it up; don't invent it.

## Accessibility & Inclusion

WCAG 2.1 AA, already established and to be maintained:

- Contrast pairings documented and passing — body text ≥4.5:1, `--accent-text` (#c4324a) at 5.2:1, decorative `--accent` (#e94560) reserved for large text only (≥24px / ≥18.66px bold).
- Keyboard and screen-reader support in place: skip link, `:focus-visible` rings, aria labels, `sr-only` section headings. Do not regress these.
- Honor `prefers-reduced-motion: reduce` for any motion added.
- The crimson accent never lands on small text — enforce on every new element.
