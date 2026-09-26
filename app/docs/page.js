const WEEK2_PROMPTS = [
  {
    title: "1 · Fix the Save bug for real",
    text: `The "Save" button on /core never reaches Supabase: DevTools shows 0 requests. Inspect the deployed JavaScript bundle to see the exact values of NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY that were baked in at build time. Make the Supabase client trim both values, detect a broken config, and show the real error message in the UI instead of a generic one.`,
  },
  {
    title: "2 · Translate the whole site to English",
    text: `Translate every user-facing string, code comment and doc in the project to English (home, /core, layout, /docs, README). Keep the triage formula exactly the same. Rename the product in the header to "Vitalis".`,
  },
  {
    title: "3 · Build /research with the competitor table",
    text: `Create a /research page (Next.js App Router + Tailwind). Put all research data in lib/researchData.js: 5 global examples, 4 Mexico facts with sources, 8 competitors/substitutes typed as Direct / Adjacent / Substitute, 4 benchmarks, 6 risks with likelihood and impact, and the gaps. Render benchmark cards and a competitor table with a text search and a type filter. Put the filter logic in a pure function filterCompetitors() so it can be unit-tested.`,
  },
  {
    title: "4 · Risk map, save research record, dashboard widget",
    text: `Add a 3×3 risk map (likelihood × impact) that places the numbered risks automatically. Add a research intake form (question, target user, region, source type, key finding) that inserts into a new Supabase table research_records and shows the new row id on success or the real error on failure. Add a dashboard widget with counts (records saved, human validations, competitors, high risks) and the 5 latest records. Write the SQL with RLS insert/select policies for anon.`,
  },
  {
    title: "5 · Tests",
    text: `Write 3 automated tests with node:test (no extra dependencies): (1) filterCompetitors returns the right rows for a search and for a type filter, (2) riskLevel classifies likelihood × impact correctly and the dataset has exactly 5 global examples and 8 competitors, (3) calculateTriage still returns Stable 0, Review 4 and Attention 8 for the three Week 1 test cases. Add an "npm test" script.`,
  },
];

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900">Docs — Coding agent prompt log</h1>
      <p className="mt-2 text-sm text-gray-600">
        Prompts sent to the coding agent (Claude) to build this project.
      </p>

      <h2 className="mt-8 text-lg font-semibold text-gray-900">Week 2 — /research</h2>
      {WEEK2_PROMPTS.map((p) => (
        <div key={p.title} className="mt-4 rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-900">{p.title}</h3>
          <p className="mt-2 whitespace-pre-line text-sm text-gray-700">{p.text}</p>
        </div>
      ))}

      <h2 className="mt-10 text-lg font-semibold text-gray-900">Week 1 — /core</h2>
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900">Prompt used (translated from Spanish)</h3>
        <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
          {`I need a /core page for my medical record project.
It must have a 4-field form (temperature, heart rate, oxygen saturation,
pain level), calculate a risk score with simple rules (no AI, no external
APIs), show a Stable / Review / Attention light with a recommendation,
let the user save the result to Supabase (table core_outputs) and show a
dashboard with previously saved results.`}
        </p>
      </div>
    </div>
  );
}
