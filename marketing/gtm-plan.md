# Douglas Hill Consulting — Go-To-Market Operating Manual

The playbook for turning the portfolio into booked calls. Two outreach tracks, a lean tool stack, and a weekly routine. Start with the **Week-1 checklist** at the bottom.

---

## 1. The honest strategy

Cold-email-alone is a slow start for a solo with no pipeline. So we run **two tracks in parallel** — both reuse the same proof and assets:

- **Track A — Subcontracting** (`track-a-subcontracting.md`): pitch SIs / MSPs / staffing firms for white-label or C2C overflow. **Fastest to revenue (2–6 weeks), warmer audience.** Launch first.
- **Track B — End-client cold** (3 campaign files): direct outreach to mid-market companies. Longer ramp, works when hyper-targeted.

**Lead end-client campaign:** Replace a manual process (sharpest, most universal mid-market pain; fastest first project, 2–4 wks). Then reporting dashboard, then business app.

**Bench these for later (higher yield over time, more effort):** a LinkedIn track (60-sec demo videos + targeted connects), joining your local IAMCP chapter + Power Platform user group, and the Microsoft Solutions Partner path (12–18 mo — not a short-term lead source for a solo).

---

## 2. Ideal customer profiles (ICP)

### Track A — Partners (subcontracting)
- **Firmographics:** Microsoft staffing/recruiting (Nigel Frank, Kforce, Apex), boutique Dynamics/Power Platform partners (DCG, TopNotch, regional SIs), MSPs $1–10M rev.
- **Contacts:** delivery managers, practice leads, resource/staffing managers, owners.
- **Qualify (pass):** actively delivers Power Platform/Dynamics/M365; has client work that outstrips bench.
- **Skip:** pure infra MSPs with no app/automation work; direct competitors who self-deliver everything.

### Track B — End-clients
- **One-paragraph ICP:** US mid-market companies (200–2000 employees; 50–500 also good) already running Microsoft 365, with manual, spreadsheet- and email-heavy operations, where an Operations / Finance / IT leader feels the pain and can say yes to a small first project.
- **Titles:** VP/Director of Operations, Finance Director / Controller, IT Director, Director of Business Applications / Digital Transformation.
- **Buying signals (→ "Hot"):** hiring for Power BI/Power Platform/ops/analyst roles; an AI/automation initiative; recent ERP/system change; visible growth; new CIO/CISO.
- **Disqualifiers (→ "Skip"):** <50 or >5000 employees; not on M365; agencies/consultancies/competitors; no reachable decision-maker.

---

## 3. Personalization — the 4-level framework

Referenced by every campaign file. The rule: **if you can delete the opening line and the email still makes sense, the personalization isn't working.** Tie the observation to the problem.

- **Level 1 — Tokens:** `{{first_name}}`, `{{company}}`. Floor, not personalization.
- **Level 2 — Segment:** language specific to their role/industry (already baked into each campaign).
- **Level 3 — Account signal:** a real fact about *their* company — a job posting, a system they use, recent news. ("saw you're hiring a data analyst —")
- **Level 4 — Trigger event:** something that just changed and creates urgency — funding, expansion, new exec, a new system rollout. ("congrats on the new CIO seat —")

Aim for Level 3+ on every "Hot" lead. Level 1–2 is fine for volume on "Warm."

---

## 4. List building (B2B motion)

1. **Define the slice before searching** — one persona + one signal at a time (e.g., "IT Directors at 200–1000-emp US manufacturers hiring a Power BI analyst").
2. **Over-source 2–3×** what you'll send, then cull — 25 verified beats 250 junk.
3. **Verify deliverability BEFORE adding** — bounces wreck domain reputation fast. Keep invalids in a separate bucket.
4. **Capture source URL + date** for every contact (CAN-SPAM/GDPR lineage) — there's a field for it in the tracker.
5. **Target mix:** ~20% Hot / 30% Warm / rest Cold or Skip.

---

## 5. Sending infrastructure (do this right or nothing else matters)

**Never cold-send from `llcdouglashill.com` or `DouglasHill@llcdouglashill.com`.** Protect the domain your real client mail + website depend on.

1. **Buy 1–2 lookalike domains** (~$12/yr each): e.g. `getdouglashill.com`, `trydouglashill.com`, `llcdouglashill.net`.
2. **Create 1–2 mailboxes per domain.** Either add the domain to your existing M365 tenant (cheapest) **or** use a separate Google Workspace ($6/mo/mailbox) for blast-radius isolation. Both work with the sending tools below.
3. **Set up authentication:** SPF, DKIM, DMARC on each sending domain. Non-negotiable.
4. **Set up forwarding:** replies on the sending domains forward to your real inbox.
5. **Warm up 2–3 weeks** before real volume (the sending tool automates this).
6. **Ramp slowly:** 20 → 40 emails per inbox per day. With 2–4 inboxes that's ~100–120/day max — plenty for a solo. **Match volume to how many clients you can actually deliver.**

