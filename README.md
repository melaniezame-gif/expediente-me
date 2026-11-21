# Vitalis — Medical Record

A quick vital-signs check for patients and caregivers. Users enter 4 basic
readings and get a clear urgency light — Stable, Review or Attention — plus a
recommendation and a saved history.

Tagline: Know when to act, in time.

Live: https://expediente-me-wine.vercel.app

| Page | What it does |
|---|---|
| `/core` | Week 1 — rule-based triage (temperature, heart rate, SpO₂, pain) saved to Supabase `core_outputs` |
| `/research` | Week 2 — research + benchmarking dashboard: 5 global examples, Mexico localization, 8 competitors/substitutes with search and filter, benchmark cards, risk map, research intake saved to Supabase `research_records`, dashboard widget |
| `/` | Week 4 — landing page with 2 live A/B tests (hero headline, CTA text) logged to Supabase `ab_events` |
| `/marketing` | Week 4 — marketing engine: brand system, persona, landing copy, 10 social posts, 3 video scripts, 14-day calendar, A/B tester, Copy/Save/Export, saved assets in `marketing_assets`, dashboard widget |
| `/chat` | Week 5 — Vitalis Guide: guided assistant with 3 intake questions, emergency check before numbers, human checkpoint, guardrails (emergency, self-harm, medicines, diagnosis, minors, personal data, off-topic), 👍/👎 in `chat_feedback`, test summaries in `chat_sessions`, review queue + widget |
| `/dashboard` | Week 6 — every saved record from all 8 Supabase tables in one list: KPI tiles, triage status bar, source filter, search, needs-review filter, Export CSV |
| `/demo` | Week 6 — 5-minute guided walkthrough of the whole venture (7 steps), agent map, practical impact check + viability, V2 roadmap, live testing summary, external tester form (`site_tests`) |
| `/docs` | Coding-agent prompt log (Weeks 1–6) |

## Tech stack

- [Next.js](https://nextjs.org/) 14 (App Router)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (Postgres + Row Level Security)
- Deployed on [Vercel](https://vercel.com/)

## Getting started (local development)

1. `npm install`
2. Create `.env.local` with your Supabase values (Supabase > Project Settings > API):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key, pasted once, no spaces>
   ```

3. Run `supabase_setup.sql`, `supabase_research.sql`, `supabase_pricing.sql`, `supabase_marketing.sql`, `supabase_chat.sql` and `supabase_site.sql` in the Supabase SQL Editor.
4. `npm run dev`
5. `npm test` runs the automated tests (Node's built-in test runner).
6. `npm run regression -- https://expediente-me-wine.vercel.app` checks all 10 routes on the live site (status 200, heading, shared nav).

## Lesson from Week 1

The Save button failed because the Vercel env vars had a trailing space (URL)
and the anon key pasted 32 times with line breaks. `NEXT_PUBLIC_` variables are
baked in at build time, so after fixing them you must **redeploy**. The client
now trims both values and the UI shows the real error.

Educational project — not a medical device and not a diagnosis.
