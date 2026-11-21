# Week 6 — Integrated Agentic Venture + Impact & Viability · Build Discipline Packet

Project: **Vitalis** (medical record + vital-signs triage) · Live: https://expediente-me-wine.vercel.app
Required page: **`/demo`** · Also new: **`/dashboard`** · Written and committed **before any Week 6 code** (Gate 1).

---

## 🧩 Problem
After five sprints Vitalis has six working modules — `/core` triage, `/research`, `/product` + `/pricing`,
`/` + `/marketing`, `/chat` and `/docs` — but they were built one week at a time and they still *feel* like six
separate homework pages:

1. **No single place shows what the venture has produced.** Records live in 7 Supabase tables (`core_outputs`,
   `research_records`, `pricing_scenarios`, `marketing_assets`, `ab_events`, `chat_sessions`, `chat_feedback`) and
   each page only shows its own slice. A founder, a teacher or an investor can't see the whole thing at once.
2. **A first-time visitor doesn't know where to start** or how the pieces connect (research → product → triage →
   guide → marketing). There is no guided path through the site.
3. **We have never proven, end to end, that the venture creates value and avoids obvious harm.** Each week tested its
   own feature. Nobody has used the *whole* site as one product, and there is no written impact/harm check.

This week's problem: **turn six modules into one venture that a stranger can walk through in 5 minutes, that shows
its own records, explains which "agent" does what, and proves — with 5 external users and a full-site regression
test — that it works, helps, and doesn't hurt.**

## 👤 User
- **Primary: Daniela, 38, Mexico City** (persona since Week 4) — caregiver for her father (67). She uses `/core` and
  `/chat`. This week she must be able to reach both from any page in ≤ 2 clicks.
- **Evaluator / investor / teacher** — opens `/demo` and follows the guided walkthrough to understand the venture,
  its impact, its risks and what comes next.
- **Founder (me)** — opens `/dashboard` to see every record the site has saved, filter it, and spot what needs
  human review.
- **External testers (5 real people, 18+)** — use the full site from `/demo` on their own device and leave a
  structured test result.
- **Not a user:** minors and anyone in an emergency (routed away by `/chat` and the 911 notices).

## 🎯 Success (what must work by the end of the week)
1. **`/demo` loads live** on Vercel (desktop + 390 px, no horizontal scroll) with a step-by-step guided walkthrough
   of every module, each step with "what to try" and an **Open** link, and a progress bar.
2. **Full navigation:** every page is reachable from the header on every page; a footer site map groups all pages;
   `/dashboard` and `/demo` are in the nav. No dead links (checked by the regression script).
3. **`/dashboard` shows records** from all Supabase tables in one unified, newest-first list with source filter,
   search, KPI tiles and a review-queue count — read live, nothing hard-coded.
4. **Agent map** on `/demo`: every agent (rule-based engines, the human reviewer, Claude as coding agent) with its
   input, output, data table and human checkpoint.
5. **Practical impact check**: value created, who could be harmed and how, mitigation, and the evidence for each.
6. **Testing summary**: the 5 external users' results read live from Supabase `site_tests`, plus the regression
   results.
7. **Version 2 roadmap**: Now / Next / Later with the reason for each item.
8. **5 external users total** complete the walkthrough and save a test result → **screenshot of the `site_tests`
   rows in Supabase Table Editor** (Week 1 lesson: no screenshot = not done).
9. **Full-site regression test**: automated `npm test` + a script that requests every route on the live URL and
   checks status 200 and the right heading; plus a manual checklist of every saving feature.

## 🖼️ UX Concept
Wireframe: `docs/week6-wireframe.png` (desktop left, mobile right). Key UX decisions:
- **Demo = a guided tour, not another long page.** A numbered stepper on the left (7 steps), the active step on the
  right with: why this module exists, what to try (2–3 bullets), the expected result and an "Open page ↗" button
  (opens in a new tab so the tour keeps its place). "Mark as done" moves the progress bar.
- Below the tour, four anchored sections linked from the top: **Agent map · Impact check · Testing summary ·
  V2 roadmap**, then the **tester form** ("I finished the walkthrough").
- **Agent map** is a 3-column flow: *Inputs* → *Agents* (cards) → *Data / human checkpoints*. Rule-based agents use
  green, human checkpoints amber, the coding agent slate — so it's obvious no LLM talks to patients.
- **Dashboard** = KPI tiles on top, triage-status bar (Stable / Review / Attention), then one unified records table
  with source chips + search + Export CSV. Red/amber/green stay reserved for triage status (brand rule, Week 4).
- **Header nav** grouped: *Try it* (Triage, Chat) · *Venture* (Research, Product, Pricing, Marketing) · *Build*
  (Dashboard, Docs) and a highlighted **Demo** button. Footer site map repeats every page.

