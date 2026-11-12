# PRD: Process Automation Sprint landing page and conversion flow

*Status: draft for Douglas's approval (Gate 3). Written 2026-11-10. No site code exists for this yet, and none is written until this document is approved. Revised 2026-11-10 after Douglas's review: the form backend is AWS Lambda behind API Gateway and CloudFront (§7.2), not Formspree. Everything else in the first draft stands.*

**Owner:** Douglas Hill Consulting LLC
**Phase:** 30-day channel test, Phase 1 (see `marketing-launch/progress.md`)
**Sources this spec is built from:** `.agents/product-marketing.md` (cited as PMC), `marketing-launch/offer-process-automation-sprint.md` (cited as Offer), `marketing-launch/channel-options.md` (cited as Channels), `PRODUCT.md`, `DESIGN.md`, `CLAUDE.md`, `css/styles.css`, `js/main.js`, the existing HTML pages, `sitemap.xml`, `robots.txt`, and the deploy section of `docs/superpowers/plans/2026-03-25-portfolio-redesign.md`.

**How to read the labels.** **[Input]** means only Douglas can supply it. **[Needs approval]** means the item comes from the offer draft but Douglas has not approved it for publication (PMC: "Do not copy any other number from the offer draft into assets until he approves it"). **[Verify]** means a fact about the live infrastructure that has not been inspected. **Unverified** on a vendor fact means it could not be confirmed on the vendor's own page.

---

## 1. Purpose and success measure

**Purpose.** Give the two provisional outreach channels (manual LinkedIn direct outreach and warm-network 1:1 messages) one forwardable page that explains the Process Automation Sprint and turns a visit into a booked 30-minute call. Channels lists "a forwardable sprint page live before day 1" as a pre-start gate (§6, item 2).

**Success measure for this build.**
1. All four pages are live on `https://william.llcdouglashill.com` and pass every acceptance criterion and non-functional requirement in this document before day 1 of the test.
2. Every booked call and every form lead during the test can be attributed to a channel: by UTM values, by the Calendly "how did you hear about me" answer (Channels §8 item 6), or by the outreach tracker. Target: 100% of booked calls have a recorded source.

**Business measure the page serves (not owned by the page alone):** 3 qualified booked calls in 30 days (PMC, Goals). Channels estimates the odds of reaching 3 at about 4% to 21% at the mid case. The page cannot fix that; it must not be the reason a call is lost.

---

## 2. Pages

All four pages use the existing identity: Newsreader headings, Inter body, tokens from `css/styles.css`, light only, crimson `#e94560` only on large text, fills, and borders, `--accent-text` `#c4324a` for any body-size accent text. Existing pages are not changed except where §7.1 says so (the old `/thank-you.html` URL).

Common acceptance criteria (apply to every page below; each is pass/fail):

- **AC-ALL-01** Served at its clean URL with HTTP 200 and `Content-Type: text/html`.
- **AC-ALL-02** Has a `<link rel="canonical">` with the absolute URL on `https://william.llcdouglashill.com`, no query string, no trailing slash.
- **AC-ALL-03** Every internal reference (CSS, JS, images, links) is root-absolute (`/css/...`), because relative paths break under extensionless URLs.
- **AC-ALL-04** Has a skip link as the first focusable element, a single `<h1>`, a `<main id="main">`, and `lang="en"`.
- **AC-ALL-05** Contains no inline `<script>` and no inline `style` attribute or `<style>` block (required by the strict CSP in §7.3).
- **AC-ALL-06** Contains none of the build placeholders defined in §10 (the check script returns exit code 0).
- **AC-ALL-07** Footer links to `/privacy` and `/terms`, and every link resolves (no 4xx/5xx).
- **AC-ALL-08** Passes every non-functional requirement in §8.

### 2.1 `/lp/process-automation`

- **Purpose:** explain the one offer to the one buyer and get a booked call. Secondary: collect a short written lead from people not ready to book.
- **Content:** the six sections in §4, in order: problem, offer, how it works, proof points, FAQ, CTA. No site navigation.
- **Source file:** `lp/process-automation/index.html`, with page styles in `css/lp.css` and behavior in `js/attribution.js`, `js/analytics.js`, `js/lead-form.js`.

Acceptance criteria:

- **AC-LP-01** The header contains the "Douglas Hill" wordmark only, as plain text, not a link. No nav links, no hamburger, no link to the resume, projects, or home page anywhere on the page.
- **AC-LP-02** The only outbound links on the page are: the booking link, the email address (mailto) in the CTA and form-error states, `/privacy`, and `/terms`. A link audit (`document.querySelectorAll('a[href]')`) returns nothing else.
- **AC-LP-03** The `<h1>` text equals the approved message-match line **[Input]**, character for character, and the same line appears in the outreach kits for both channels.
- **AC-LP-04** The six sections appear in the order problem, offer, how it works, proof points, FAQ, CTA, each with an `<h2>`.
- **AC-LP-05** The primary action is "Book a call" (exact label set at copy stage), styled `.btn-dark`, and every booking control on the page has the same label and destination. It appears in the problem section (above the fold at 375×667 and 1440×900) and in the CTA section, and at most once more.
- **AC-LP-06** The form appears only in the CTA section, below the booking button, and is reached from elsewhere only by an in-page text link (§4.7).
- **AC-LP-07** The price block can be present or absent (§4.2). With it absent, the string `6,000` appears nowhere in the page source. With it present, it appears only inside the price block and the price variant of the cost FAQ answer.
- **AC-LP-08** Every claim on the page appears in the allowed-claims list in §4.4 or the offer facts in §4.2. A reviewer checks each sentence with a claim against that list; zero unlisted claims.
- **AC-LP-09** None of the "must not appear" items in §4 are present (checked by search for: client names from `projects.html`, "50%", "half", "$2M", "replaced" next to "1,188", "testimonial", logos, "guarantee" used for outcomes).
- **AC-LP-10** `<meta name="robots" content="noindex, follow">` is present (§8.10).
- **AC-LP-11** Open Graph tags are present: `og:title`, `og:description`, `og:url` (canonical), `og:image` (`https://william.llcdouglashill.com/assets/og-image.png`, 1200×630), and LinkedIn Post Inspector shows the intended title, description, and image.
- **AC-LP-12** Loaded with `?utm_source=a&utm_medium=b&utm_campaign=c&utm_term=d&gclid=e`, the booking link's `href` carries the four UTM values (not `gclid`), and the form's hidden fields hold all five (§5, §6).

### 2.2 `/thank-you`

**Recommendation: adapt, do not reuse as is, and do not replace from scratch.**

What exists: `thank-you.html` is live at `/thank-you.html` (HTTP 200, checked 2026-11-10). It has `noindex`, the skip link, the check-mark tile, a "Book a 30-minute call" button to the Calendly link, and a "Back home" button. It is reached today from the Formspree form on `contact.html` through `_next`.

Why not reuse it unchanged:
- Its copy promises "I'll read them and reply within one business day." No reply-time commitment for leads is approved; the offer's working-hours and response-time question is still open and blocks publication (Offer §8 item 3).
- It carries the full site nav and a "Back home" exit. That is acceptable on a thank-you page in general, but for a visitor arriving from the landing page it should match the landing page's header.
- It loads no attribution or analytics script, so a booking click from it cannot carry UTMs.
- It lives at `/thank-you.html`, not the clean URL in scope.

Why not replace from scratch: its structure, classes, and accessibility are already right and match the design system. Adapting keeps them.

- **Purpose:** confirm the form was received, set expectations, and offer the booking link as the faster next step.
- **Content:** confirmation heading; what happens next (Douglas reads it and replies; the timing is stated only if Douglas approves a commitment **[Input]**); the booking button; the email address as a fallback. Header matches the landing page. A text link back to the landing page is allowed; no other site navigation.
- **Source file:** `thank-you/index.html`. The old `/thank-you.html` URL returns a 301 to `/thank-you` (§7.1).

Acceptance criteria:
- **AC-TY-01** `noindex, nofollow` robots meta; not listed in `sitemap.xml`.
- **AC-TY-02** Loading the page does not fire `submit_lead_form` or any other conversion event. (The event fires on the landing page when the backend confirms receipt; see §6. A refresh or a direct visit must not count as a lead.)
- **AC-TY-03** The booking button carries stored UTM values (same rule as AC-LP-12) and fires `book_call` with `cta_location=thank_you`.
- **AC-TY-04** No reply-time promise appears unless Douglas has approved the wording.
- **AC-TY-05** `GET /thank-you.html` returns 301 with `Location: https://william.llcdouglashill.com/thank-you`.

### 2.3 `/privacy`

- **Purpose:** state plainly what the landing page, form, analytics, and booking flow collect, and why.
- **Content:** the content requirements in §9.1.
- **Source file:** `privacy/index.html`.

Acceptance criteria:
- **AC-PR-01** Covers every item in §9.1; a reviewer ticks each one.
- **AC-PR-02** Shows an effective date and the business contact for privacy requests.
- **AC-PR-03** Douglas's written approval of the final text is recorded in `marketing-launch/progress.md` before deploy. Until then the page carries the review placeholder from §10, which fails the build check.
- **AC-PR-04** Every factual statement about tooling matches the shipped configuration (for example, if GA4 data retention is set to 2 months, the page says 2 months).

### 2.4 `/terms`

- **Purpose:** site terms of use. Not the engagement contract.
- **Content:** the content requirements in §9.2.
- **Source file:** `terms/index.html`.

Acceptance criteria:
- **AC-TE-01** Covers every item in §9.2.
- **AC-TE-02** States that no engagement exists until a written agreement is signed, and does not restate payment, acceptance, refund, or fix-window terms in a way that differs from the offer document.
- **AC-TE-03** Same review gate as AC-PR-03.

---

## 3. User flows

Shared mechanics for every flow:
- **Recorded in GA4** (if not blocked by an ad blocker or Global Privacy Control, §6.5): `page_view` with the landing URL (GA4 reads UTMs from it), `book_call`, `submit_lead_form`.
- **Recorded by the lead API (§7.2):** each form submission, stored as an item in a DynamoDB table in Douglas's AWS account, then emailed to Douglas through Amazon SES.
- **Recorded by Calendly:** each completed booking, its UTM values on the invitee record (per Calendly community answers; **unverified**, confirm with a test booking), and the "how did you hear about me" answer.
- **Recorded by hand:** the outreach tracker (Channels §6, pre-start item 5).

### 3.1 LinkedIn direct outreach

| Step | What the visitor sees | What is recorded | Where they can drop off |
|---|---|---|---|
| 1. Connection request | Douglas's request, usually without a note (free accounts get 3 personalized notes per month, Channels §1). They may view his profile. | Tracker: request sent, date. | Ignores or declines the request. |
| 1a. Profile visit (optional) | Headline, About, and a Featured link to the landing page tagged `utm_medium=profile`. | Nothing until they click. | Leaves the profile. |
| 2. Accepts, gets the follow-up | One manual message with the landing page link, tagged `utm_source=linkedin`, `utm_medium=dm`, campaign value. The message's lead line matches the page `<h1>` (AC-LP-03). | Tracker: accepted, message sent. | No reply, no click. Or replies in LinkedIn without visiting (tracker records it; the page never sees it). |
| 3. Opens the link | Usually on a phone, often inside LinkedIn's in-app browser. The landing page loads with the headline and the booking button visible without scrolling. | GA4 `page_view` with UTMs. UTMs saved to browser storage (§6.3). | Bounces after the first screen. |
| 4a. Books | Taps "Book a call". Calendly opens in a new tab, with UTMs appended. Picks a time, answers the source question, confirms. | GA4 `book_call` on the tap. Calendly: booking, UTMs, answer. | Taps but does not finish on Calendly (GA4 has `book_call`, Calendly has nothing). |
| 4b. Or writes first | Taps the "send a short note" link, fills 4 fields, submits. Sees `/thank-you`, with the booking button again. | GA4 `submit_lead_form` after the backend confirms. Lead item in DynamoDB and a notification email to Douglas, both with the hidden UTMs. | Abandons the form. Validation error not fixed. Backend failure (error state offers email and booking, §5.5). |
| 5. Call | 30-minute scoping call. | Tracker: held / no-show, qualified yes/no (Offer §7.1). | No-show. |

### 3.2 Warm-network message

| Step | What the visitor sees | What is recorded | Where they can drop off |
|---|---|---|---|
| 1. Personal 1:1 message | A note from Douglas, on LinkedIn (email waits for the CAN-SPAM legal view, Channels §6) with the landing page link tagged `utm_source=warm-network`, `utm_medium=dm` or `email`. | Tracker: contact, date, channel. | No reply. Replies directly to Douglas and books from his reply (page never sees it; tracker records it). |
| 2. Opens the link | Same landing page as 3.1. | GA4 `page_view` with warm UTMs. | Bounces. |
| 3. Books or writes | Same as 3.1 steps 4a and 4b. | Same as 3.1. | Same as 3.1. |

**Forwarded to a colleague.** The contact forwards the link. Three things can happen:
1. The colleague opens the full link, with the contact's UTMs. GA4, the lead record, and Calendly all attribute the visit to the warm network. That is the right channel, but nothing in the data says it was forwarded. The tracker catches it: the booking or form name is not a contacted person, so Douglas marks it "forwarded from <contact>". The Calendly source question also usually names the contact.
2. The colleague opens a link with the query string stripped (copied by hand, or rewritten by a mail security gateway). The visit lands as direct traffic (§3.3). The Calendly answer and the tracker are then the only attribution.
3. The colleague has already been on the page through the contact's link on the same device. Not realistic for a different person; no special handling.

Drop-off points added by forwarding: the contact never forwards; the colleague opens it weeks later (the stored attribution expires after 30 days, §6.3).

The 4-field form has no "how did you hear" field. That is deliberate, to keep it short. If Douglas wants one, it is an optional fifth field; see §11.

### 3.3 Any other source

