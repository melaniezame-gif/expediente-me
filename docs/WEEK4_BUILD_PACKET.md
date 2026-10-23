# Week 4 — Marketing Engine + Content System · Build Discipline Packet

Project: **Vitalis** (medical record + vital-signs triage) · Live: https://expediente-me-wine.vercel.app
Required page: **`/marketing`** · Written and committed **before any Week 4 code** (Gate 1).

---

## 🧩 Problem
Vitalis now works (triage, research, pricing), but the homepage still reads like a class exercise: one headline, one
button, no proof the problem is real, no plans, no answers to "is this safe?". A visitor cannot tell in 5 seconds who it
is for or why to trust it — and we have **no content and no data** to learn which message actually makes people try the
check. Marketing is currently guesswork.

## 👤 User
- **Primary (who the marketing speaks to): Daniela, 38, Mexico City.** Works full time, is the main caregiver for her
  father (67) who measures his blood pressure, pulse and oxygen at home. When a reading looks "off" at night she doesn't
  know whether to wait, call Locatel or go to urgencias. Lives on WhatsApp, Instagram and Facebook; watches short videos.
- **Internal user of `/marketing`:** the Vitalis founder (me) — needs the content ready to copy, a calendar to follow,
  and live A/B numbers to pick the winning message.

## 🎯 Success (what must work by the end of the week)
1. Upgraded homepage loads live with hero, problem stats, how it works, plans, trust/FAQ and final CTA.
2. `/marketing` loads live with: brand system, persona, landing copy, 10 social posts, 3 video scripts, 14-day calendar.
3. **2 A/B tests running for real** on the homepage (headline + CTA text); results visible on `/marketing`.
4. Every content card has **Copy** and **Save**; calendar and library **export** to CSV / Markdown.
5. Saved assets go to Supabase `marketing_assets` — proven with a **screenshot of the inserted row in Table Editor**
   (lesson from Week 1: no screenshot = not fixed).
6. 3 automated software tests pass (`npm test`), plus the 2 A/B tests documented.

## 🖼️ UX Concept
Wireframe: `docs/week4-wireframe.png` (homepage left, `/marketing` right). Key UX decisions:
- The A/B variant is invisible to visitors; the founder can force a variant with `?ab=A` / `?ab=B` to preview it.
- Red/amber/green are **reserved for triage status** — never used as decoration in marketing.
- Each content card = channel + pillar label, the text, then Copy / Save. One click to copy, so posting takes seconds.

## ✂️ Scope Cut (looked nice, not built this week)
- Auto-posting to Instagram/TikTok via their APIs (needs business accounts + app review).
- AI-generated posts on demand (content is written and reviewed by a human — safer for health claims).
- Real video production; we ship **scripts** only.
- Statistical engine beyond a two-proportion z-test (no Bayesian, no multi-armed bandit).
- Email capture / newsletter (would need privacy notice + LFPDPPP consent flow).
- Spanish version of the site (course requires English; Spanish copy is a later step).

## 🧱 Product Spec + Acceptance Criteria
| # | Requirement | Acceptance criteria (testable) |
|---|---|---|
| R1 | Homepage upgraded | Shows hero (A/B headline + CTA), 3 sourced stats, 3 steps, 3 plans with prices from `/product`, 4 FAQ, disclaimer, final CTA. Loads on mobile without horizontal scroll. |
| R2 | Brand system | `/marketing` shows name, tagline, 6 colour swatches with hex, type scale, 3 voice DOs and 3 DON'Ts. |
| R3 | Target persona | Persona card with name, age, city, situation, goals, frustrations, channels, and the quote. |
| R4 | Landing page copy | Hero A, hero B, subhead, 2 CTA variants, 3 sections and FAQ shown as copyable cards. |
| R5 | 10 social posts | Exactly 10 cards, each with channel, pillar, text, hashtags; X posts ≤ 280 characters. Filter by channel + search. |
| R6 | 3 video scripts | Exactly 3 scripts, each with length, hook, and timed scenes (visual / voice-over / on-screen text). |
| R7 | 14-day calendar | Exactly 14 days, each linked to an existing post or script id; Export CSV and Export Markdown download files. |
| R8 | A/B tester | Each visitor is assigned A or B per test (50/50, sticky in localStorage). One `view` per visitor per test and one `click` per visitor per test are inserted into `ab_events`. `/marketing` shows views, clicks, CTR, lift and a verdict; verdict says "Keep running" below 30 views per variant. |
| R9 | Copy / export buttons | Copy puts the exact card text on the clipboard and shows "Copied"; export downloads a file. |
| R10 | Saved marketing assets | Save inserts into `marketing_assets`; success message shows the real row id returned by Supabase; failure shows the real error. Saved list + dashboard widget (counts and A/B leaders) read from Supabase. |