## ✂️ Scope Cut (looked nice, not built this week)
- **User accounts + a real personal medical record** (needs Supabase Auth, LFPDPPP consent and encryption). The
  dashboard shows anonymous test records, not patient records.
- **Admin login / "mark as reviewed"** on the dashboard (needs Auth + an update policy; anon stays insert/select only).
- **An LLM agent** inside the product — still cut for safety (Week 5 decision stands).
- **Automated browser E2E suite in CI** (Playwright on every push). This week: a route regression script + manual
  checklist; CI is in the V2 roadmap.
- Charts library / analytics tool (Recharts, PostHog). Simple Tailwind bars are enough for the counts we have.
- Spanish version and a WhatsApp channel (roadmap).

## 🧱 Product Spec + Acceptance Criteria
| # | Requirement | Acceptance criteria (testable) |
|---|---|---|
| R1 | Full navigation | Header on every page links to all 10 pages (`/`, `/core`, `/chat`, `/research`, `/product`, `/pricing`, `/marketing`, `/dashboard`, `/docs`, `/demo`); footer site map lists the same pages. A test checks every nav route has a page file. |
| R2 | `/dashboard` records | Reads the 7 module tables + `site_tests`; shows one unified list (source, date, summary, status), newest first, max 300. Source chips filter; search matches summary text. Shows the real Supabase error per table if one fails, and still shows the others. |
| R3 | Dashboard KPIs | Tiles: total records, triage checks (+ % Attention), chat sessions (+ needs review), research records, pricing scenarios, marketing assets, A/B visitors, external site tests. Status bar for Stable/Review/Attention from `core_outputs` + `chat_sessions`. Export CSV of the filtered list. |
| R4 | `/demo` walkthrough | 7 steps; each shows why / what to try / expected result / Open link. Next / Back buttons; "Mark as done" updates a progress bar (x / 7). Works with keyboard and at 390 px. |
| R5 | Agent map | Lists ≥ 6 agents: Triage engine, Guide (chat), Guardrails, Research/benchmark, Pricing simulator, A/B marketing engine, Human reviewer, Claude coding agent — each with input, output, table, checkpoint, "AI?" yes/no. |
| R6 | Impact check | ≥ 4 value claims and ≥ 5 potential harms, each harm with mitigation **and** where it's implemented (page/file). Includes a viability snapshot from `lib/pricing.js` (same numbers as `/pricing`). |
| R7 | Testing summary | Live from `site_tests`: count / 5 target, average ease and trust (1–5), % completed the task, % would use it, list of comments; plus regression results table. |
| R8 | V2 roadmap | Now / Next / Later columns, ≥ 3 items each, each with "why" (linked to a test finding or a scope cut). |
| R9 | Tester form | Tester code (no names), device, steps completed, task completed yes/no, ease 1–5, trust 1–5, would use yes/maybe/no, what was confusing, comment → inserts into `site_tests`, shows the returned row id or the real error. |
| R10 | Regression | `npm test` passes; `scripts/regression.mjs <url>` checks all 10 routes → 200 + expected heading; manual checklist of the 6 save features done on the live site. |

## 🏗️ Architecture
```
Visitor ──> Next.js 14 App Router on Vercel
  ├─ app/layout.js  — grouped header nav + footer site map (from lib/siteMap.js: one list = no dead links)
  ├─ /demo (server page)
  │    ├─ <DemoTour/> (client)     — steps from lib/siteMap.js DEMO_STEPS, progress in React state
  │    ├─ Agent map                — lib/siteMap.js AGENTS (static, reviewed by a human)
  │    ├─ Impact check             — lib/impact.js IMPACT (value, harms, mitigations) + calculateRevenue() from lib/pricing.js
  │    ├─ <TestingSummary/> (client) ──select──> Supabase site_tests  → summarizeSiteTests() (lib/dashboard.js)
  │    ├─ V2 roadmap               — lib/impact.js ROADMAP
  │    └─ <SiteTestForm/> (client) ──insert──> Supabase site_tests  → shows returned id
  └─ /dashboard (server page)
       └─ <VentureDashboard/> (client)
            ──select (parallel, each with its own error)──> core_outputs · chat_sessions · chat_feedback ·
              research_records · pricing_scenarios · marketing_assets · ab_events · site_tests
            → normalizeRecords() → one list {source, created_at, summary, status, needs_review}
            → summarizeRecords() → KPI tiles + status bar ; filterRecords() → chips + search ; toCSV() export
Existing modules (/core, /chat, /research, /pricing, /marketing, /) unchanged except nav/footer.
Supabase (Postgres + RLS): anon INSERT + SELECT only on every table (no update/delete).
```
All logic (normalize, summarize, filter, site-test summary) lives in **pure functions in `lib/dashboard.js`** so it can
be unit-tested without a browser or a database.

