// Week 6 — Practical impact check + Version 2 roadmap.
// Pure data written and reviewed by a human. Every harm must say how it is
// mitigated AND where that mitigation lives, so it can be checked on the site.
import { SCENARIOS, calculateRevenue } from "./pricing.js";

export const VALUE = [
  {
    id: "speed",
    claim: "A decision in under a minute",
    detail: "4 home readings → Stable / Review / Attention with the reason and a next step, instead of a panicked WhatsApp thread or a guess.",
    evidence: "Week 5 testers reached a result in one sitting on their own phones; triage rules unit-tested since Week 2.",
  },
  {
    id: "emergency",
    claim: "Emergencies are caught before any number is asked",
    detail: "The guide asks about chest pain, breathing trouble, fainting and stroke signs first and shows 911 immediately.",
    evidence: "Week 5 tester U3 chose an emergency symptom and saw the 911 card with no readings asked.",
  },
  {
    id: "cost",
    claim: "Free and no login",
    detail: "No account, no download, $0. Research (Week 2) found no free, no-login tool in Mexico that turns vital signs into an urgency level.",
    evidence: "Competitor table and gaps on /research.",
  },
  {
    id: "explainable",
    claim: "Explainable, not a black box",
    detail: "Rule-based score anyone can read (same rules on /core and /chat). No generative AI talks to patients.",
    evidence: "Formula in lib/triage.js; agent map on this page.",
  },
  {
    id: "family",
    claim: "Saved results the family and the doctor can see",
    detail: "Results are saved and can be shown at the next appointment (full personal record is a V2 item).",
    evidence: "Saved records on /dashboard.",
  },
];

export const HARMS = [
  {
    id: "false-reassurance",
    harm: "False reassurance — a Stable light makes someone skip care they need",
    who: "Patients with symptoms the 4 readings don't capture",
    mitigation: "Every Stable result says it only describes these 4 readings right now and doesn't replace a doctor; check-up if a symptom lasts 2–3 days.",
    where: "/chat result card (added after Week 5 tester U3) · lib/chatbot.js",
    status: "Mitigated",
  },
  {
    id: "missed-emergency",
    harm: "A real emergency is treated as a number problem",
    who: "Anyone with chest pain, stroke signs, severe breathing trouble",
    mitigation: "Red-flag question comes before readings; emergency guardrail fires on typed text too; 911 link.",
    where: "/chat · checkGuardrails in lib/chatbot.js (tested in C1)",
    status: "Mitigated",
  },
  {
    id: "self-harm",
    harm: "Someone in crisis gets a generic answer",
    who: "People mentioning suicide or self-harm",
    mitigation: "Highest-priority guardrail: Línea de la Vida 800 911 2000 + 911, conversation flagged for human review.",
    where: "/chat · lib/chatbot.js (EN + ES phrases)",
    status: "Mitigated",
  },
  {
    id: "dosing",
    harm: "Unsafe medicine or diagnosis advice",
    who: "Users asking “can I take…?” or “what do I have?”",
    mitigation: "Medication and diagnosis guardrails refuse and point to a doctor or pharmacist; no LLM can invent an answer.",
    where: "/chat · lib/chatbot.js",
    status: "Mitigated",
  },
  {
    id: "privacy",
    harm: "Personal health data exposed",
    who: "Every user (LFPDPPP — Mexican data protection law)",
    mitigation: "No names or accounts; CURP, phone and email are removed in the browser before saving; testers use codes (U1…U5).",
    where: "redactPII in lib/chatbot.js · all forms",
    status: "Partly mitigated",
  },
  {
    id: "public-read",
    harm: "Saved records are readable by anyone with the anon key",
    who: "Testers who typed something personal in a comment",
    mitigation: "Only anonymous test data is stored; forms say “no names”. Real records need Auth + per-user RLS before launch (V2 — Now).",
    where: "Supabase RLS (anon select) · V2 roadmap",
    status: "Open — V2",
  },
  {
    id: "minors",
    harm: "A minor uses an adult tool",
    who: "Under-18 users",
    mitigation: "Age question routes minors to a trusted adult and 911; session flagged for review.",
    where: "/chat Q2 · lib/chatbot.js",
    status: "Mitigated",
  },
  {
    id: "device-error",
    harm: "Bad readings from a cheap home device",
    who: "Users with uncalibrated oximeters / thermometers",
    mitigation: "Impossible values rejected with the valid range; tip to re-measure before acting.",
    where: "/core + /chat validation",
    status: "Partly mitigated",
  },
];

// Same numbers as the /pricing page — the test checks they never drift apart.
export function viabilitySnapshot() {
  return Object.entries(SCENARIOS).map(([name, inputs]) => ({ name, inputs, ...calculateRevenue(inputs) }));
}

export const VIABILITY_NOTES = [
  "B2C Free is the acquisition channel; revenue comes from Plus ($79 MXN / month) and the Clinic plan ($599 MXN / month).",
  "Cost to run today is ~$0 (Vercel + Supabase free tiers, no AI API calls) — every peso of revenue is margin until scale.",
  "Biggest viability risk: trust vs. the pharmacy doctor (research risk map) — the free triage must earn trust before anyone pays.",
];

export const ROADMAP = {
  now: [
    {
      item: "Accounts + private records (Supabase Auth, per-user RLS, LFPDPPP consent)",
      why: "Open harm: anon can read test records. Required before any real patient data.",
    },
    {
      item: "“Mark as reviewed” for the human review queue",
      why: "Week 5 scope cut — flagged chats pile up with no way to close them.",
    },
    {
      item: "Automated browser tests in CI (Playwright on every push)",
      why: "This week's regression is a script + manual checklist; it should run by itself.",
    },
  ],
  next: [
    {
      item: "PDF export of a person's history for the doctor",
      why: "Plus-plan feature on /pricing; the landing page already promises results you can show the doctor.",
    },
    {
      item: "Spanish version",
      why: "Persona Daniela lives in CDMX; the course required English this term.",
    },
    {
      item: "Check-up reminders (email / WhatsApp)",
      why: "Turns a one-time check into a habit; Plus-plan feature.",
    },
  ],
  later: [
    {
      item: "Clinic dashboard (front-desk triage for 1–5 doctors)",
      why: "B2B revenue line from /pricing — needs accounts and roles first.",
    },
    {
      item: "Retrieval-only assistant over the curated answers",
      why: "Smarter matching without letting a model invent medical advice (Week 5 decision).",
    },
    {
      item: "Bluetooth readings from home devices + clinical validation with a doctor",
      why: "Removes typing errors; needed before any COFEPRIS conversation.",
    },
  ],
};
