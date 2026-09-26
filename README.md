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
| `/docs` | Coding-agent prompt log |

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

3. Run `supabase_setup.sql` and `supabase_research.sql` in the Supabase SQL Editor.
4. `npm run dev`
5. `npm test` runs the 3 automated tests (Node's built-in test runner).

## Lesson from Week 1

The Save button failed because the Vercel env vars had a trailing space (URL)
and the anon key pasted 32 times with line breaks. `NEXT_PUBLIC_` variables are
baked in at build time, so after fixing them you must **redeploy**. The client
now trims both values and the UI shows the real error.

Educational project — not a medical device and not a diagnosis.