---

## 6. Tooling decision

Microsoft is the right tool for **relationship management** — it does NOT source verified emails or run cold-send infrastructure (LinkedIn Sales Navigator withholds emails by design; Exchange has no warmup/sequencer/tracking). So one third-party outbound tool is required.

**Decide via free trials** — pull ~25 mid-market contacts from each, check bounce rates, keep the cleaner data:

| Option | Covers | ~Cost |
|---|---|---|
| **A. salestarget.ai (Growth)** | all-in-one: lead DB + verify + warmup + send + sequencing + built-in CRM | **$99/mo** |
| **B. Apollo (Basic) + Instantly/Smartlead** | Apollo = sourcing+verify; Instantly = warmup+send+tracking | ~$86/mo |

⚠️ **salestarget.ai caveats:** small review base; all-in-one databases often have weaker data quality than Apollo; **do not use its LinkedIn auto-connect/messaging (account-ban risk).**

**Already owned / set up (use these):** Calendly (scheduling — free tier, one event type), Outlook/Teams (relationship mgmt), Notion (the pipeline tracker). Optional later: M365 Copilot (~$30/mo) for AI reply drafting once replies flow.

**Total to start: ~$90–100/mo + ~$24/yr domains.**

---

## 7. Weekly cadence (≈3–4 focused hours)

1. **Pull** a fresh slice of leads for one campaign (Track A or B).
2. **Verify** emails; drop invalids.
3. **Enrich** Hot leads to Level 3+ personalization.
4. **Load** into the sending tool; **log** each in Notion (Stage = Sent).
5. **Handle replies daily** — move them through the Notion board; book calls via your Calendly link.
6. **Review numbers weekly** (below); kill losing subject lines, double down on winners.

---

## 8. Metrics & benchmarks

Track per campaign: **sent → opened → replied → positive replies → calls booked → won.**

- **Bounce rate:** keep **< 3%** (above 5% = list/verification problem — pause and fix).
- **Open rate:** ~40–60% is healthy with good warmup + boring subjects.
- **Reply rate:** generic cold ≈ <1%; **targeted, signal-based ≈ 3–8%** — that's the goal.
- **Positive-reply → call:** optimize the booking link + first-touch CTA.

If a campaign underperforms after ~150–200 sends, change the **subject line first**, then the **opener**, then the **offer** — one variable at a time.

---

## 9. CAN-SPAM compliance checklist (legitimate B2B outreach)

- [ ] Accurate "From" name and real reply-to address
- [ ] Subject line not deceptive
- [ ] A real physical postal address in every email (PO box / registered-agent address is fine) — fill `[[MAILING_ADDRESS]]` in the campaign files
- [ ] Clear opt-out ("reply no thanks") and **honor it within 10 business days**
- [ ] Keep a suppression list of opt-outs; never re-add
- [ ] Retain source URL + date for each contact

---

## 10. Rollout (30 / 60 / 90 days)

- **Days 1–14:** buy domain(s), set DNS auth, start warmup. Ship `services.html` (Calendly link already wired into the site + campaign files). Build the Notion tracker. Start tool free trials + run the data-quality test. Build the 1-page capability statement (Track A).
- **Days 15–30:** warmup continues. Build first verified lists (Track A firms + ~50–100 end-client Hot/Warm). Run deliverability pre-flight (mail-tester.com). Launch **Track A** + **Campaign 1 (process automation)**.
- **Days 31–60:** add **Campaign 2 (reporting dashboard)**; iterate on reply data; run scoping calls.
- **Days 61–90:** layer **Campaign 3 (business app)**; double down on whatever booked the most calls; if capacity allows, start the LinkedIn track and join IAMCP.

---

## ✅ Week-1 checklist

1. [ ] Register 1–2 sending domains; set SPF/DKIM/DMARC; turn on reply forwarding to your real inbox.
2. [ ] Start free trials: salestarget.ai **and** Apollo. Pull 25 contacts each; compare bounce/verify rates; pick one.
3. [ ] Turn on inbox warmup in the chosen tool (then leave it 2–3 weeks).
4. [x] Calendly event created + link wired into `services.html` and the campaign files. ✅
5. [ ] Fill `[[MAILING_ADDRESS]]` and `[[SENDING_EMAIL]]` in all 5 campaign files.
6. [ ] Build the 1-page capability statement PDF (for Track A) from your case studies + certs.
7. [ ] Stand up the Notion "DHC — Outbound Pipeline" tracker (board by Stage).
8. [ ] Deploy the updated site (S3 sync + CloudFront invalidation).
