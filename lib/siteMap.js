// Week 6 — one source of truth for navigation, the /demo tour and the agent map.
// Pure data, no React: the header, the footer, the tour and the tests all read
// from here, so a page can't be linked in one place and forgotten in another.

// Week 6 iteration (external tester U4: "too many icons and options"):
// the header shows only the 3 things a user does; the rest sits under "More".
export const PRIMARY_NAV = [
  { label: "Triage", href: "/core" },
  { label: "Chat", href: "/chat" },
  { label: "Dashboard", href: "/dashboard" },
];

export const MORE_NAV = [
  { label: "Product", href: "/product" },
  { label: "Pricing", href: "/pricing" },
  { label: "Research", href: "/research" },
  { label: "Marketing", href: "/marketing" },
  { label: "Docs", href: "/docs" },
];

export const DEMO_LINK = { label: "Take the tour", href: "/demo" };

// Every page of the site, with the week it was built — used by the footer
// site map and by the regression script (expected heading text).
export const ALL_PAGES = [
  { href: "/", label: "Home (landing page)", week: 4, heading: "How it works" },
  { href: "/core", label: "Triage", week: 1, heading: "Check the patient" },
  { href: "/research", label: "Research", week: 2, heading: "Is the problem real?" },
  { href: "/product", label: "Product", week: 3, heading: "One place for your vital signs" },
  { href: "/pricing", label: "Pricing", week: 3, heading: "Revenue simulator" },
  { href: "/marketing", label: "Marketing", week: 4, heading: "Marketing engine" },
  { href: "/chat", label: "Chat — Vitalis Guide", week: 5, heading: "Vitalis Guide" },
  { href: "/dashboard", label: "Dashboard", week: 6, heading: "Venture dashboard" },
  { href: "/docs", label: "Docs — prompt log", week: 1, heading: "Coding agent prompt log" },
  { href: "/demo", label: "Demo — guided walkthrough", week: 6, heading: "Guided walkthrough" },
];

// The guided tour. Each step happens ON the real page: a bar at the bottom of
// that page (components/TourBar.js) shows what to do and the Next button.
// Week 6 iteration: 7 steps → 5, one concrete action each, exact values.
export const DEMO_STEPS = [
  {
    id: "home",
    title: "See what Vitalis is",
    href: "/",
    doThis: ["Read the big headline at the top.", "Scroll down to “How it works” (3 short steps)."],
    expected: "You know what Vitalis does in one sentence. Nothing to type here.",
  },
  {
    id: "triage",
    title: "Check a reading",
    href: "/core",
    doThis: ["Type 37.5, 105, 93 and 5 in the 4 boxes.", "Press “Calculate”, then “Save this result”."],
    expected: "A yellow “Review” result (score 4 of 8) and a “saved” message.",
  },
  {
    id: "chat",
    title: "Ask the guide",
    href: "/chat",
    doThis: [
      "Press the buttons: “Me” → “18–64” → “None of these”.",
      "Type 37 80 98 1 and press Send, then press “Yes, that's right”.",
    ],
    expected: "A green “Stable” result that reminds you it doesn't replace a doctor.",
  },
  {
    id: "plans",
    title: "See the plans",
    href: "/product",
    doThis: ["Scroll down to the plans: Free, Plus and Clinic.", "Ask yourself: would I pay for Plus?"],
    expected: "You understand what's free and what costs money. Nothing to type here.",
  },
  {
    id: "dashboard",
    title: "Find your saved result",
    href: "/dashboard",
    doThis: ["Press the “Triage” button above the list.", "Your result from step 2 should be the first row."],
    expected: "Your 37.5 · 105 · 93 · 5 result at the top, marked “Review”.",
  },
];

// Pages for evaluators that are not part of the user tour.
export const BEHIND_THE_SCENES = [
  { label: "Research — is the problem real?", href: "/research" },
  { label: "Pricing — revenue simulator", href: "/pricing" },
  { label: "Marketing engine + A/B tests", href: "/marketing" },
  { label: "Docs — every prompt to the coding agent", href: "/docs" },
];

export function tourHref(index) {
  const step = DEMO_STEPS[index];
  return `${step.href}?tour=${index + 1}`;
}

// Agent map: who (or what) acts, on what, and where a human checks it.
// `ai` = does this agent use a generative model? Only the coding agent does.
export const AGENTS = [
  {
    id: "triage",
    name: "Triage engine",
    kind: "rule",
    page: "/core",
    file: "lib/triage.js",
    input: "4 readings: °C, bpm, SpO₂ %, pain 0–10",
    output: "Score 0–8 → Stable / Review / Attention + next step",
    table: "core_outputs",
    checkpoint: "Fixed, published rules; any user can read why they got their light.",
    ai: false,
  },
  {
    id: "guide",
    name: "Vitalis Guide",
    kind: "rule",
    page: "/chat",
    file: "lib/chatbot.js",
    input: "3 intake answers, typed questions, readings",
    output: "Curated, human-written answers; same triage as /core",
    table: "chat_sessions · chat_feedback",
    checkpoint: "User must Confirm / Edit before any result; flagged chats go to the review queue.",
    ai: false,
  },
  {
    id: "guardrails",
    name: "Guardrails",
    kind: "rule",
    page: "/chat",
    file: "lib/chatbot.js (checkGuardrails, redactPII)",
    input: "Every typed message",
    output: "Self-harm → emergency → minor → medicine → diagnosis → off-topic; CURP/phone/email removed",
    table: "chat_sessions.guardrails",
    checkpoint: "Runs before any answer; priority order fixed and unit-tested.",
    ai: false,
  },
  {
    id: "research",
    name: "Research + benchmark",
    kind: "rule",
    page: "/research",
    file: "lib/researchData.js",
    input: "Sourced desk research + founder notes",
    output: "Competitor table, benchmarks, risk map",
    table: "research_records",
    checkpoint: "Every fact has a source; 1 human validation conversation (Week 2).",
    ai: false,
  },
  {
    id: "pricing",
    name: "Pricing simulator",
    kind: "rule",
    page: "/pricing",
    file: "lib/pricing.js",
    input: "Users, conversion %, prices, clinics",
    output: "Monthly + annual revenue (MXN)",
    table: "pricing_scenarios",
    checkpoint: "Inputs validated; formula shown on the page.",
    ai: false,
  },
  {
    id: "marketing",
    name: "A/B marketing engine",
    kind: "rule",
    page: "/ + /marketing",
    file: "lib/abTest.js",
    input: "Visitors, views, clicks",
    output: "Variant assignment, CTR, lift, verdict (min 30 views / variant)",
    table: "ab_events · marketing_assets",
    checkpoint: "No verdict until the sample is big enough; previews (?ab=) never counted.",
    ai: false,
  },
  {
    id: "human",
    name: "Human reviewer (founder)",
    kind: "human",
    page: "/chat + /dashboard",
    file: "—",
    input: "Flagged chats, 👎 ratings, tester comments",
    output: "Fixes, new curated answers, roadmap decisions",
    table: "reads all tables",
    checkpoint: "Is the checkpoint.",
    ai: false,
  },
  {
    id: "claude",
    name: "Claude (coding agent)",
    kind: "coding",
    page: "/docs",
    file: "every file — via prompts in /docs",
    input: "Build Discipline Packet + exact prompts",
    output: "Code, tests, commits",
    table: "GitHub (not Supabase)",
    checkpoint: "Human writes the packet first, reviews every change, rejects what doesn't fit (Human Decision Note).",
    ai: true,
  },
];