## 🏗️ Architecture
```
Visitor ── / (homepage, client component HeroAB)
   │         ├─ assignVariant() → localStorage "vitalis_ab"
   │         ├─ insert {test_id, variant, event:'view', visitor_id} → Supabase ab_events
   │         └─ CTA click → insert event:'click' → then navigate to /core
Founder ── /marketing (server page + client components)
             ├─ lib/marketingData.js  (brand, persona, copy, posts, scripts, calendar — static, versioned in Git)
             ├─ ContentLibrary  → Copy (navigator.clipboard) · Save → insert marketing_assets
             ├─ CampaignCalendar → toCSV()/toMarkdown() → Blob download
             ├─ ABTester → select ab_events → summarizeEvents() → analyzeABTest() (z-test)
             └─ MarketingWidget → counts from marketing_assets + ab_events
Supabase (Postgres + RLS): ab_events, marketing_assets (anon: insert + select only)
```
Pure logic (`lib/abTest.js`, `lib/marketingData.js` helpers) has no React or Supabase, so it is unit-tested.

## 🧰 Tech Stack
| Tool | Why |
|---|---|
| Next.js 14 App Router | Same as Weeks 1–3; `/marketing` is a server page with small client islands. |
| Tailwind CSS | Brand tokens as utility classes; fast responsive layout. |
| Supabase (Postgres + RLS) | Stores A/B events and saved assets; anon key can only insert/select. |
| Vercel | Auto-deploy on every push to `main`. |
| GitHub | Version control; commit history is the build evidence. |
| `node:test` | Built-in test runner — no extra dependency. |
| Browser APIs (Clipboard, Blob, localStorage) | Copy/export/variant stickiness without libraries. |

## ⚙️ DevOps
- Repo: `melaniezame-gif/expediente-me`, branch `main`; small commits per feature (≥ 5).
- Env vars (unchanged, already trimmed in `lib/supabaseClient.js`): `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Database: run `supabase_marketing.sql` in Supabase SQL Editor **before** testing Save / A/B.
- Deploy plan: push → Vercel build → check `/` and `/marketing` load → run tests → fix → push again (≥ 2 deployments).
- Rollback: Vercel "Promote to production" on the previous deployment if a build breaks the live site.

## 🧪 Test Plan
**Software tests (automated, `npm test`):**
1. **T1 — A/B statistics:** `analyzeABTest` returns correct CTRs and lift, says "Keep running" with < 30 views per
   variant, and declares B the winner for 200/20 vs 200/45.
2. **T2 — Variant assignment:** `assignVariant` is 50/50 by the random value, respects a `?ab=` override, and keeps an
   existing assignment; `summarizeEvents` counts unique visitors once.
3. **T3 — Content system integrity:** exactly 10 posts, 3 scripts, 14 calendar days; every calendar day references an
   existing asset; X posts ≤ 280 chars; `toCSV` escapes commas, quotes and line breaks.

**A/B tests (live, with real visitors):**
- **A/B 1 — Hero headline:** A "Understand your vital signs and know when to seek care" vs B "A worrying reading at
  home? Know in 30 seconds if it's urgent." Metric: CTA click-through to `/core`.
- **A/B 2 — CTA text:** A "Start the check" vs B "Check my vitals — free". Same metric.
- Method: share the homepage with classmates/family; target ≥ 30 visitors per variant; record results screenshot.

**Manual live checks:** Save a post → screenshot the row in Supabase Table Editor → refresh `/marketing` and see it in
the saved list. Open `/?ab=B` in incognito → confirm a `view` row with variant B appears in `ab_events`.

## 🤖 Coding Agent Prompt (exact)
> Week 4 for my Next.js 14 (App Router, JavaScript, Tailwind, Supabase) project "Vitalis". Follow
> docs/WEEK4_BUILD_PACKET.md. (1) Put all marketing content in lib/marketingData.js: brand system, persona, landing
> copy, 10 social posts, 3 video scripts, 14-day calendar, the 2 A/B test definitions, plus pure helpers toCSV and
> toMarkdown. (2) Create lib/abTest.js with pure functions assignVariant, summarizeEvents and analyzeABTest
> (two-proportion z-test, min 30 views per variant). (3) Upgrade the homepage: client HeroAB component that assigns
> variants, logs one view and one click per visitor per test to Supabase ab_events, then navigates to /core; add
> stats from lib/researchData.js, plans from lib/pricing.js, FAQ and disclaimer. (4) Create /marketing with brand,
> persona, content cards (filter, search, Copy, Save to marketing_assets showing the returned row id), calendar with
> CSV/Markdown export, A/B tester with live results, saved assets list and a dashboard widget. (5) Write
> supabase_marketing.sql with RLS insert/select for anon and grants. (6) Add 3 node:test tests. Use English
> everywhere. Never show a success message unless Supabase returned the inserted row.