Covers direct visits, links without UTMs, other referrers (for example a LinkedIn post or someone else's site), search (unlikely; the page is `noindex`), and any future paid source.

| Step | What the visitor sees | What is recorded | Where they can drop off |
|---|---|---|---|
| 1. Arrives | The same landing page. | GA4 `page_view`; GA4 assigns its default channel from the referrer. If the URL has `gclid` (any future Google Ads click), it is stored for the form (§6.3). No UTMs stored if none present; earlier stored values within 30 days are kept. | Bounces. |
| 2–4 | Same as 3.1 steps 4a, 4b, 5. | Form hidden fields empty unless stored values exist. Calendly source question gives the answer. | Same as 3.1. |

Nothing ad-specific is built: no conversion pixels, no ad tags, no ad landing variants. `gclid` capture costs one hidden field and keeps the data usable if ads are added later.

---

## 4. Landing page outline, section by section

Facts and structure only. Final copy is written after this PRD is approved, in the voice in PMC "Brand Voice" (calm, plain, short sentences, outcomes not buzzwords) and with PMC "Words to use / avoid".

Rules for every section:
- No client names, no logos, no testimonials or implied quotes, no stock photos (PMC Proof Points; DESIGN.md Imagery).
- Not allowed anywhere: "approvals cut 50%" or any travel-approval result; the "$2M lifetime reimbursement limits" figure; "pays for itself within a quarter" or any saving or ROI promise; "replaced" or "migrated" for the 1,188-record process; any wording that makes the federal or utility work read as a Douglas Hill Consulting client engagement; enterprise as a target buyer; Power Apps, canvas apps, Dataverse, or model-driven apps as part of the offer; SI or freelancer rate estimates from Offer §4.3 (low confidence); a backup consultant (none exists); working hours or availability (unconfirmed, Offer §6); PL-600.
- Numbers from the offer draft that are not yet approved for publication are marked **[Needs approval]** below and are written without the number until approved.

### 4.1 Problem (opens the page)

**Job:** in the first screen, tell the buyer this page is about their exact problem and give them the one next step.

Content points:
- `<h1>`: the message-match line **[Input]**. It must say, in substance: one process that runs on spreadsheets and email approvals, rebuilt as an automated Power Automate workflow in Microsoft 365, in 4 weeks, at a fixed price (PMC one-liner). If the price is not shown, "fixed price" stays and the number does not.
- One supporting sentence: who it is for (Operations, Finance, or IT leaders at 50–2,000 person companies on Microsoft 365).
- The primary booking button, plus the in-page "prefer to write first?" text link to the form (§4.7).
- The pain, briefly (3–4 points, PMC Use cases / Core problem, `services.html`): approvals stuck in inboxes, a shared spreadsheet several people edit and nobody trusts, chasing sign-offs, nobody can say where a request stands, no record of who approved what. These are hypotheses about the buyer's words (PMC Customer Language), so phrase them as the situation, not as quotes.
- The cost of staying put, qualitatively only (staff time, stalled approvals, no audit trail). No figures; there are none sourced for this buyer.

Allowed claims: the pain list (PMC, `services.html`); "watching a spreadsheet quietly become a system of record" (`services.html`, quoted in PMC).
Must not appear: hours-saved figures, the BLS-wage illustration from Offer §4.3, fear language.

### 4.2 Offer

**Job:** say exactly what the buyer gets, what it costs (if shown), what is in and out, and who it is for.

Content points:
- Name: Process Automation Sprint. One process, 4 weeks, fixed scope, fixed price (Offer §0).
- What it runs on: Power Automate with SharePoint lists and standard Microsoft 365 connectors, in the client's own tenant, on licenses they already pay for (Offer §0, §2.2). No new license spend for the standard sprint.
- What they end up with (Offer §1, condensed; group into 4–6 plain items): a written solution design they sign off; one SharePoint list replacing the spreadsheet; one intake form; automated routing, approvals, notifications, reminders, and an escalation rule; an audit trail of every request and decision; a status view; their open and recent rows moved in; flows owned by their account, not Douglas's; a runbook, a user quick guide, and a licensing note; one recorded training session and an admin handover; a 30-day fix window.
- Scope limits, stated as limits so the buyer can self-check: one process; a small number of approval stages and routing rules; one SharePoint list; a migration size limit **[Needs approval: "up to 2 stages", "up to 3 conditions", "up to 2,000 rows", "up to 250 submitters / 20 approvers"]**. Until approved, write them without numbers ("a simple approval chain", "a limited number of routing rules") or leave them for the call.
- Not included (Offer §2.3, condensed): a second process, Power BI, canvas or Power Pages apps, external users, RPA, custom code, on-premises systems, tenant-wide governance, data cleanup. Anything needing Dataverse or premium connectors is not part of this offer and is discussed on the call (do not describe the scoped-exception pricing).
- Who it is for / not for (Offer §7.2–7.3; Channels §8 item 2): for 50–2,000 person companies on Microsoft 365 with one named process and someone who can approve the spend; not for companies under 50 or not on Microsoft 365, "automate everything" programs, or buyers who need an RFP, a team, on-site staff, or 24/7 support.
- **Price block (optional, self-contained).** One block inside this section that holds: "$6,000 fixed price" and the payment schedule "30% to book your start date, 40% when the core path works in a live demo, 30% when you accept go-live" (Offer §5.3 suggested public wording). The block is marked with `data-block="price"` and HTML comments `<!-- PRICE BLOCK START -->` / `<!-- PRICE BLOCK END -->`.
  - **With the price shown:** the block is present and the cost FAQ uses its price variant.
  - **Without the price:** the block is deleted, and the payment schedule moves to the "How it works" section as percentages only (the percentages are approved, PMC Terms). The cost FAQ uses its no-price variant ("fixed price, quoted after the scoping call, before anything is signed").
  - No other section mentions the number. Both variants are written and reviewed before Gate 4, so switching is a delete, not a rewrite (AC-LP-07).
- Next start date: shown only if Douglas gives a real date **[Input]**, and it must be kept true (Offer §6). Otherwise omitted.

Allowed claims and sources: everything above traces to Offer §0, §1, §2, §5.3, §7 and PMC Product Overview. "One sprint in delivery at a time" (Offer §6) is the only allowed scarcity statement.
Must not appear: Dataverse prices or the licensing illustration (Offer §2.2), the 60-hour or $100-per-hour arithmetic (approved internally, but it invites hourly comparison; Douglas's call **[Input]**), bonuses, countdowns.

### 4.3 How it works

**Job:** remove fear of an open-ended IT project by showing a short, fixed sequence with exits.

Content points (Offer §3, §5):
- Step 0: a 30-minute scoping call: walk through the process, check it fits the standard sprint, get a straight answer on whether it is worth doing (`services.html`, PMC).
- Step 1: kickoff and design. The client signs off a short solution design and an acceptance checklist. **Off-ramp:** if they don't want to go ahead after seeing the design, they stop and keep it (Offer §5.2 item 1).
- Step 2: build, with a live demo of the core path.
- Step 3: testing by their people, one round of fixes.
- Step 4: training, handover, go-live acceptance.
- After: 30-day fix window for defects against the signed checklist.
- Day numbers (Day 4 design sign-off, Day 10 demo, Day 20 go-live) **[Needs approval]**; until approved, use "week 1 … week 4".
- What the client provides (Offer §3.1, condensed): a process owner with a few hours a week, an IT admin who grants access and confirms licenses, the current spreadsheet and examples. The "2–4 hours per week" figure **[Needs approval]**.
- Payment by milestone (in the price block if shown; here as percentages if not).

Allowed claims: Offer §3, §5.1, §5.2 (approved terms: 30/40/30, deemed acceptance after 5 business days, 30-day fix window, refund of the booking payment if the design is not delivered).
Must not appear: the 15 hours per week figure as a promise until Offer §8 item 1 is answered; "guarantee" framed as an outcome guarantee.

### 4.4 Proof points

**Job:** show that the person doing the work has built governed, audit-ready workflows at higher stakes, and be honest that the proof is enterprise and government work, not mid-market sprints.

Structure: 3 short, generic items, each with a one-line delivery-context label, followed by one sentence that is honest about the gap (PMC "How the proof transfers"): the problem is the same, the standard was higher, and there are no mid-market references yet. Do not say there are none in so many words if Douglas prefers; but do not imply there are (**[Input]** on wording).

Allowed claims (only these):

| # | Claim (fact, not final copy) | Delivery context label | Source |
|---|---|---|---|
| P1 | Architected the replacement for an Excel-and-email process covering 1,188 records at a state government program. | Douglas Hill Consulting engagement | PMC Proof Points; Offer §0. Exact wording required. Not a savings figure; must not imply it is live. Not presented as an example of the sprint (it was larger). |
| P2 | Power Platform governance across 200+ environments at a Fortune 50 healthcare company. | Douglas Hill Consulting engagement | PMC; Offer §0. Credibility for "governed, not fragile"; not a sprint example. |
| P3 | Legacy Nintex workflows and an Access database retired for a federal agency, replaced with Power Automate flows carrying audit trails. | "Delivered while working for a federal contractor" (or the attribution Douglas confirms) | PMC; Offer §0. Agency label ("federal tax agency" vs "a federal agency") is an open item that blocks publication (Offer §8 item 7). |

Optional supporting facts (not proof metrics): 7+ years in the Microsoft ecosystem; certifications as listed on `index.html` (PMC). A real portrait (`/assets/images/IMG_9852.jpg`) may appear here or in the CTA section; no other imagery.

Attribution rule: P1 and P2 labels are **[Needs approval]** under Offer §8 item 6 (blocks publication). P3 must read as work Douglas did, never as a Douglas Hill Consulting client.

Must not appear: 1.2M customers (weak fit; PMC says sparingly if at all, so left out); the federal defense program handoff example (delivery context not stated in the sources); the utility SharePoint migration "ahead of schedule" (sources disagree); any client name; any logo; any outcome number not in the table.

### 4.5 FAQ

**Job:** answer the objections before the call. Each answer 2–4 sentences, drawn from PMC Objections and the Offer. Use native `<details>`/`<summary>` (keyboard and screen-reader accessible without script) or plain headings and paragraphs.

| # | Question (topic) | Points the answer must make | Source |
|---|---|---|---|
| F1 | Your experience is government and Fortune 50. We're a 300-person company. Is this sized for us? | Same pain (a process on email and a spreadsheet). Sprint is sized for one process and one team. Enterprise background means it is built governed and documented, without an enterprise price or timeline. | PMC Objections row 1 |
| F2 | You're one person. What if something goes wrong or you're unavailable? | Everything is built in your tenant from day one and documented. Payment follows milestones. If the design is not delivered, the booking payment is refunded in full. If Douglas is out more than 10 business days, the client can end it and keep the work. There is no backup consultant, stated plainly. | PMC row 3; Offer §5.2, §6 (the "10 business days" figure **[Needs approval]**) |
| F3 | You deliver part-time alongside other work. Will our project slip? | The calendar is fixed at the start (4 weeks). Only one sprint is in delivery at a time. Nothing is held on Douglas's systems. You never pay ahead of delivered work. Hours per week and response times only once Douglas confirms them. | PMC row 4; Offer §6, §8 items 1 and 3 |
| F4 | Do we need new licenses? | The standard sprint uses SharePoint and standard Microsoft 365 connectors, covered by Microsoft 365 licenses that include Power Automate. Approvers don't need a premium license. If the process needs Dataverse or a premium connector, that is outside this offer and the call says so before anything is signed. | Offer §2.2; PMC row 2 |
| F5 | What does it cost, and how do we pay? | Price variant: $6,000 fixed, 30/40/30 by milestone. No-price variant: fixed price confirmed after the scoping call, paid 30/40/30 by milestone. Both: deemed acceptance after 5 business days; you can stop after the design and keep it. | Offer §4.1, §5; PMC Terms |
| F6 | What happens if it isn't a fit? | The scoping call gives a straight answer; if it isn't worth doing, Douglas says so ("If it isn't, I'll tell you that too", `services.html`). No pitch, no obligation (`index.html`). Whether the call is free is **[Input]** (PMC open question 2); do not say "free" until confirmed. | PMC Brand Voice, open question 2 |
| F7 | Can't we just do this ourselves in Power Automate? | Sometimes yes. The sprint is for the process that has resisted that, or that must be done right and documented in weeks. The call gives an honest answer. | PMC row 6 |
| F8 | Our IT team won't let business teams build things. Where does it live and who owns it? | Built in your existing Microsoft 365 environment, designed with IT, flows owned by an account you choose, governance habits from 200+ environments at a Fortune 50 healthcare company. | PMC row 5; Offer §1 D8 |
| F9 | What if we need more than the sprint covers? | Anything beyond the scope is written down as a change request; you choose to swap, park, or add it; nothing extra is built or billed without written approval. | Offer §2.4 |
| F10 | What happens after go-live? | 30-day fix window for defects against the signed checklist; the runbook shows your team how to change approvers and thresholds; later help by request. | Offer §1 D12, §6 |

Must not appear in the FAQ: the change-request hourly rate (open, Offer §8 item 13), GCC (open, item 14), contract form or net terms (open, items 4–5).

### 4.6 CTA (closes the page)

**Job:** one clear final action, with the written option for people not ready to book.

Content points: a short restatement (one process, 4 weeks, fixed price); the primary booking button; underneath, the short form (§5) introduced as the alternative for people who prefer to send context first; the email address as a last resort. A one-line note on what the 30-minute call covers (Offer §7.4, condensed).

### 4.7 How the two conversion options relate

- **Primary:** "Book a call". It is the only `.btn-dark` button on the page, the only control above the fold besides the text link, and it appears with the same label and destination wherever it appears (AC-LP-05).
- **Secondary:** the form. It never appears above the fold. It is reached by a plain text link near the hero ("Prefer to write first? Send a short note") that jumps to the form, and it sits below the booking button in the CTA section. Its submit button is `.btn-outline`, not `.btn-dark`, so it never looks like the main action.
- **After the form:** `/thank-you` offers the booking button again, so a form lead can still book.

---

## 5. Form specification

### 5.1 Fields

| Field | `name` | Label | Type / attributes | Required | Validation |
|---|---|---|---|---|---|
| Name | `name` | Your name | `text`, `autocomplete="name"`, `maxlength="120"` | Yes | 1–120 characters after trimming |
| Work email | `email` | Work email | `email`, `autocomplete="email"`, `maxlength="254"`, `inputmode="email"` | Yes | Browser email syntax check plus: one `@`, a dot in the domain, no spaces. Free-mail domains are accepted (a forwarded colleague may use one); Douglas qualifies on the call. |
| Company | `company` | Company | `text`, `autocomplete="organization"`, `maxlength="120"` | Yes | 1–120 characters after trimming |
| Process to fix | `process` | Which process do you want fixed? | `textarea`, `maxlength="2000"`, hint text below the label (not a placeholder): who starts it, who approves it, where it ends up | Yes | 10–2,000 characters after trimming |
| Hidden | `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `gclid` | — | `hidden` | No | Filled by `js/attribution.js` (§6.3). Each value: max 100 characters, only `A–Z a–z 0–9 . _ - + %` and space; anything else stripped. |
| Hidden | `landing_path` | — | `hidden` | No | `location.pathname`, fixed format |
| Honeypot | `website` | "Leave this field empty" (visually hidden) | `text`, `tabindex="-1"`, `autocomplete="off"`, wrapper `aria-hidden="true"` and hidden by a CSS class | — | Must be empty (§5.3) |
| Computed at submit | `elapsed_ms` | — | not a form control; added by `js/lead-form.js` to the JSON body | — | Whole milliseconds between page load and submit (`Math.round(performance.now())`) |

The field names above are the request contract in §5.8; the front end and the back end use exactly those names. The UTM and `gclid` client limit (100 characters) is stricter than the server limit (200) on purpose, so a value the client accepts is never rejected by the server.

Labels are visible `<label for>` elements. Required fields show "(required)" as text, not only an asterisk. The asterisk, if used, is not crimson (`.req` in `contact.html` uses `--accent` on small text, which `CLAUDE.md` forbids; do not copy it).

### 5.2 Validation, error, and success states

- Validate on submit, and on blur for fields already touched. Do not validate while the person is typing in a field for the first time.
- Field error: message text under the field, linked by `aria-describedby`, field gets `aria-invalid="true"`, red border plus the message (color is never the only signal). Messages say what to do ("Enter a work email like name@company.com"), not just "invalid".
- On a failed submit: an error summary at the top of the form with `role="alert"` and `tabindex="-1"` receives focus and lists each problem as a link to its field.
- Sending state: the submit button shows "Sending…", gets `disabled` and `aria-disabled="true"`, and the form gets `aria-busy="true"`.
- Server validation errors: on `400` with an `errors` object (§5.8), show each listed field's message with the same markup as a client-side error, mapped from the error code (`required`, `invalid`, `too_long`) to the field's own message text. The server never sends message text, only codes. An unknown field or code shows the general error alert (§5.5).
- Success: after the backend returns `200` with `{"ok": true}`, fire `submit_lead_form` (§6.2), then go to `/thank-you`. Navigation waits for the GA4 callback for at most 1 second, then proceeds anyway.

### 5.3 Honeypot and bot checks

- **Client:** if `website` has any value, or the form is submitted less than 3 seconds after page load, the script does not send anything, fires no event, and goes to `/thank-you` as if it succeeded (bots get no signal).
- **Server (the same two checks, for bots that skip the page script and post directly):** if `website` is not empty, or `elapsed_ms` is missing, not a whole number, or below 3,000, the function returns `200 {"ok": true}`, stores nothing, and sends nothing (§5.8). It logs the outcome (`honeypot` or `too_fast`) without field values.
- `elapsed_ms` is reported by the browser, so a bot that reads the script can fake it. It is a cheap filter, not a defense. The real limits on abuse are the route throttling and the Lambda concurrency cap (§7.2).
- No CAPTCHA in v1. Adding reCAPTCHA would add a Google script, CSP entries, and privacy disclosures. Add it only if spam arrives (§11).

### 5.4 Double-submit protection

- An in-flight flag in `js/lead-form.js`: a second submit event while a request is pending is ignored.
- The button is disabled while sending (§5.2) and re-enabled only on failure.
- Duplicates that still get through (for example a retry after a timeout that actually succeeded) are two DynamoDB items and two emails with the same email address and process text a few seconds apart; Douglas recognizes them by eye. Each item has its own server-generated `lead_id` (§5.6). No client-supplied idempotency key in v1.
- Enter key in a text field triggers the same guarded path.

### 5.5 Backend failure, timeout, and offline

- Request: `fetch("/api/lead", { method: "POST" })` to the same host as the page, with `Content-Type: application/json`, `Accept: application/json`, the JSON body in §5.8, and a 15-second timeout (`AbortController`). The endpoint path is one constant in `js/lead-form.js`.
- The 15 seconds covers a Lambda cold start (§11) with room to spare; the function's own timeout is 10 seconds, and API Gateway's integration timeout is longer than both, so the browser gives up last.
- **Any response other than `200 {"ok": true}` or a `400` with a usable `errors` object** (that is, `403`, `413`, `415`, `429`, any `5xx`, a body that is not JSON), **a network error, or a timeout:** keep every value the person typed; re-enable the button; show an inline alert (`role="alert"`): the message did not send, try again, or book a call directly, or email Douglas at the address shown. The booking link in the alert carries UTMs and fires `book_call` with `cta_location=form_error`. For `429` only, the alert says to wait a minute before trying again.
- **A timeout is not proof of failure.** The lead may have been stored. The alert wording does not say "nothing was received"; it says the page could not confirm it was sent. A second try can make a duplicate (§5.4).
- **Offline** (`navigator.onLine === false` at submit, or an `offline` event while sending): do not attempt; show the same alert with "You appear to be offline" wording; keep the data.
- **No JavaScript:** the endpoint accepts JSON only, so a plain HTML form post cannot work. The `<form>` carries the `hidden` attribute in the markup and `js/lead-form.js` removes it on load. A `<noscript>` block in its place gives the booking link and the email address. The form still has `method="post"` and `action="/api/lead"`, so if it is ever shown without the script, its values go in a request body that the server rejects with `415`, never into a URL query string.
- Nothing the person typed is written to browser storage (no draft saving), so personal data never sits in `localStorage`.

### 5.6 What is stored where

| Data | Where | How long |
|---|---|---|
| One item per real lead (fields below) | DynamoDB table in Douglas's AWS account, in the AWS region **[Input]** (default `us-east-1`; the repo names no region) | Until the item's time-to-live passes: `received_at` plus the lead retention period **[Input]: number of days**. DynamoDB deletes expired items itself, "typically within a few days after their expiration", without consuming write throughput (https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html, fetched 2026-11-10). The privacy page states the period and that deletion can lag by a few days. |
| The same lead, as a notification email | Sent by SES from and to Douglas's own verified address; lands in his Microsoft 365 mailbox | As long as Douglas keeps it **[Input]: mailbox retention period** for the privacy page. The DynamoDB TTL does not delete the email. |
| Request ID, outcome, field lengths; no field values | CloudWatch Logs, the function's log group | 30 days (retention set on the log group in the SAM template). API Gateway access logging stays off, so no source IP addresses are logged by the API. |
| Same lead, summarized | Douglas's outreach tracker | Douglas decides; stated in the privacy page |
| UTM values, `gclid`, capture time | Visitor's browser `localStorage` (one key, §6.3) | 30 days, then discarded |
| None of the form fields | GA4 | Never sent. GA4 receives only the event parameters in §6.2. |

**DynamoDB item fields.** Partition key `lead_id`, a UUID the function generates. Then `received_at` (ISO 8601, UTC), `expires_at` (Number, Unix epoch seconds, the table's TTL attribute; DynamoDB ignores a TTL attribute that is not a Number in epoch seconds, per the TTL page above), `name`, `email`, `company`, `process`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `gclid`, `landing_path` (empty strings omitted), and `email_status` (`sent` or `failed`, updated after the SES call). Not stored: `website`, `elapsed_ms`, IP address, user agent, cookies. Honeypot and too-fast submissions are not stored at all.

**SES notification email.** From and To: the one verified address (SAM parameter). Subject: fixed text, "New sprint lead (landing page)". Plain-text body: each stored field on its own labeled line, plus `lead_id` and `received_at`. `Reply-To`: the visitor's email address, so Douglas can answer with one click; this is a header on a message to Douglas, not a message to the visitor, and it is set only after the address has passed validation, which rejects any carriage return or line feed. No HTML body, no links built from input, no attachments.

**What the logs never contain.** The function never logs the event, the body, or any field value. Each log line holds the Lambda request ID, the outcome (`stored`, `stored_email_failed`, `invalid`, `honeypot`, `too_fast`, `too_large`, `bad_content_type`, `bad_origin`, `store_failed`), the HTTP status returned, and the length of each field. The SES or DynamoDB error code is logged; the error message is not, in case it echoes input.

Everything stays in Douglas's AWS account and region except the notification email, which leaves AWS for his Microsoft 365 mailbox.

**Contact page, unchanged.** The existing `contact.html` form still posts to Formspree (`https://formspree.io/f/xgobdbaq`). Leads from that page are held by Formspree, not in DynamoDB. Formspree's data location is **unverified** (not stated on its plans page); check its privacy policy before the privacy page is finalized, because `/privacy` covers the whole site (§9.1).

### 5.7 Privacy notice shown at the form

One or two short lines directly above the submit button, at body size and normal contrast (not small gray text): what is collected (the four fields plus how they found the page), why (to reply about this request), that it is not sold or added to a mailing list, that it is stored in Douglas's own Amazon Web Services account and emailed to him, and a link to `/privacy`. Final wording at copy stage, consistent with §9.1.

### 5.8 Request contract for `POST /api/lead`

One definition shared by `js/lead-form.js`, `scripts/mock-lead-api.py` (§5.9), and `infra/lead-api/`. A change here changes all three.

**Request.** `POST /api/lead` on `https://william.llcdouglashill.com` (same host as the page). Header `Content-Type: application/json` (a `; charset=utf-8` suffix is allowed). Body: one JSON object. All values are strings except `elapsed_ms`.

| Field | Required | Server rule | Error code on failure |
|---|---|---|---|
| `name` | Yes | Trimmed, 1–120 characters | `required`, `too_long` |
| `email` | Yes | Trimmed, at most 254 characters, one `@`, a dot in the domain, no spaces, no control characters (so no CR or LF) | `required`, `invalid`, `too_long` |
| `company` | Yes | Trimmed, 1–120 characters | `required`, `too_long` |
| `process` | Yes | Trimmed, 10–2,000 characters | `required`, `invalid` (under 10), `too_long` |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `gclid` | No | At most 200 characters each; only `A–Z a–z 0–9 . _ - + %` and space (the client's character set, §5.1) | `invalid`, `too_long` |
| `landing_path` | No | At most 200 characters; starts with `/`; same character set plus `/` | `invalid`, `too_long` |
| `website` | No (honeypot) | Must be empty or absent | none: a filled value gets the silent `200` below |
| `elapsed_ms` | Yes | Whole number, milliseconds between page load and submit | none: missing, not a whole number, or under 3,000 gets the silent `200` below |

Unknown fields are ignored and not stored. A field of the wrong JSON type counts as `invalid`.

**Order of checks.** 1. Origin secret header (§7.2) and `Origin` header. 2. Content type. 3. Body size. 4. JSON parse. 5. Honeypot and minimum time. 6. Field validation. 7. Store. 8. Email.

**Responses.** Every response body is JSON with `Content-Type: application/json` and `Cache-Control: no-store`. No response ever contains a submitted value.

| Status | Body | When |
|---|---|---|
| `200` | `{"ok": true}` | Stored. Also when the email then fails (the lead is safe; the failure is logged and alarmed). |
| `200` | `{"ok": true}` | Honeypot filled, or the minimum time not met. Nothing stored, nothing sent, so a bot learns nothing. |
| `400` | `{"ok": false, "errors": {"<field>": "<code>"}}` | Field validation failed. One code per failing field, from `required`, `invalid`, `too_long`. A body that is not valid JSON, or not a JSON object, returns `400 {"ok": false, "errors": {}}`. |
| `403` | `{"ok": false}` | The CloudFront origin secret header is missing or wrong (a direct call that bypassed CloudFront), or an `Origin` header is present and is not `https://` plus the allowed host. |
| `413` | `{"ok": false}` | Body larger than 10 KB (10,240 bytes, measured after any base64 decoding). |
| `415` | `{"ok": false}` | Content type is not `application/json`. |
| `429` | API Gateway's own body | Route throttling tripped (§7.2). Sent by API Gateway, not the function, so the client must not assume this body's shape. |
| `5xx` | `{"ok": false}` (or API Gateway's own body if the function itself failed) | Server fault, including a failed DynamoDB write. The page shows its error state (§5.5). |

`403` and `415` are additions to the minimum contract: a status had to be chosen for the origin check and the content-type check, and these are the standard ones. The client treats both like any other failure (§5.5).

**Store first, email second.** The function writes the DynamoDB item, and only after the write succeeds does it call SES. If the write fails: `5xx`, no email. If the write succeeds and SES fails: `200 {"ok": true}`, `email_status` set to `failed`, an error log line, and the `EmailFailures` alarm (§7.2) fires. A lead is never lost to a mail problem.

### 5.9 Local development before the backend exists

The front end is built and tested against `scripts/mock-lead-api.py`, a small Python standard-library server that serves the repo's static files (applying the same clean-URL rewrite as the CloudFront Function, §7.1) and implements the contract in §5.8 at `POST /api/lead`, on `http://localhost:8000`. It validates with the same rules and returns the same statuses and bodies (except the origin-secret check, which only CloudFront can satisfy), writes nothing to disk, and prints only the outcome and field lengths. It has switches to force each failure the front end must handle: `--fail 500`, `--fail 429`, `--fail 413`, `--delay 20` (to trigger the 15-second timeout), and `--fail email` (returns `200`, as the real function does when only the email fails). Because it serves the pages from the same origin, the page's `fetch("/api/lead")` works unchanged.

It lives under `scripts/`, which the deploy allowlist never includes (§7.5), so it is never uploaded. It is not a substitute for the handler's unit tests or the end-to-end test after deploy (§8.11).

---

## 6. Tracking requirements

GA4 is added only to the four new pages. Existing pages stay untagged in this phase (no redesign of existing pages); visits to them are not measured.

### 6.1 Loading GA4

- `js/analytics.js` loads `gtag.js` from `https://www.googletagmanager.com` and calls `config` with the measurement ID **[Input]**. No inline snippet (CSP, §7.3).
- If `navigator.globalPrivacyControl === true`, GA4 is not loaded at all and events are no-ops. The privacy page says so.
- GA4 property settings required (documented in `marketing-launch/tracking.md` later): Google signals off; ads personalization off; no Google Ads link in this phase; data retention set to the shortest option that still covers the test **[Input]**; internal traffic filter for Douglas's own visits if he wants it.
- If the GA4 script fails to load (ad blocker, network), the page, the booking link, and the form work exactly the same. No event call may throw.

### 6.2 Events

GA4 limits (support.google.com/analytics/answer/9267744, fetched 2026-11-10): event and parameter names up to 40 characters, parameter values up to 100 characters, up to 25 parameters per event. The events below fit.

| Event | Fires when | Does not fire when | Parameters |
|---|---|---|---|
| `book_call` | A booking link is activated (click, tap, or keyboard Enter), on the landing page, thank-you page, or form-error alert. Fires before the new tab opens; never blocks navigation. | Middle-click or "open in new tab" may not fire; accepted. | `cta_location` (`hero`, `cta_section`, `thank_you`, `form_error`, or one more fixed value), `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `has_gclid` (`true`/`false`), `page_path` |
| `submit_lead_form` | The backend returned `200 {"ok": true}` for a real submission (§5.8). | Validation fails, the honeypot or timing check trips, the backend fails, or `/thank-you` is loaded or refreshed. | `form_id` (`lp_sprint`), `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `has_gclid`, `page_path` |

- `gclid` itself is not sent as an event parameter. GA4 reads it from the landing URL on its own, and it carries no meaning outside Google Ads.
- UTM parameters are attached from the stored values (§6.3), not re-read from the current URL, so a booking click on `/thank-you` carries the landing values.
- Empty values are sent as `(not set)` or omitted, consistently; the choice goes in `tracking.md`.
- Both event parameters must be registered as event-scoped custom dimensions in GA4 to be reportable. `submit_lead_form` and `book_call` should be marked as key events. Both steps go in `tracking.md`.

### 6.3 How UTM and `gclid` values persist

1. On every page load of the four new pages, `js/attribution.js` reads `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, and `gclid` from `location.search`.
2. If any of the five is present, it sanitizes them (§5.1 rule), and saves all five (missing ones as empty) plus a timestamp under one `localStorage` key, replacing what was there. Rule: latest visit with tags wins.
3. If none is present, stored values younger than 30 days are kept; older ones are deleted.
4. Storage access is wrapped in `try/catch`. If storage is unavailable (private mode, some in-app browsers), values live in memory for the current page only, and the booking link and form still use whatever the current URL carried.
5. The form's hidden fields are filled from the stored values when the form is first focused and again just before submit.
6. Every booking link is decorated at click time: the four UTM values are appended to the Calendly URL as `utm_source`, `utm_medium`, `utm_campaign`, `utm_term` (Calendly accepts standard UTM parameters on scheduling links; values up to 255 characters per Calendly community notes, **unverified** on Calendly's own help page). `gclid` is not passed to Calendly; Calendly does not support it as a UTM field (same source, **unverified**).
7. Values are only ever written with `.value` or `URLSearchParams`, never inserted as HTML (§8.6).

UTM naming requirements (values defined later in `tracking.md`): lowercase; hyphens, no spaces; a fixed list of `utm_source` values (at least `linkedin`, `warm-network`) and `utm_medium` values (at least `dm`, `email`, `profile`); one `utm_campaign` value per test (for example `sprint-test-2026-11`); `utm_term` optional and used only for a variable Douglas wants to compare (for example message variant). Every outreach link is built from that list; no hand-typed variants.

### 6.4 What cannot be measured, stated honestly

- **A completed Calendly booking is not visible in GA4.** The booking happens on `calendly.com`. With a plain link, the site sees only the click (`book_call`), which is intent, not a booking. Calendly's Google Analytics integration is on the Standard plan and above, not Free (calendly.com/pricing, fetched 2026-11-10: Standard $10 per seat per month as shown; billing basis not confirmed). An embedded widget can post a `calendly.event_scheduled` message to the page, but a Calendly community report (April 2026, unanswered, **unverified**) says the payload carried only the event name. This PRD does not embed (§7.3).
- **Completed bookings are counted from Calendly**: its scheduled-events list, the UTMs on each invitee (confirm with a test booking), and the "how did you hear about me" answer. Douglas joins these to the tracker by hand. Booking clicks without a matching booking are the Calendly drop-off.
- **GA4 undercounts.** Ad blockers, GPC, and some in-app browsers block or limit it. The share is unknown. Lead items in DynamoDB (and their notification emails) and Calendly bookings are the ground truth; GA4 is for rates and channel comparison only.
- **Forwarded links inherit the sender's UTMs** (§3.2). Only the tracker and the Calendly answer can tell a forward apart.
- **Replies that skip the site** (a LinkedIn reply, an email reply, a booking from Douglas's own Calendly link on his profile) never touch the page. The tracker records them.
- **Traffic volume is small.** At the planned 75–180 outreach messages (Channels §6), GA4 rates will be noisy. Do not read percentages from fewer than about 20 visits per channel.

### 6.5 Consent and privacy implications

- Audience is US companies. No consent banner in v1. Mitigations: GA4 with Google signals and ads features off, no ads link, no pixels, GPC honored by not loading GA4, no form data sent to GA4, and a plain privacy page. Whether a banner is needed for non-US visitors who receive a forwarded link is a question for Douglas's legal review (§11).
- GA4 sets first-party cookies (`_ga`, `_ga_<id>`). The attribution script uses `localStorage` for 30 days. Both are disclosed in `/privacy`.
- Calendly sets its own cookies on its own domain; because the site links rather than embeds, no Calendly script or cookie runs on the site.
- Google Fonts requests send the visitor's IP address to Google (§7.4); disclosed in `/privacy`.

---

## 7. Stack recommendation with tradeoffs

**Recommendation: keep the current static HTML/CSS/JS, no build step, no framework.** No concrete blocker exists: the form backend is a separate serverless API defined in `infra/lead-api/` and reached through CloudFront at `/api/lead` (§7.2), so the site itself stays static; clean URLs are handled at CloudFront; and four pages do not need templating.

| Criterion | Static HTML/CSS/JS (current) | Static-site generator (Eleventy or Astro) | Framework (Next.js static export) |
|---|---|---|---|
| Page speed | Best case already: one CSS file, a few KB of JS, no runtime | Same output if configured well; Astro ships zero JS by default | Adds a JS runtime and hydration unless carefully disabled |
| Maintenance | Header and footer are copy-pasted (already true for the existing site); four new pages add little | Partials remove copy-paste; adds Node, a lockfile, dependency updates | Most dependencies and updates of the three |
| Build complexity | None; deploy is `aws s3 sync` of an allowlist (§7.5) | A build step must run before every deploy; output folder must map to clean URLs | Build step plus export configuration |
| Risk in a 30-day test | Lowest; matches how the site already works | Medium: new toolchain, and existing pages would sit outside it | Highest; also invites a rewrite of existing pages, which is out of scope |

Small additions that stay within "no build step": a shell or Node check script run before deploy (placeholders, price block, secrets, link check, §10), and a deploy script with an explicit file allowlist (§7.5).

Doc drift to note, not fix here: `DESIGN.md` says Tailwind loads from a CDN and "Contact is mailto + LinkedIn — no form dependency". In the repo, the Tailwind CDN is removed (`css/styles.css`: "RESET (replaces Tailwind preflight; CDN removed)") and `contact.html` posts to Formspree.

### 7.1 Clean URLs on S3 behind CloudFront

**What is known (checked with HEAD requests on 2026-11-10):** `/thank-you.html` returns 200; `/thank-you`, `/thank-you/`, and `/contact` return 404; unknown paths return the site's own `404.html` with status 404 (`x-cache: Error from cloudfront`), so a custom error response or an S3 error document is configured. Responses carry `server: AmazonS3` and `x-amz-server-side-encryption: AES256`. **Plain `http://` returns 200 with the page instead of redirecting to HTTPS.** No `Cache-Control` header on HTML, CSS, or images. The live `index.html` (23,312 bytes, last modified 2026-06-15) is older than the repo copy.

**Options:**

| Option | How it works | Works with S3 REST origin (OAC/OAI) | Works with S3 website endpoint | Problems |
|---|---|---|---|---|
| A. Folder with `index.html` | Store `lp/process-automation/index.html`; request `/lp/process-automation/` | No. REST origins only apply CloudFront's default root object to `/`, not to subfolders | Yes, for `/lp/process-automation/`. Without the slash, S3 website hosting answers with a redirect to the slash form | Gives trailing-slash URLs, not the ones in scope. Website endpoint means a public bucket and HTTP-only origin traffic |
| B. Extensionless objects | Upload an object named `lp/process-automation` with `Content-Type: text/html` | Yes | Yes | `aws s3 sync` sets content type from the file extension, so these objects need a separate `aws s3 cp --content-type text/html` step on every deploy; a plain sync silently serves them as `binary/octet-stream`. Fragile. Files without extensions are also awkward to preview locally |
| C. CloudFront Function rewrite (viewer request) | Store `lp/process-automation/index.html`; a function rewrites `/lp/process-automation` to `/lp/process-automation/index.html` before the origin request | Yes | Yes | One small function to test and publish; it runs on every request in the behaviors it is attached to |
| D. Rely on S3 website endpoint behavior | Same as A | — | Yes | Same as A: trailing slashes, public bucket |

**Recommendation: option C.** Source files live at `lp/process-automation/index.html`, `thank-you/index.html`, `privacy/index.html`, `terms/index.html`. One viewer-request CloudFront Function, attached to every cache behavior **except `/api/*`**, does three things in this order. (Attached to `/api/*`, rule 3 would rewrite `/api/lead` to `/api/lead/index.html` and every submission would fail; §7.2 and §11.)
1. **Fixed redirects:** `/thank-you.html` → 301 to `https://william.llcdouglashill.com/thank-you`. (Formspree's `_next` on `contact.html` still points at the old URL; the 301 covers it without editing `contact.html`.)
2. **Trailing slash:** a URI other than `/` that ends in `/` → 301 to the same path without the slash.
3. **Rewrite:** a URI whose last segment has no `.` → append `/index.html`. URIs with an extension (all existing pages, assets) pass through unchanged.

Function safety rules: build every `Location` as an absolute URL on the fixed host `https://william.llcdouglashill.com`, never from the `Host` header; collapse repeated leading slashes first, so `//evil.example/` cannot become a protocol-relative redirect (§8.6); preserve the query string on redirects so UTMs survive. Test it with the CloudFront Functions test feature against at least: `/`, `/index.html`, `/lp/process-automation`, `/lp/process-automation/`, `/lp/process-automation?utm_source=x`, `/thank-you.html`, `/thank-you.html?a=1`, `//evil.example/`, `/css/styles.css`, `/does-not-exist`. Publish only after all pass.

**The old URL:** `/thank-you.html` 301s to `/thank-you` from the day the function is live. After the redirect is verified, delete `thank-you.html` from the repo so the next `--delete` sync removes the object.

**[Verify] before building the function (read-only checks; Douglas runs them or approves them being run):**
1. The distribution ID for `william.llcdouglashill.com`, and its alternate domain names.
2. The origin type: S3 REST endpoint with OAC or OAI, or S3 website endpoint. The bucket in the deploy notes is `douglashillres.llcdouglashill.com`, which does not match the host name, so confirm which bucket actually serves the site.
3. Default root object setting.
4. Custom error responses (which status codes map to `/404.html`, and whether 403 is mapped to 404 with a 404 status).
5. Viewer protocol policy (the HTTP check above suggests "HTTP and HTTPS"; it must become "Redirect HTTP to HTTPS").
6. Any existing CloudFront Functions or Lambda@Edge associations, and existing response headers policies.
7. Cache behaviors and their path patterns, cache policy, and whether query strings are forwarded or part of the cache key (UTMs in the cache key fragment the cache; they should be excluded from the key since the pages are static).
8. Whether access logging is on (affects the privacy page).
9. The TLS certificate and minimum TLS version.
10. Bucket public-access settings and bucket policy.
11. Whether any existing behavior already uses the `/api/*` path pattern, and the behavior order (the new `/api/*` behavior must sit above the default behavior).

### 7.2 Form backend options

**Decision: AWS Lambda (Douglas's choice, 2026-11-10).** Douglas reviewed the first draft, which recommended Formspree, and chose AWS Lambda, in his words the AWS version of a Microsoft Function App. The comparison below is kept for the record. Formspree is **considered, not chosen for the new page**; it stays in use on the existing `contact.html`, which this build does not change.

Pricing checked on each vendor's page on 2026-11-10 unless labeled. The AWS column is the design specified after the table; its detailed figures are in "Pricing and cost estimate" below.

| | Formspree (considered, not chosen) | Basin | Web3Forms | AWS: API Gateway HTTP API + Lambda + DynamoDB + SES (**chosen**) | Power Automate HTTP-triggered flow |
|---|---|---|---|---|---|
| **Cost** | Free: $0, 50 submissions/month, unlimited forms, 30-day archive. Personal: $15/month ($10/month billed yearly), 200/month, unlimited archive. Source: https://formspree.io/plans (2026-11-10) | Free: $0, 50/month, 1 form, 30-day retention. Starter $12.50/month billed yearly, 250/month, 365-day retention. Source: https://usebasin.com/pricing (2026-11-10) | Free plan reported at 250/month with 30-day history; paid prices conflict across sources ($12–$18/month). **Unverified:** web3forms.com/pricing returned HTTP 403; figures from third-party search summaries only | Under one cent a month at list prices at this volume; $0 while free-tier allowances apply. Estimate and per-service sources in "Pricing and cost estimate" below | Needs a Power Automate Premium license for the flow owner: $15.00 per user/month (Offer §2.2, fetched 2026-11-10). The "When an HTTP request is received" trigger is premium per third-party and community sources; **not confirmed** on a Microsoft page in this session |
| **Reliability of delivery** | Hosted service; email notification plus dashboard archive | Hosted; email plus dashboard | Hosted; email only on free (reported) | As reliable as the code Douglas owns; SES sandbox allows sending only to verified addresses, 200 messages per 24 hours, 1 per second, which is enough for notifications to his own address. Source: https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html | Reliable once running; flow failures appear in run history |
| **Spam protection** | Formshield "Basic" on free; custom reCAPTCHA on free; "Honeypot" listed as Business-plan feature (plans page) | "Basic" on free | Reported advanced spam filter and hCaptcha on free (**unverified**) | Only what is written: honeypot, timing, field limits, `Origin` check, CloudFront secret header, route throttling and a Lambda concurrency cap to bound cost. AWS WAF is not available on HTTP APIs (https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html) | Only what is built in the flow; the "Anyone" trigger has no protection beyond a secret URL |
| **Setup effort for Douglas** | Lowest. The repo already posts to `https://formspree.io/f/xgobdbaq` from `contact.html`; if that is his account, setup is creating one more form and confirming the notification address | Low: account, one form | Low: access key by email | Highest: a SAM template (function, IAM role, HTTP API, table, alarms) written for him; he verifies one SES address, runs `sam deploy`, adds the `/api/*` origin and behavior on CloudFront, and confirms the alarm email subscription. No CORS, because the request is same-origin | Medium for Douglas (his own skill set), but needs a Premium license and a decision on trigger auth |
| **Privacy and data location** | Data held by Formspree; location **unverified** (not on plans page) | Held by Basin; location **unverified** | Held by Web3Forms; location **unverified** | Stays in Douglas's AWS account and region, plus his inbox | Stays in Douglas's Microsoft 365 tenant (for example a SharePoint list) |
| **When it fails** | Front end shows the error state (§5.5); Formspree status page; over-quota behavior on free **unverified** | Same | Same | Front end error state; store-first design keeps the lead if only email fails; CloudWatch alarms defined in the template email Douglas | Front end error state; flow run history |
| **Other** | Free plan has no custom redirect, but AJAX submit (included on free) makes that irrelevant | — | Access key is public by design | Can sit behind CloudFront at `/api/lead`, so CSP `connect-src 'self'` and no CORS | "Anyone" mode is the legacy setting: "Anyone can trigger this workflow if they have access to the URL" (https://learn.microsoft.com/power-automate/oauth-authentication). The tenant-auth modes need a bearer token, which an anonymous browser visitor cannot get, so a public site form would have to use "Anyone" with the signed URL exposed in client JavaScript |

**Recommendation: AWS Lambda, as Douglas chose, behind an API Gateway HTTP API on the same CloudFront distribution as the site.** It keeps every lead in his own AWS account, costs under a cent a month at this volume, and sits on the same host as the page, so there is no CORS and the CSP stays `'self'`. The cost is build work and the fact that Douglas owns its operation; the alarms below are how he finds out it broke.

**Formspree: considered, not chosen for the new page.** It would have been the least setup ($0, 50 submissions a month on the free plan, already used by `contact.html`). It is not used for the landing page.

**Fallback: the existing Formspree account, as a decision for Douglas.** If the Lambda backend cannot be deployed in time for day 1, Douglas can decide to point the landing page form at a new Formspree form instead. That is not a one-line change: it means a different request format, a CSP change (`connect-src` and `form-action` add `https://formspree.io`), a different privacy page, and a different honeypot field name. It is not built in advance. If Douglas chooses it, this section and §5, §8.4, and §9.1 are revised first.

Power Automate is not recommended for the public form: the premium license cost, and the only trigger mode a public browser can call exposes a URL that anyone can use.

#### Design of the lead API

```
browser ──POST /api/lead──▶ CloudFront (william.llcdouglashill.com)
                              │  behavior /api/*: no cache, POST allowed,
                              │  AllViewerExceptHostHeader, adds x-origin-verify
                              ▼
                            API Gateway HTTP API, $default stage
                              │  one route: POST /api/lead, throttled
                              ▼
                            Lambda (Python, stdlib + boto3)
                              ├─1─▶ DynamoDB table (on-demand, TTL on expires_at)
                              └─2─▶ SES (sandbox: from and to Douglas's verified address)
```

- **Request and responses:** exactly the contract in §5.8.
- **API Gateway HTTP API:** one route, `POST /api/lead`, a Lambda proxy integration with payload format version 2.0, deployed to the `$default` stage with auto-deploy. No other routes, so any other path or method gets API Gateway's own `404`. No CORS configuration (same-origin). Access logging off (§5.6).
- **Route throttling (proposal, Douglas may change it):** rate limit 1 request per second, burst limit 5, set on the `POST /api/lead` route of the `$default` stage, with the stage default route throttling set to the same values. A few submissions a day never come close; a bot loop is cut off at about 86,400 requests a day, which bounds the worst-case bill (estimate below). HTTP APIs support stage-level and route-level throttling; route-level throttling is set through the stage's route settings (https://docs.aws.amazon.com/help-panel/apigateway/latest/console/http-throttling.html, fetched 2026-11-10). In SAM this is the `DefaultRouteSettings` and `RouteSettings` properties of `AWS::Serverless::HttpApi`.
- **Lambda function:** Python, standard library plus the `boto3` that the Lambda Python runtime provides; no third-party packages and no packaged dependencies. Newest Python runtime Lambda supports at build time; `arm64`; 128 MB memory; 10-second timeout; reserved concurrency 2 as a second cost cap. (A new account's concurrency quota can be too low to reserve any; if `sam deploy` rejects the setting, drop it and rely on throttling. **Unverified** for Douglas's account.) The IAM role allows only `dynamodb:PutItem` and `dynamodb:UpdateItem` on the one table, `ses:SendEmail` on the one identity, and writing its own logs.
- **Handler steps:** the order of checks in §5.8, then store, then email. Compare the origin secret with `hmac.compare_digest`. Decode a base64 body when `isBase64Encoded` is true before measuring size and parsing. Header names arrive in lowercase in payload format 2.0.
- **DynamoDB table:** on-demand billing (`PAY_PER_REQUEST`), partition key `lead_id`, TTL enabled on `expires_at`, server-side encryption on (DynamoDB's default), `DeletionPolicy: Retain` so deleting the stack does not delete leads. Point-in-time recovery off by default (it is a paid feature; Douglas's call, §11 open question 8).
- **SES:** stays in the sandbox. Sender and recipient are both Douglas's one verified email address (SAM parameter). No email is ever sent to the visitor. The sandbox allows this: in the sandbox "You can only send mail **to** verified email addresses and domains, or to the Amazon SES mailbox simulator", with "a maximum of 200 messages per 24-hour period" and "a maximum of 1 message per second". The sandbox is per Region, so the identity must be verified in the same region as the stack. (https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html, fetched 2026-11-10.) The route throttle of 1 per second matches the SES sandbox send rate; a burst of 5 can briefly exceed it, and an SES throttling error is then an email failure after a successful store, so the lead is kept.
- **Alarms:** an SNS topic with an email subscription to Douglas's address (he confirms the subscription email once). Three CloudWatch alarms, each on 1 or more in a 5-minute period: `EmailFailures` (a log metric filter on outcome `stored_email_failed`), `StoreFailures` (metric filter on `store_failed`), and the function's `Errors` metric. SNS delivers through its own email path, not SES, so an SES problem still raises the alarm.
- **Parameters:** `NotificationEmail` (the verified address), `AllowedOriginHost` (default `william.llcdouglashill.com`), `TableName` (default `lead-api-leads`), plus `RetentionDays` (no default, so the deploy cannot proceed without Douglas's retention input, §10) and `OriginVerifySecret` (`NoEcho: true`, see "Keeping callers off the direct API URL" below).
- **Files in `infra/lead-api/`:** `template.yaml` (SAM), `src/handler.py`, `tests/test_handler.py`, `README.md` (prerequisites, `sam build`, `sam deploy --guided`, the CloudFront steps below, how to rotate the secret, how to run the tests, how to delete the stack). `samconfig.toml` is git-ignored because it can hold parameter values. Douglas deploys it himself with the SAM CLI. Nothing is deployed before the deploy gate (§12).

#### CloudFront to HTTP API forwarding (verified against AWS documentation, 2026-11-10)

| Setting | Value | Source |
|---|---|---|
| Origin domain | The HTTP API's default endpoint host only, `<api-id>.execute-api.<region>.amazonaws.com`, with no `https://` and no path (a stack output) | https://repost.aws/knowledge-center/api-gateway-id-invoke-url (HTTP invoke URL format) |
| Origin path | Empty. With the `$default` stage, "the HTTP API URLs might not include the stage name", so no stage prefix is needed. A wrong base path in the origin path gives a 403 | Same page; https://repost.aws/knowledge-center/api-gateway-domain-cloudfront ("For Origin path, keep blank") |
| Origin protocol | HTTPS only, port 443, minimum origin SSL protocol TLSv1.2 | https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/template-preconfigured-origin-settings.html (API Gateway origin preconfigured settings) |
| Origin custom header | `x-origin-verify: <secret>`. CloudFront adds it; "If a header is present, CloudFront overwrites the header value before forwarding", so a viewer cannot supply their own | https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/add-origin-custom-headers.html |
| Behavior path pattern | `/api/*`, placed above the default behavior | https://repost.aws/knowledge-center/cloudfront-requests-origins (path patterns, precedence) |
| Allowed methods | `GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE` (the only CloudFront set that includes POST); the API itself answers only `POST /api/lead` | Preconfigured settings page above |
| Cache policy | Managed `CachingDisabled` | Preconfigured settings page; https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html |
| Origin request policy | Managed `AllViewerExceptHostHeader`: forwards viewer headers (including `Content-Type` and `Origin`), cookies, and query strings, but not `Host`. AWS: "If you create a custom policy for Amazon API Gateway origins without a custom domain, then don't forward the host header. Otherwise, you get a 403 error." | Preconfigured settings page; https://repost.aws/knowledge-center/configure-cloudfront-to-forward-headers |
| Viewer protocol policy | Redirect HTTP to HTTPS (same as the rest of the site, §7.1 item 5) | Preconfigured settings page |
| Function associations | None. The URL-rewrite function must not be attached here (§7.1) | §7.1 |
| Response headers policy | "lp-strict" (§7.3); the security headers are harmless on JSON | §7.3 |

**Path seen by API Gateway.** CloudFront does not strip the path pattern; it sends the viewer's path to the origin, prefixed by the origin path, which is empty ("CloudFront appends the directory path to the origin domain name", https://docs.aws.amazon.com/help-panel/AmazonCloudFront/latest/console/origin-path.html). With the `$default` stage, the route that matches is `POST /api/lead`, so the route is defined with the `/api` prefix. That the `$default` stage passes `/api/lead` through to route matching with no stage segment is consistent with the invoke-URL note above but is **not stated in so many words on the pages fetched**; the first end-to-end test (§8.11) confirms it before anything else.

**POST bodies.** CloudFront forwards the request body for POST when POST is an allowed method; origin request policies control headers, cookies, and query strings, not the body. No setting is needed beyond allowed methods. (Inferred from the API Gateway preconfigured settings, which use this combination for APIs; **no page fetched states it directly.**)

#### Keeping callers off the direct API URL

The HTTP API's default `execute-api` URL is public. Options considered:

| Option | What it does | Verdict |
|---|---|---|
| A. Secret origin header checked by the function | CloudFront adds `x-origin-verify` with a random value of at least 32 characters; the function returns `403` without it. AWS describes this pattern: "By configuring your origin to respond to requests only when they include a custom header that gets added by CloudFront, you prevent users from bypassing CloudFront" (add-origin-custom-headers page above) | **Recommended** |
| B. Same header, checked by a Lambda authorizer | AWS's published pattern for HTTP APIs (https://aws.amazon.com/blogs/networking-and-content-delivery/restricting-access-http-api-gateway-lambda-authorizer/) | A second function, a Secrets Manager secret, and rotation logic. More parts than one route needs |
| C. Disable the default endpoint | Clients can then reach the API only through an API Gateway custom domain name (https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-disable-default-endpoint.html) | Needs a second host name, a certificate, and DNS, and the custom domain is itself public, so a header check is still needed |
| D. AWS WAF on the API | Not available: WAF integration is a REST API feature, not an HTTP API one (https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html) | Not possible |
| E. Accept direct calls; rely on throttling and validation | Simplest | A direct caller could store junk leads and trigger notification emails without going through the site |

**Why A.** It costs nothing, adds no resources, and closes the bypass for storing and emailing: without the secret, nothing is stored and nothing is sent. Throttling still applies to direct calls, so they cannot run up the bill either. Its limits, stated plainly: a direct call still invokes the function (it is rejected in the first check, in milliseconds); and the secret is readable by anyone with read access to the Lambda configuration or the CloudFront distribution in Douglas's account, which is only Douglas. The secret is passed as the `NoEcho` parameter `OriginVerifySecret`, stored as a function environment variable, never committed, and entered once in the CloudFront origin. To rotate: deploy the function with a new value that accepts either the old or the new secret, change CloudFront, then deploy again with only the new one; the README gives the steps.

#### Pricing and cost estimate

Checked on AWS's own pages on 2026-11-10. AWS pricing pages render their rate tables with scripts, so several rates below come from the worked examples on those pages, as labeled. All rates are US East (N. Virginia) unless noted.

| Service | Rate | Free tier | Source |
|---|---|---|---|
| Lambda | $0.20 per 1M requests; $0.0000166667 per GB-second (from the page's examples; the `arm64` rate table did not render in the fetched text, so the estimate uses this rate as an upper bound) | "one million requests and 400,000 GB-seconds per month"; the page does not say whether this is always free or time-limited | https://aws.amazon.com/lambda/pricing/ |
| API Gateway HTTP API | $1.00 per million requests for the first 300 million (from the page's example, region not named); metered in 512 KB increments (from the example) | One million HTTP API calls per month for up to 12 months for new customers | https://aws.amazon.com/api-gateway/pricing/ |
| DynamoDB on-demand | $0.625 per million write request units; $0.125 per million read request units (from the page's US East example); storage $0.25 per GB-month (Standard table class) | First 25 GB of storage. No on-demand request allowance is listed (the 25 WCU/RCU free tier is for provisioned capacity). TTL deletes do not consume write throughput (TTL page, §5.6) | https://aws.amazon.com/dynamodb/pricing/on-demand/ |
| SES | $0.10 per 1,000 outbound emails; $0.12 per GB of attachments (none here) | No monthly message allowance listed. New customers "will receive up to $200 in AWS Free Tier credits" usable on SES and other eligible services, to be used within 12 months | https://aws.amazon.com/ses/pricing/ |
| CloudWatch Logs and alarms | Ingestion $0.50 per GB (standard class, from the page's examples); $0.10 per alarm metric per month (from the examples) | 5 GB of data a month (ingestion, archive storage, and Logs Insights scanned, combined); 10 standard-resolution alarm metrics | https://aws.amazon.com/cloudwatch/pricing/ |
| AWS Free Tier credits | Customers who signed up on or after July 15, 2025 can receive up to $200 in credits, usable within 12 months of account creation | — | https://aws.amazon.com/api-gateway/pricing/ (stated there) |

SNS email delivery for the three alarms is not priced here (**unverified**; a handful of alarm emails a month is expected to be negligible). The CloudFront requests to `/api/*` are part of the existing distribution's traffic; CloudFront's pricing page showed only flat-rate plans in this session (Sources), so that line is **unverified**.

**Monthly cost estimate (an estimate, not a quote).** Assumptions: 100 requests a month to `/api/lead` (about 50 real leads, the weekly synthetic tests, and some bot traffic), each lead item up to 3 KB, one item write plus one `email_status` update per lead, 0.5 seconds at 128 MB per invocation, 1 MB of logs.

| Line | Arithmetic at list price | Result |
|---|---|---|
| API Gateway | 100 × $1.00 / 1M | $0.0001 |
| Lambda requests and duration | 100 × $0.20 / 1M, plus 100 × 0.5 s × 0.125 GB × $0.0000166667 | $0.0001 |
| DynamoDB writes | about 300 write units × $0.625 / 1M | $0.0002 |
| DynamoDB storage | about 0.15 MB | $0.00 (inside 25 GB) |
| SES | 50 × $0.10 / 1,000 | $0.005 |
| CloudWatch Logs | 1 MB × $0.50 / GB | $0.0005 (inside 5 GB) |
| Alarms | 3 alarm metrics | $0.00 inside the 10 free; $0.30 if not |
| **Total** | | **under $0.01 a month, or $0.31 if the alarm free tier does not apply; $0 while free-tier allowances or credits cover it** |

**Worst case under abuse.** If a bot holds the throttle at 1 request per second for a whole month (about 2.6 million requests), API Gateway is about $2.60, Lambda requests about $0.52 before any free tier, and duration and logs stay small because rejected requests end in milliseconds. Roughly $3–$5 for that month. Douglas may want an AWS Budgets alert at $5 (his choice; Budgets pricing not checked).

**Region.** The stack, the table, the SES identity, and the logs all live in one AWS region **[Input]**, default `us-east-1`. The repo names no region (searched 2026-11-10).

### 7.3 Security headers and Calendly

**Where they are set:** a CloudFront response headers policy attached to each cache behavior. S3 cannot set these headers itself. Two policies:

- **Policy "lp-strict"** on a new cache behavior for path pattern `/lp/*` (same origin, same viewer-request function). The other three new pages could get their own behaviors too, but they contain no form, so the site policy below is enough for them.
- **Policy "site"** on the default behavior, covering existing pages and `/thank-you`, `/privacy`, `/terms`.
- The `/api/*` behavior (§7.2) also uses "lp-strict". The function sets `Cache-Control: no-store` on every API response itself.

Headers in both policies:
- `Strict-Transport-Security: max-age=31536000` (no `includeSubDomains` needed for this single host; no `preload`). Start at `max-age=300` for a week, then raise. HSTS only helps once HTTP redirects to HTTPS, so the viewer protocol policy change in §7.1 item 5 comes first.
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY` plus CSP `frame-ancestors 'none'`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- Optionally remove `server` and `x-amz-server-side-encryption` from responses (response headers policies can remove headers; confirm in the console when configuring).

`Content-Security-Policy` for "lp-strict" (enforced):
```
default-src 'self';
script-src 'self' https://www.googletagmanager.com;
style-src 'self' https://fonts.googleapis.com;
font-src https://fonts.gstatic.com;
img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com;
connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com;
form-action 'self';
frame-src 'none';
frame-ancestors 'none';
base-uri 'self';
object-src 'none';
upgrade-insecure-requests
```
The GA4 hosts follow Google's published CSP guidance for the Google tag (https://developers.google.com/tag-platform/security/guides/csp; **not fetched in this session**, confirm during build). The lead API is on the same host (`/api/lead`), so `connect-src 'self'` covers it and no AWS host appears in the policy. `form-action 'self'` covers the form's fallback `action="/api/lead"` (§5.5).

`Content-Security-Policy` for "site": the same, plus `'unsafe-inline'` in `script-src` and `style-src` (existing pages use inline `<style>` blocks, and `contact.html` uses an inline script and an `onclick`), plus `https://assets.calendly.com` in `script-src` and `style-src` and `https://calendly.com` in `frame-src` (the `contact.html` popup), plus `form-action 'self' https://formspree.io` (the existing `contact.html` form posts to Formspree with a plain HTML form; no new page needs it). Ship it first as `Content-Security-Policy-Report-Only`, click through every existing page and the contact popup with the console open, fix the policy until there are zero violations, then switch it to enforced.

**Calendly is linked, not embedded.** The booking link opens Calendly in a new tab with `rel="noopener noreferrer"`. Reasons: no Calendly JavaScript, CSS, or iframe on the landing page (lighter page, narrower CSP, no third-party cookies on the site); it works inside LinkedIn's in-app browser; Calendly's own page handles its accessibility and mobile layout. What is given up: the `calendly.event_scheduled` message, whose usefulness is in doubt (§6.4). The existing popup on `contact.html` is unchanged.

### 7.4 Fonts and images

- **Fonts today:** every page loads one Google Fonts stylesheet (Newsreader 400, 500, 600, 400 italic; Inter 400, 500, 600) with `display=swap`, after `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com`.
- **Change for the new pages:** none in v1. Use the identical stylesheet URL so the browser cache is shared with the rest of the site. If the load-time thresholds in §8.1 fail because of fonts, the next step is to self-host only the weights the landing page uses (Newsreader 600 and 400 italic, Inter 400 and 600) as WOFF2 under `/assets/fonts/` with `preload` for the two above-the-fold files. Both fonts are open-licensed. That would also remove Google from the CSP and the privacy page for these pages.
- **Images today:** the portrait `assets/images/IMG_9852.jpg` is 59 KB with `width`/`height` set; `assets/og-image.png` is 23.5 KB. No responsive `srcset`; no `Cache-Control`.
- **Change for the new pages:** the landing page uses at most the portrait, with `width`, `height`, `alt`, and `loading="lazy"` if below the fold. Icons are inline SVG (DESIGN.md). Set `Cache-Control` on deploy: HTML `no-cache`; CSS, JS, images, fonts `max-age=604800`, with a `?v=<date>` suffix on the new CSS and JS references so a deploy is picked up without waiting.

### 7.5 Deploy safety (found while reading the deploy notes)

The documented deploy is `aws s3 sync .` from the repo root with an exclude list (`.git/*`, `.superpowers/*`, `docs/*`, `s3-current/*`, `node_modules/*`, `*.md`, `og-image.html`, `goal.png`, `public/*`, `solution.html`). That list does **not** exclude `lightroom-sync/` (which holds a nested repository, a `.venv`, and a credentials file, `.adobe-credentials.json`), `.impeccable/`, `.agents/` non-Markdown files, `marketing-launch/` non-Markdown files, or `assets/images/IMG_9852-original.jpg` (5.3 MB, unreferenced). None of these is on the live site today (HEAD requests returned 404 on 2026-11-10), but the next sync from the repo root as documented would upload them, including the credentials file.

Requirement: the deploy for this build uses an explicit allowlist (a script that syncs only named files and folders, or `--exclude "*"` followed by `--include` entries), runs `--dryrun` first, and fails if the dry-run output contains any path matching `lightroom-sync/`, `.agents/`, `.impeccable/`, `marketing-launch/`, `docs/`, `infra/`, `scripts/`, `.aws-sam/`, `samconfig`, `.py`, `.json` outside an approved list, `.env`, `credentials`, or `-original.`.

The lead API in `infra/lead-api/` is never part of the site sync: it is deployed separately, by Douglas, with `sam deploy`, and its source (handler, template, tests) must not be readable on the website. The site deploy script excludes `infra/` and `scripts/` explicitly, in addition to leaving them off the allowlist, so a later edit to the allowlist cannot ship them by accident.

Second deploy risk: the repo's existing pages differ from what is live (for example `index.html`). Any sync also ships those changes. Douglas reviews the list of changed existing files before the first deploy (§11).

---

## 8. Non-functional requirements

Each has a test and a pass threshold. "The four pages" means `/lp/process-automation`, `/thank-you`, `/privacy`, `/terms` on the live host.

### 8.1 Load time

- **Tool:** Lighthouse (Chrome DevTools or `lighthouse` CLI), mobile preset with default simulated throttling, run 3 times against the live URL; use the median. Cross-check once with PageSpeed Insights.
- **Pass (landing page):** Performance score ≥ 90; Largest Contentful Paint ≤ 2.5 s; Cumulative Layout Shift ≤ 0.1; Total Blocking Time ≤ 200 ms (lab stand-in for Interaction to Next Paint, which needs field data the test will not have); total transfer on first load ≤ 400 KB; first-party JS ≤ 30 KB uncompressed.
- **Pass (other three pages):** Performance ≥ 90, LCP ≤ 2.5 s, CLS ≤ 0.1.

### 8.2 Accessibility (WCAG 2.1 AA)

| Check | Test | Pass |
|---|---|---|
| Automated | axe DevTools or `@axe-core/cli` with WCAG 2.0/2.1 A and AA rules, on each page and on the form in its error state | 0 violations |
| Lighthouse | Accessibility category | 100 |
| Contrast | Check every text/background pair used (tokens in `css/styles.css`); check that `#e94560` appears only on text ≥ 24px or ≥ 18.66px bold, or on non-text | Body text ≥ 4.5:1; large text and UI component borders ≥ 3:1; zero small-text uses of `--accent` |
| Focus rings | Tab through each page | Every interactive element shows the `:focus-visible` outline; none removed |
| Skip link | First Tab press on each page | Skip link appears and moves focus to `#main` |
| Keyboard only | Complete, without a mouse: read the FAQ, open the booking link, fill and submit the form with one error then fixed, reach `/privacy` | All tasks complete; no focus trap; focus order matches visual order; error summary receives focus |
| Screen reader | VoiceOver (Safari, macOS) on the form | Labels, hints, required state, errors, and the sending/error alerts are announced |
| 200% zoom | Browser zoom 200% at 1280px wide | No text cut off, no overlap, no loss of function |
| Reflow | 320 CSS px width (400% zoom at 1280px) | No horizontal scrolling; all content and functions available |
| Reduced motion | Emulate `prefers-reduced-motion: reduce` | No animation or transition longer than 0.01 ms; all content visible |
| Touch targets | Measure buttons and links in the CTA and form | ≥ 44×44 px (house rule from `css/styles.css`) |

### 8.3 Reliability of form delivery

- **End-to-end test before day 1:** 5 real submissions from the live page (desktop Chrome, desktop Safari, iPhone Safari, Android Chrome, LinkedIn in-app browser), each tagged `utm_source=test`. Pass: 5 of 5 have a DynamoDB item with every field and UTM intact and `email_status` = `sent`, and 5 of 5 notification emails arrive in Douglas's inbox within 5 minutes.
- **Failure-path test:** block `/api/lead` in DevTools; submit. Pass: error alert shown, data kept, button re-enabled, no `submit_lead_form` event. Repeat with DevTools "Offline". Pass: offline message, no request made.
- **Alarm path test, once after deploy:** force each alarm to fire with `aws cloudwatch set-alarm-state --state-value ALARM` (no real failure needed). Pass: Douglas receives the SNS email for each of the three alarms within 5 minutes.
- **During the test:** one synthetic submission every 7 days, tagged `utm_source=test`, confirmed both as a DynamoDB item and in the inbox; at the same time check that no alarm is in the `ALARM` state and that the count of items with `email_status` = `failed` is zero. Pass: every synthetic submission is stored and arrives; any `failed` item is followed up by hand the same day.
- **Lead safety rule:** the DynamoDB table, not the inbox, is the record of leads. If an alarm says email failed, Douglas reads the lead from the table.

### 8.4 Privacy

- Network inspection on the four new pages during a full form submit and a booking click. Pass: no request to any host other than the site itself (the form posts to `/api/lead` on the same host), Google Analytics/Tag Manager hosts, Google Fonts hosts, and (on click, in a new tab) `calendly.com`. No request to `formspree.io` or to any `amazonaws.com` host from the browser.
- Search every GA4 request payload for the test name, email, company, and process text. Pass: zero matches.
- Search the function's CloudWatch log group (Logs Insights, the window covering the end-to-end test) for the test name, email, company, and process text. Pass: zero matches.
- Read one stored DynamoDB item. Pass: it holds only the fields listed in §5.6; no `website`, `elapsed_ms`, IP address, or user agent.
- Confirm TTL is enabled on `expires_at` and that a stored item's `expires_at` equals `received_at` plus the approved retention period. Pass: both true.
- `localStorage` after a submit contains only the attribution key (§6.3). Pass: no form field values stored.
- With Global Privacy Control on (Firefox or Brave setting, or a browser extension), load the landing page. Pass: no request to Google Analytics hosts.
- `/privacy` matches the shipped configuration (AC-PR-04).

### 8.5 Responsive behavior

At 375×667, 768×1024, and 1440×900 on each page:
- `document.documentElement.scrollWidth <= window.innerWidth` (no horizontal scroll). Pass: true at all three.
- Landing page: the `<h1>` and the primary booking button are visible without scrolling. Pass: true at all three.
- Form: single column under 560px; labels above fields; no field narrower than 280px at 375px.
- Visual check against `DESIGN.md` (920px column, section padding, type sizes). Pass: no element overlaps or clips.

### 8.6 Security

| Area | Test | Pass |
|---|---|---|
| XSS | Load each page with `?utm_source=<script>alert(1)</script>&utm_campaign="><img src=x onerror=alert(1)>`; submit the form; inspect the stored value, the hidden fields, the Calendly link, the DynamoDB item, and the notification email | No script runs; values are stripped to the allowed character set; code review shows no `innerHTML`, `insertAdjacentHTML`, `document.write`, or `eval` on any value from the URL or storage |
| Open redirects | Request `//evil.example/`, `/thank-you.html?next=https://evil.example`, `/%2F%2Fevil.example`, and paths with trailing slashes | Every `Location` header points to `https://william.llcdouglashill.com/...`; no page or script reads a redirect target from the URL |
| Exposed secrets | Run the allowlist dry run (§7.5) and a secret scan (for example `gitleaks detect --no-git` on the deploy folder) | Zero secrets. The `OriginVerifySecret` value appears nowhere in the repo, the site, or `infra/` (it is entered only at `sam deploy` and in the CloudFront origin). Note: the GA4 measurement ID and the existing `contact.html` Formspree form ID are public by design and are not secrets |
| API bypass | `curl -X POST https://<api-id>.execute-api.<region>.amazonaws.com/api/lead` with a valid JSON body and no `x-origin-verify` header; the same through the site with `-H "Origin: https://evil.example"` | Both `403 {"ok": false}`; nothing stored, nothing sent |
| API input handling | Through the site: `Content-Type: text/plain`; an 11 KB body; a burst of 20 requests in one second with body `{}` (so nothing is stored) | `415`; `413`; at least some `429` responses. No response body contains any submitted value |
| Spam | Submit with the honeypot filled; submit within 3 seconds of load | Nothing sent, no event, visitor sees `/thank-you` |
| Headers | `curl -sI` each page; and https://securityheaders.com for the landing page | `Strict-Transport-Security`, `Content-Security-Policy` (enforced on `/lp/*`), `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` present with the values in §7.3; landing page grade A or better |
| HTTPS | `curl -sI http://william.llcdouglashill.com/lp/process-automation` | 301 to the `https://` URL |
| CSP | Load each page and exercise every feature with the console open | Zero CSP violations |

### 8.7 Console errors

Open the console on each page; exercise page load, the FAQ, a booking click, a form error, a successful submit (against the live endpoint, tagged `utm_source=test`), and a backend failure. Also once with an ad blocker on. Pass: zero errors and zero CSP violations in every case.

### 8.8 Broken links

Run a link checker (for example `linkinator` or `lychee`) against the four live pages, following internal links one level. Pass: zero broken internal links; zero broken external links except known bot-blocking hosts (LinkedIn may answer 999), which are checked by hand.

### 8.9 Cross-browser

Current Chrome, Safari (macOS and iOS), Firefox, Edge, and the LinkedIn in-app browser on iOS and Android. Pass: the flows in §3 complete in each.

### 8.10 SEO hygiene (page reached by direct link)

| Page | Robots | In `sitemap.xml` | Reason |
|---|---|---|---|
| `/lp/process-automation` | `noindex, follow` | No | Reached by direct link during the test; search traffic in 30 days is expected to be near zero (Channels §7, content and SEO); keeps test traffic attributable to the channels; avoids indexing an offer and price that may change after the test. Revisit after the test. |
| `/thank-you` | `noindex, nofollow` | No | No search value; direct visits would be noise |
| `/privacy` | `index, follow` | Yes | Legitimate public page; harmless to index |
| `/terms` | `index, follow` | Yes | Same |

Tests: each page's canonical is the absolute clean URL on `https://william.llcdouglashill.com` (AC-ALL-02); `robots.txt` does not `Disallow` the landing page (a disallowed page cannot have its `noindex` read); `sitemap.xml` validates against the sitemaps.org schema and lists `/privacy` and `/terms` with their clean URLs and does not list the landing page or `/thank-you`; `og:url` equals the canonical (no UTMs) so LinkedIn previews and shares stay clean.

### 8.11 Lead API tests

**Unit tests (before deploy).** `infra/lead-api/tests/test_handler.py`, run with `pytest` from `infra/lead-api/`. The DynamoDB and SES clients are replaced with mocks (`unittest.mock`, injected by the test; no AWS account, no network, no third-party mocking library needed). Each case builds an HTTP API payload format 2.0 event and asserts the status, the exact response body, and which AWS calls were made.

| # | Case | Expected |
|---|---|---|
| U1 | Valid body, all fields | `200 {"ok": true}`; one `PutItem` with exactly the §5.6 fields and a correct `expires_at`; one `SendEmail` from and to the configured address with `Reply-To` set; `email_status` updated to `sent` |
| U2 | Each required field missing, in turn (`name`, `email`, `company`, `process`) | `400`, `errors` = `{"<field>": "required"}`; no AWS calls |
| U3 | Each field one character over its limit, in turn (including each UTM value and `gclid` at 201) | `400` with `too_long` for that field; no AWS calls |
| U4 | Invalid values: email without `@`, email with a CR or LF, `process` under 10 characters, a UTM value with `<`, a field of the wrong JSON type | `400` with `invalid` for that field; no AWS calls |
| U5 | Honeypot `website` filled | `200 {"ok": true}`; no AWS calls |
| U6 | `elapsed_ms` 2,999, missing, negative, and a string | `200 {"ok": true}`; no AWS calls |
| U7 | Body of 10,241 bytes, both plain and base64-encoded | `413 {"ok": false}`; no AWS calls |
| U8 | `Content-Type: text/plain`, `application/x-www-form-urlencoded`, and missing | `415 {"ok": false}`; no AWS calls |
| U9 | Body not JSON; body a JSON array | `400 {"ok": false, "errors": {}}`; no AWS calls |
| U10 | `x-origin-verify` missing or wrong; `Origin` present and wrong | `403 {"ok": false}`; no AWS calls |
| U11 | `PutItem` raises | `5xx {"ok": false}`; no `SendEmail` call; log line has outcome `store_failed` |
| U12 | `PutItem` succeeds, `SendEmail` raises | `200 {"ok": true}`; `email_status` updated to `failed`; log line has outcome `stored_email_failed` |
| U13 | Any case above | No response body contains any submitted value; no captured log line contains any submitted value (the test feeds distinctive marker strings and searches the captured logs for them) |

Pass: all cases pass; the run makes zero network calls; statement coverage of `src/handler.py` at least 90% if the `coverage` tool is available, otherwise every branch in the handler maps to at least one case above (reviewer checks).

**End-to-end test (after `sam deploy` and the CloudFront change, before the landing page is announced).** Run against `https://william.llcdouglashill.com/api/lead`, not the direct API URL.

1. One valid submission from the live landing page tagged `utm_source=test`. Pass: `200`, the item is in the table, the email arrives within 5 minutes. The API has only one route, so this `200` confirms that API Gateway sees the path as `/api/lead` (§7.2). A `404` here means the origin path or stage is wrong.
2. The rejection cases in the §8.6 "API bypass" and "API input handling" rows. Pass: as stated there.
3. One honeypot submission sent with `curl` through the site (the page script would not send it), `website` filled and `elapsed_ms` 5000. Pass: `200`, no new item, no email.
4. The alarm path test in §8.3. Pass: as stated there.
5. The five-browser test in §8.3. Pass: 5 of 5.

Pass for the end-to-end test: every step passes. Test items are deleted from the table by hand afterwards, or left to expire by TTL.

---

## 9. Privacy and terms pages

**These are content requirements, not legal text, and this is not legal advice. Douglas must review both pages, and should consider an attorney's review, before either goes live. Neither page is deployed until his approval is recorded (AC-PR-03, AC-TE-03).**

### 9.1 `/privacy` must cover

1. Who runs the site: Douglas Hill Consulting LLC, Tempe, Arizona, and a contact address for privacy questions (`DouglasHill@llcdouglashill.com` unless Douglas names another) **[Input]**.
2. What the landing page form collects: name, work email, company, the process description, plus the page's campaign tags (`utm_*`), an ad click ID if present (`gclid`), and the landing page path. That no IP address or browser details are stored with the lead.
3. Why: to reply about the request, to qualify and prepare for a call, and to see which outreach channels work. Not sold. Not used for a mailing list. Not used for advertising.
4. Where the landing page form data goes, naming each AWS service: the submission passes through Amazon CloudFront and Amazon API Gateway to an AWS Lambda function in Douglas's own Amazon Web Services account; it is stored in Amazon DynamoDB in the AWS region **[Input]** (default `us-east-1`, US East, N. Virginia); a copy is emailed to Douglas through Amazon SES; Amazon CloudWatch keeps operational logs for 30 days that hold no form contents. AWS processes this data as Douglas's service provider; link to the AWS Privacy Notice. Stored leads are deleted automatically after the retention period **[Input]**, typically within a few days after it ends (§5.6). No email is sent to the visitor by the site.
5. Email: the notification copy of each submission sits in Douglas's Microsoft 365 mailbox; its retention period **[Input]**; the outreach tracker and its retention **[Input]**.
   - The existing contact page: the form on `/contact.html` is a separate form handled by Formspree, which holds those submissions under its own retention and privacy policy (link). Named because `/privacy` covers the whole site.
6. Analytics: Google Analytics 4 on the four new pages; what it collects (pages viewed, the two events, device and browser type, approximate location, referrer, campaign tags); the cookies it sets; that Google signals and advertising features are off; the data-retention setting; that it is not loaded when Global Privacy Control is on; how to opt out (GPC, Google's opt-out browser add-on, or blocking cookies).
7. Browser storage: the attribution key in `localStorage`, what it holds, that it expires after 30 days, and that it holds no form contents.
8. Booking: Calendly is a separate service with its own privacy policy; booking details (name, email, answers, campaign tags) are collected by Calendly and shared with Douglas; link to Calendly's policy.
9. Fonts: Google Fonts loads from Google's servers, which receive the visitor's IP address (unless fonts are self-hosted, §7.4).
10. Hosting: Amazon Web Services (S3 and CloudFront, plus the services in item 4 for the form); whether CloudFront access logs are kept, and for how long, per the §7.1 check. API Gateway access logging is off.
11. Requests: how to ask for a copy or deletion of submitted data, and the reply timeframe **[Input]**. Whether any state privacy law applies to the business is for Douglas's legal review; the page should not claim compliance with a specific law unless that review confirms it.
12. Children: the site is not directed at children.
13. Effective date and how changes are posted.

### 9.2 `/terms` must cover

1. Who runs the site (as 9.1 item 1).
2. The site is information about Douglas Hill Consulting LLC's services. Nothing on it is an offer that creates a contract; an engagement exists only under a signed written agreement, and that agreement's terms govern if anything on the site differs.
3. Prices, scope, timelines, and terms shown on the site describe the standard offer and can change; the written agreement sets the binding figures.
4. No guarantee of specific business outcomes from information on the site.
5. Site content is owned by the business; limited personal-use permission.
6. Third-party services and links (Calendly, LinkedIn, and Formspree for the existing contact page form) are governed by their own terms. The landing page form is run by Douglas on AWS, not by a third-party form service.
7. Disclaimer of warranties for the site itself and a limitation of liability, in plain language, as Douglas's reviewer advises.
8. Acceptable use of the form (no spam, no unlawful content).
9. Governing law and venue **[Input]** (Douglas or his attorney decides).
10. Contact address, effective date, and how changes are posted.

---

## 10. Inputs needed from Douglas

| # | Input | Blocks | Can the build proceed without it? |
|---|---|---|---|
| 1 | Confirm the booking link `https://calendly.com/douglashill-llcdouglashill/30min`; add the required "how did you hear about me" question (Channels §6); confirm the Calendly plan; make one test booking with UTMs to confirm they appear on the invitee | Deploy | Yes, using the current link as the working value |
| 2 | AWS region for the lead API stack, table, SES identity, and logs (§7.2) | Deploy; the region is named on `/privacy` | Yes, with the default `us-east-1` (the repo names no other) |
| 3 | GA4: create the property and web data stream, give the measurement ID (`G-…`), apply the settings in §6.1 | Deploy | Yes, with placeholder `__REQUIRED_INPUT:GA4_MEASUREMENT_ID__` |
| 4 | Review and approve `/privacy` and `/terms` (with an attorney if he chooses); supply retention periods, request-reply timeframe, governing law | Deploy of those pages, and therefore of the landing page (it links to them) | Yes: draft pages carry `__REQUIRED_INPUT:LEGAL_REVIEW__` |
| 5 | Price shown or not (Offer §8 item 10) | Final page content | Yes: both variants are built; one is deleted |
| 6 | The message-match headline line used on the page and in both outreach kits | Final page content | Yes, with placeholder `__REQUIRED_INPUT:HEADLINE__` |
| 7 | The 7 offer questions marked **[Blocks publication]** (Offer §8 items 1–7), including proof attributions and "federal tax agency" wording | Publishing the page (Channels §6 pre-start item 1) | Yes: build proceeds; deploy waits |
| 8 | Approval of the offer numbers marked **[Needs approval]** in §4 (scope limits, day numbers, client hours, 10-business-day clause) | Those numbers on the page | Yes: written without numbers until approved |
| 9 | Whether the scoping call is free (PMC open question 2); whether to commit to a reply time on `/thank-you` | Two sentences | Yes: those sentences are left out |
| 10 | Next real start date, if he wants it shown | One optional line | Yes: omitted |
| 11 | Read-only inspection of CloudFront and S3 (§7.1 [Verify] list), then applying the function, the two response headers policies, the `/lp/*` behavior, the API Gateway origin with its `x-origin-verify` custom header and the `/api/*` behavior (§7.2), and the HTTPS redirect. Douglas runs these or approves each change; he holds the AWS account | Clean URLs, headers, and the form on the live site | Yes: function code and policy JSON are written and tested in the CloudFront test console before he applies them; the `/api/*` settings are listed in §7.2 and the `infra/lead-api/` README |
| 12 | Review of the existing-page changes that the first deploy will also ship (§7.5) | Deploy | Yes |
| 13 | The email address SES sends from and to, verified by Douglas in SES in the chosen region (he clicks the verification link); also used for the alarm subscription | Deploy of the lead API | Yes: it is the `NotificationEmail` deploy parameter, not in source |
| 14 | Lead retention period in days, for the DynamoDB time-to-live and the privacy page | Deploy of the lead API and of `/privacy` | Yes: `RetentionDays` has no default, so `sam deploy` cannot run without it; `/privacy` carries `__REQUIRED_INPUT:LEAD_RETENTION_DAYS__` |
| 15 | Running `sam build` and `sam deploy --guided` from `infra/lead-api/` (with a generated `OriginVerifySecret`), confirming the SNS alarm subscription email, then the end-to-end test (§8.11). Only after the deploy gate | The form working on the live site | Yes: everything up to deploy is built and unit-tested locally; the front end is tested against the mock (§5.9) |

**Placeholder rule.** Every missing input is written in the source as `__REQUIRED_INPUT:<NAME>__`. The pre-deploy check script searches the deploy set and exits non-zero if any remain, if the price block is half-removed (a `PRICE BLOCK START` without its `END`, or `6,000` outside the block), or if the secret patterns in §7.5 match. Douglas creates every account and enters all billing himself.

---

## 11. Risks and open questions

**Risks**
1. **The page cannot go live until the offer's 7 [Blocks publication] questions are answered.** The build can finish; the test start date depends on Douglas.
2. **Deploy could publish a credentials file** (§7.5). Mitigated only if the allowlist deploy is used.
3. **First deploy ships unrelated changes** to existing pages because the repo is ahead of the live site (§7.1, §7.5).
4. **The CloudFront Function runs on every request.** A bug breaks the whole site, not just the new pages. Mitigated by the test cases in §7.1 and by publishing only after they pass; keep the previous function version for rollback.
5. **Enforcing a CSP on existing pages** could break `contact.html` (inline script, Calendly popup). Mitigated by Report-Only first (§7.3).
6. **Attribution is partly manual.** Completed bookings and forwards are only visible through Calendly and the tracker (§6.4). If Douglas skips the tracker, the test result is unreadable.
7. **GA4 undercounts** by an unknown share; small volumes make rates noisy (§6.4).
8. **No consent banner.** Acceptable for a US audience in Douglas's judgment, but a forwarded link can reach anyone. Legal review item.
9. **Lambda cold start.** The first submission after an idle period waits for the function to start. For a small Python function with only `boto3`, that is expected to be well under the 15-second client timeout (**unverified**; measure it in the end-to-end test). If it ever exceeded the timeout, the visitor sees the error state while the lead may still be stored (§5.5). No provisioned concurrency (it costs money every hour).
10. **`services.html` and the offer disagree** on whether Power Apps is included (PMC open question 1). The landing page follows the offer (no Power Apps). A visitor who also reads `services.html` may notice. Not fixed here (no redesign of existing pages).
11. **Existing pages name clients publicly** while the landing page does not (PMC open question 15). The landing page has no links to those pages, which limits but does not remove the mismatch.
12. **LinkedIn in-app browser** may isolate storage and open new tabs oddly; covered by the test in §8.9.
13. **SES sandbox.** Sending works only to verified addresses, at most 200 messages per 24 hours and 1 per second, per region (§7.2). Enough for notifications to Douglas. Risks: the identity is verified in a different region from the stack (every email fails; the leads are still stored and the `EmailFailures` alarm fires), or someone later adds an email to the visitor, which the sandbox would block. Sending to visitors is out of scope and would need production access and a new privacy review.
14. **A misconfigured `/api/*` behavior** breaks every submission while the pages look fine: the URL-rewrite function attached to it, `Host` forwarded (API Gateway answers 403), a non-empty origin path (403 or 404), POST not allowed, caching on, the behavior ordered below the default, or the custom header missing (the function answers 403). Mitigated by the settings table in §7.2 and by running the end-to-end test (§8.11) immediately after the change, before the page is announced.
15. **DynamoDB is a new store of personal data.** Leads now sit in Douglas's AWS account, not a vendor's. He is responsible for access to it (his AWS credentials and MFA), for its retention (TTL), and for answering deletion requests from it (§9.1 item 11). `DeletionPolicy: Retain` means deleting the stack leaves the table and its data in place until he deletes it by hand.
16. **Douglas operates the backend.** Nobody else watches the alarms. If he misses an alarm email, an email failure can go unnoticed; the weekly synthetic check (§8.3) is the backstop.

**Open questions**
1. Should the form get an optional fifth field, "How did you hear about this?", to catch forwards (§3.2)? It costs length; Calendly already asks.
2. Should the landing page be indexed after the test if it works?
3. Self-host fonts now (fewer third parties, simpler privacy page) or only if load time fails (§7.4)?
4. Add reCAPTCHA or Cloudflare Turnstile only if spam appears, or never?
5. Does Douglas want `/thank-you.html` kept as a file as well as redirected, in case the CloudFront Function is ever removed?
6. Should the "lp-strict" CSP also cover `/thank-you`, `/privacy`, `/terms` through their own behaviors (more configuration, slightly stronger)?
7. Web3Forms pricing could not be confirmed (its pricing page returned 403); it is not recommended for that reason.
8. Turn on DynamoDB point-in-time recovery for the leads table (a paid feature, protects against accidental deletes), or rely on the notification emails as the backup?
9. Are the proposed route throttle values (1 per second, burst 5) acceptable (§7.2)?

---

## 12. Build order for the next milestone

Ordered. Items on the same line can run in parallel; no file has two owners.

1. **Douglas, in parallel with everything below:** inputs 1–3, 11, 13, and 14 (accounts, IDs, region, the SES address verification, the retention period, read-only CloudFront/S3 inspection). Infra decisions in step 5 wait for the inspection.
2. **Foundations (parallel, separate files):**
   - Owner A: `css/lp.css` (landing-page styles on top of `css/styles.css`; no edits to `styles.css`).
   - Owner B: `js/attribution.js` (UTM and `gclid` capture, storage, link decoration) and `js/analytics.js` (GA4 loader, GPC check, event helpers).
   - Owner C: `scripts/check.sh` (placeholders, price block, secrets, root-absolute paths, no inline script/style) and `scripts/deploy.sh` (allowlist, dry run, cache headers, invalidation; excludes `infra/` and `scripts/` from the site sync explicitly and fails the dry run if either appears, §7.5).
   - Owner E: `scripts/mock-lead-api.py` first (§5.9, so Owner B can test against it), then everything under `infra/lead-api/`: `template.yaml`, `src/handler.py`, `tests/test_handler.py`, `README.md` (§7.2, §8.11). Owner E implements the contract in §5.8 and does not edit front-end files. The unit tests pass before step 7.
3. **Page markup (parallel, after step 2 agrees the class names and element IDs):**
   - Owner A: `lp/process-automation/index.html` (all six sections, both price variants, form markup per §5.1).
   - Owner B: `js/lead-form.js` (validation, honeypot, timing, double-submit, fetch to `/api/lead`, server error codes, error and offline states). Works against the markup contract in §5 and the request contract in §5.8, tested against the mock server (§5.9); does not edit the HTML.
   - Owner D: `thank-you/index.html`, `privacy/index.html`, `terms/index.html` (privacy and terms text after Douglas's inputs; placeholders until then).
4. **Copy pass** on the landing page by Owner A only, against §4's allowed-claims list, then Douglas's review of claims and wording.
5. **Infra files (Owner C):** `infra/cloudfront/url-rewrite.js` (function), `infra/cloudfront/headers-site.json` and `headers-lp-strict.json` (policies), tested in the CloudFront Functions test console against the cases in §7.1, plus a written checklist for the `/api/*` origin and behavior (§7.2 table) in `infra/cloudfront/README.md`. Douglas applies them. (Owner E owns `infra/lead-api/`; Owner C owns `infra/cloudfront/`; no file has two owners.)
6. **Late single-owner edits (Owner D):** `sitemap.xml` (add `/privacy`, `/terms`); then, after the 301 is verified live, delete `thank-you.html`. `robots.txt` needs no change.
7. **Verification pass:** every acceptance criterion in §2 and every requirement in §8 that can run before deploy (including the §8.11 unit tests and the front end against the mock), then a fresh-context review of both the pages and `infra/lead-api/`.
8. **Gate 4:** Douglas approves the built pages and the lead API code. **Gate 6 (the deploy gate):** Douglas approves the deploy, after the offer's [Blocks publication] items are cleared. Nothing in AWS is created or changed before this gate.
9. **After Gate 6, in this order:** Douglas runs `sam deploy` (input 15) and confirms the alarm subscription; applies the CloudFront changes (input 11); runs the site deploy script; then the end-to-end test in §8.11 and the remaining live checks in §8. The landing page link goes into outreach only after all of them pass.

---

## Sources checked for this PRD

| Fact | URL | Fetched |
|---|---|---|
| Formspree plans, limits, free-plan features | https://formspree.io/plans | 2026-11-10 |
| Basin plans | https://usebasin.com/pricing | 2026-11-10 |
| Web3Forms pricing | https://web3forms.com/pricing (HTTP 403; third-party summaries only, **unverified**) | 2026-11-10 |
| Lambda pricing and free tier | https://aws.amazon.com/lambda/pricing/ | 2026-11-10 |
| API Gateway HTTP API pricing, free tier, Free Tier credits | https://aws.amazon.com/api-gateway/pricing/ | 2026-11-10 |
| DynamoDB on-demand pricing and storage free tier | https://aws.amazon.com/dynamodb/pricing/on-demand/ | 2026-11-10 |
| DynamoDB TTL behavior (deletion timing, no write cost, Number epoch seconds) | https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html | 2026-11-10 |
| SES pricing and Free Tier credits | https://aws.amazon.com/ses/pricing/ | 2026-11-10 |
| SES sandbox rules (verified recipients, 200 per 24 hours, 1 per second, per Region) | https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html | 2026-11-10 |
| CloudWatch Logs and alarm pricing, free tier | https://aws.amazon.com/cloudwatch/pricing/ | 2026-11-10 |
| CloudFront settings for an API Gateway origin (`CachingDisabled`, `AllViewerExceptHostHeader`, HTTPS only, TLSv1.2) | https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/template-preconfigured-origin-settings.html | 2026-11-10 |
| CloudFront in front of API Gateway (origin path blank, origin request policy) | https://repost.aws/knowledge-center/api-gateway-domain-cloudfront | 2026-11-10 |
| Do not forward `Host` to an API Gateway origin (403) | https://repost.aws/knowledge-center/configure-cloudfront-to-forward-headers | 2026-11-10 |
| HTTP API invoke URL and `$default` stage | https://repost.aws/knowledge-center/api-gateway-id-invoke-url | 2026-11-10 |
| CloudFront origin path behavior | https://docs.aws.amazon.com/help-panel/AmazonCloudFront/latest/console/origin-path.html | 2026-11-10 |
| CloudFront path patterns and precedence | https://repost.aws/knowledge-center/cloudfront-requests-origins | 2026-11-10 |
| CloudFront managed cache policies | https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html | 2026-11-10 |
| CloudFront origin custom headers (overwrite of viewer value, access-control use) | https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/add-origin-custom-headers.html | 2026-11-10 |
| HTTP API secret header with a Lambda authorizer (option B) | https://aws.amazon.com/blogs/networking-and-content-delivery/restricting-access-http-api-gateway-lambda-authorizer/ (search summary of the page) | 2026-11-10 |
| Disable the HTTP API default endpoint (option C) | https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-disable-default-endpoint.html | 2026-11-10 |
| HTTP API vs REST API (no AWS WAF on HTTP APIs) | https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html | 2026-11-10 |
| HTTP API route-level throttling | https://docs.aws.amazon.com/help-panel/apigateway/latest/console/http-throttling.html | 2026-11-10 |
| `$default` stage passing `/api/lead` to route matching unchanged; POST body forwarding; Lambda cold start time; reserved concurrency on a new account; SNS email pricing; CloudFront request pricing | Not stated on any page fetched (**unverified**; confirmed by the §8.11 end-to-end test where testable) | — |
| CloudFront pricing (flat-rate plans only; Functions pricing not shown) | https://aws.amazon.com/cloudfront/pricing/ | 2026-11-10 |
| Power Automate HTTP trigger auth modes | https://learn.microsoft.com/power-automate/oauth-authentication | 2026-11-10 |
| Power Automate Premium price | Offer §2.2 (fetched there 2026-11-10) | 2026-11-10 |
| Calendly plans and Google Analytics plan gating | https://calendly.com/pricing | 2026-11-10 |
| Calendly embed availability | https://calendly.com/help/embed-options-overview | 2026-11-10 |
| Calendly UTM handling and `event_scheduled` payload | Calendly community threads via search summary only (**unverified**) | 2026-11-10 |
| GA4 collection limits | https://support.google.com/analytics/answer/9267744 | 2026-11-10 |
| GA4 `generate_lead` (considered, custom event names kept per brief) | https://developers.google.com/analytics/devguides/collection/ga4/reference/events | 2026-11-10 |
| Google tag CSP guidance | https://developers.google.com/tag-platform/security/guides/csp (**not fetched**) | — |
| Live site behavior (status codes, headers, HTTP not redirecting) | HEAD requests to `https://william.llcdouglashill.com` and `http://` | 2026-11-10 |
