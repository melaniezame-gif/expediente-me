// Week 6 — one source of truth for navigation, the /demo tour and the agent map.
// Pure data, no React: the header, the footer, the tour and the tests all read
// from here, so a page can't be linked in one place and forgotten in another.

export const NAV_GROUPS = [
  {
    label: "Try it",
    links: [
      { label: "Triage", href: "/core" },
      { label: "Chat", href: "/chat" },
    ],
  },
  {
    label: "Venture",
    links: [
      { label: "Research", href: "/research" },
      { label: "Product", href: "/product" },
      { label: "Pricing", href: "/pricing" },
      { label: "Marketing", href: "/marketing" },
    ],
  },
  {
    label: "Build",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Docs", href: "/docs" },
    ],
  },
];

export const DEMO_LINK = { label: "Demo", href: "/demo" };

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

export const DEMO_STEPS = [
  {
    id: "problem",
    title: "The problem",
    href: "/",
    why: "Caregivers measure vitals at home but don't know when a reading is urgent. The landing page states the problem with 3 sourced Mexico stats and runs 2 live A/B tests.",
    tryThis: ["Read the hero headline (you are in variant A or B of a live test).", "Scroll to the 3 stats and the pricing teaser."],
    expected: "A clear promise: know in under a minute if a reading is urgent — and that it is not a diagnosis.",
  },
  {
    id: "research",
    title: "Research + benchmarking",
    href: "/research",
    why: "Proves the problem is real: 5 global examples, Mexico facts, 8 competitors/substitutes and a risk map.",
    tryThis: ["Type “WhatsApp” in the competitor search.", "Look at the risk map — which risks are high?"],
    expected: "The table filters to the substitutes people use today; the gaps explain why Vitalis exists.",
  },
  {
    id: "triage",
    title: "Triage — the core",
    href: "/core",
    why: "The core value: 4 home readings → Stable / Review / Attention with the score and a next step. Rule-based, no AI.",
    tryThis: ["Enter 37.5 · 105 · 93 · 5.", "Press Save, then find your record on /dashboard."],
    expected: "Amber “Review”, score 4 / 8, and a saved confirmation with the row id.",
  },
  {
    id: "chat",
    title: "Vitalis Guide (chat)",
    href: "/chat",
    why: "Most people start with a worry, not with numbers. The guide checks for an emergency first, then asks for readings, with a human checkpoint before any result.",
    tryThis: ["Answer the 3 questions with the buttons, then type “38.5 110 93 6”.", "Ask “can I take ibuprofen?” — it must refuse safely."],
    expected: "Confirm / Edit checkpoint before the result; a Safety card for the medicine question.",
  },
  {
    id: "product",
    title: "Product + pricing",
    href: "/pricing",
    why: "Viability: Free, Plus ($79 MXN / month) and Clinic ($599 MXN / month), with a revenue simulator. The product architecture is on /product.",
    tryThis: ["Switch between Conservative, Base and Optimistic.", "Open /product to see the feature map by tier."],
    expected: "Monthly and annual revenue update instantly; scenarios can be saved.",
  },
  {
    id: "marketing",
    title: "Marketing engine",
    href: "/marketing",
    why: "How Vitalis reaches Daniela: brand system, persona, 10 posts, 3 video scripts, a 14-day calendar and the A/B tester.",
    tryThis: ["Filter the content library by channel.", "Look at the A/B tester: which headline is winning?"],
    expected: "Real views and clicks from the landing page, read live from Supabase.",
  },
  {
    id: "dashboard",
    title: "Dashboard + docs",
    href: "/dashboard",
    why: "Everything the venture has saved, in one place — and /docs shows every prompt given to the coding agent.",
    tryThis: ["Filter by “Triage” and find the record you saved in step 3.", "Open /docs and read the Week 6 prompts."],
    expected: "Your triage record is at the top of the list; the KPI tiles match the tables.",
  },
];

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