## 🧰 Tech Stack
| Tool | Why |
|---|---|
| Next.js 14 App Router | Same as Weeks 1–5; new pages are server pages with small client islands. |
| Tailwind CSS | Same brand tokens; responsive tiles, stepper, tables. |
| Supabase (Postgres + RLS) | Existing 7 tables + new `site_tests`; anon insert/select only. |
| Vercel | Auto-deploy on push to `main`; rollback by promoting the previous deployment. |
| GitHub | Commit history = build evidence (this packet is commit #1). |
| `node:test` | Unit + integration tests with no new dependency. |
| `scripts/regression.mjs` (Node `fetch`) | Full-site route regression against the live URL, no new dependency. |
| No LLM in the product | Safety in health (Week 5 decision). Claude is used only as the **coding** agent. |

## ⚙️ DevOps
- Repo `melaniezame-gif/expediente-me`, branch `main`, ≥ 5 small commits.
- Env vars unchanged: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (trimmed in `lib/supabaseClient.js`).
- Database: run **`supabase_site.sql`** in Supabase SQL Editor (creates `site_tests`) **before** testing the form.
- Deploy plan: push → Vercel build #1 → open `/demo` and `/dashboard` live → run `scripts/regression.mjs` against the
  live URL → 5 external users → fix what they find → push → Vercel build #2 → re-run the regression and re-test the
  fixed case live (Gate 3).
- Rollback: Vercel → Deployments → previous "Ready" build → Promote to Production.

## 🧪 Test Plan
**Software tests (automated, `npm test`, file `tests/site.test.mjs`) — plus the 12 existing tests from Weeks 2–5 as
the regression suite:**
1. **S1 — Navigation integrity:** every route in `NAV_GROUPS`, `FOOTER` and `DEMO_STEPS` has an `app/**/page.js`;
   no duplicates; `/demo` and `/dashboard` are in the nav.
2. **S2 — Dashboard logic:** `normalizeRecords` turns rows from each table into the common shape; `summarizeRecords`
   counts per source, status totals, needs-review and unique A/B visitors correctly; `filterRecords` by source + search.
3. **S3 — Impact, agents, roadmap, site tests:** ≥ 6 agents with all fields; every harm has a mitigation and a
   location; roadmap has ≥ 3 items per column; `summarizeSiteTests` averages and percentages are right; the
   viability snapshot equals `calculateRevenue()` from `/pricing`.

**Full-site regression (live URL):** `node scripts/regression.mjs https://expediente-me-wine.vercel.app` → all 10
routes 200 + expected heading. Manual checklist: save on `/core`, `/research`, `/pricing`, `/marketing`, `/chat`
(👍 + summary) and `/demo` form → each row visible in Supabase Table Editor and in `/dashboard`.

**External users (5 real people, 18+, live URL, own device):** task card = "Start at /demo, follow the 7 steps, try a
triage and a chat, then fill in 'I finished the walkthrough'." Observe silently, note where they hesitate.
Evidence: screenshot of the 5 `site_tests` rows + what changed because of them (Iteration Log).

## 🤖 Coding Agent Prompt (exact)
> Week 6 for my Next.js 14 (App Router, JavaScript, Tailwind, Supabase) project "Vitalis". Follow
> docs/WEEK6_BUILD_PACKET.md. (1) Create lib/siteMap.js (NAV_GROUPS, FOOTER, DEMO_STEPS for 7 steps, AGENTS) and
> lib/impact.js (value, harms with mitigation + location, ROADMAP now/next/later). (2) Create lib/dashboard.js — pure:
> normalizeRecords(table, rows), summarizeRecords(records), filterRecords(records, {source, query}),
> summarizeSiteTests(rows), recordsToCSV. (3) Write supabase_site.sql (site_tests with RLS insert/select for anon +
> grants) and tests/site.test.mjs with 3 tests (navigation integrity, dashboard logic, impact/agents/roadmap/site
> tests). (4) Rebuild the header as grouped nav from lib/siteMap.js with a highlighted Demo button and add a footer
> site map. (5) Build /dashboard: VentureDashboard reads all 8 tables in parallel, each with its own error, KPI tiles,
> status bar, unified newest-first list with source chips, search and Export CSV. (6) Build /demo: DemoTour stepper
> with Next/Back, Open ↗, Mark as done and a progress bar; agent map; impact check with viability snapshot from
> lib/pricing.js; TestingSummary live from site_tests; V2 roadmap; SiteTestForm that inserts into site_tests and shows
> the returned id or the real error. (7) Write scripts/regression.mjs that checks every route on a base URL. English
> everywhere. Never show "saved" unless Supabase returned the row.
