// Week 6 — testing evidence shown on /demo#testing.
// Only real runs are written here (Week 1 lesson: never mark something as
// passing without evidence). Results are added after each run on the live URL.

export const SOFTWARE_SUITES = [
  { file: "tests/research.test.mjs", week: 2, what: "Competitor filter, risk levels, Week 1 triage cases" },
  { file: "tests/pricing.test.mjs", week: 3, what: "Revenue formula, input validation, scenarios" },
  { file: "tests/marketing.test.mjs", week: 4, what: "A/B assignment + z-test, CSV / Markdown export" },
  { file: "tests/chat.test.mjs", week: 5, what: "Guardrails, intake flow + checkpoint, response logic, U2/U3 fixes" },
  { file: "tests/site.test.mjs", week: 6, what: "S1 navigation integrity · S2 dashboard logic · S3 agents, impact, roadmap, tester form" },
];

// Filled in from `node scripts/regression.mjs <url>` output.
// { date, url, passed, total, notes }
export const REGRESSION_RUNS = [];

// Manual full-site checklist: every feature that writes to Supabase.
// result: "pass" | "fail" | "pending" — "pass" only with a Table Editor screenshot.
export const MANUAL_CHECKS = [
  { id: "M1", page: "/core", check: "Save a triage result → row in core_outputs → visible in /dashboard", result: "pending" },
  { id: "M2", page: "/research", check: "Save a research record → row in research_records", result: "pending" },
  { id: "M3", page: "/pricing", check: "Save a scenario → row in pricing_scenarios", result: "pending" },
  { id: "M4", page: "/marketing", check: "Save a post → row in marketing_assets", result: "pending" },
  { id: "M5", page: "/chat", check: "👍 an answer + Finish & save → rows in chat_feedback and chat_sessions", result: "pending" },
  { id: "M6", page: "/demo", check: "Submit the tester form → row in site_tests → counted in the testing summary", result: "pending" },
];
