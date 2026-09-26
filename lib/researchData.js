// Week 2 research dataset for /research.
// Every figure below comes from a public source listed in `sources`.
// Qualitative ratings (price, triage, record, etc.) are our own judgement
// and are labelled as such on the page.

export const RESEARCH_QUESTION =
  "When a patient or caregiver in Mexico measures vital signs at home, what do they use today to decide whether it is urgent — and what is missing?";

export const GLOBAL_EXAMPLES = [
  {
    id: "nhs111",
    name: "NHS 111 online",
    country: "United Kingdom",
    model: "Public, free",
    whatItDoes:
      "Government digital triage: the user answers questions about one main symptom and is routed to self-care, pharmacist, GP, urgent care or a nurse call-back.",
    lesson:
      "Output is a care destination, not a diagnosis. Clear next step beats a list of possible diseases.",
    source: "https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-use-111/how-nhs-111-online-works/",
  },
  {
    id: "ada",
    name: "Ada Health",
    country: "Germany",
    model: "Free app (B2C) + B2B",
    whatItDoes:
      "AI symptom assessment app that lists possible causes and advises what to do next. Explicitly says it gives an assessment, not a diagnosis.",
    lesson:
      "Studies cited by clinicians say Ada is better at triage (urgency) than at diagnosis — urgency is the realistic job.",
    source: "https://www.iatrox.com/blog/ada-symptom-checker-review-uk-gp-2026",
  },
  {
    id: "infermedica",
    name: "Infermedica",
    country: "Poland",
    model: "B2B API",
    whatItDoes:
      "Symptom checker and triage engine sold to insurers, providers and telemedicine platforms. 20 languages including Spanish; 4 care levels from self-care to emergency.",
    lesson:
      "The triage engine itself can be a product sold to others — but the patient never sees the brand.",
    source: "https://infermedica.com/product/symptom-checker",
  },
  {
    id: "buoy",
    name: "Buoy Health",
    country: "United States",
    model: "Free for users, paid by health systems",
    whatItDoes:
      "Chat-style symptom checker that gives a tailored assessment and helps the user find care nearby. White-labelled by US hospital systems.",
    lesson:
      "Distribution through hospitals and insurers, not app stores, is how symptom checkers reach users.",
    source: "https://www.buoyhealth.com/symptom-checker/",
  },
  {
    id: "babylon",
    name: "Babylon Health (failure case)",
    country: "United Kingdom",
    model: "Telehealth + AI triage (closed 2023)",
    whatItDoes:
      "Reached a USD 4.2B valuation in 2021, then entered administration in 2023. Its AI triage claims were criticised as not proven against doctors.",
    lesson:
      "Over-claiming accuracy destroys trust. A simple, explainable rule set is a safer promise for a health tool.",
    source: "https://en.wikipedia.org/wiki/Babylon_Health",
  },
];

export const MEXICO_FACTS = [
  {
    id: "pharmacy",
    value: "18,000",
    label: "pharmacy-adjacent doctor's offices in Mexico (2023), up 38% in 10 years",
    detail: "They give about 10 million consultations per month.",
    source: "https://es-us.noticias.yahoo.com/consultorios-farmacias-crecen-38-10-000024013.html",
  },
  {
    id: "hypertension",
    value: "40.5%",
    label: "of Mexican adults with hypertension do not know they have it",
    detail: "Hypertension affects 29.1% of adults (Ensanut 2021–2024).",
    source: "https://consultorsalud.com.mx/hipertension-mexico-desconoce-diagnostico/",
  },
  {
    id: "digital",
    value: "65%",
    label: "of Mexican patients use digital tools before visiting a specialist",
    detail: "Doctoralia Mexico patient study, 2026.",
    source: "https://press.doctoralia.com.mx/460257-el-nuevo-paciente-digital-esta-transformando-la-atencion-medica-en-mexico",
  },
  {
    id: "locatel",
    value: "24/7",
    label: "free phone medical guidance in Mexico City (Locatel 0311)",
    detail: "Exists, but only by phone and only in CDMX — nothing is saved for the family.",
    source: "https://www.tvazteca.com/aztecanoticias/asistencia-medica-gratuita-al",
  },
];

// type: "Direct" = gives an urgency level; "Adjacent" = solves part of the job;
// "Substitute" = what people do instead of using any product.
export const COMPETITORS = [
  {
    id: 1,
    name: "Pharmacy-adjacent doctor's office (e.g. Dr. Simi)",
    type: "Substitute",
    region: "Mexico",
    price: "Low cost",
    urgencyLevel: "Yes (in person)",
    savesHistory: "No",
    inputs: "In-person exam",
    weakness: "Requires travel and waiting; no record kept for the family.",
    source: "https://es-us.noticias.yahoo.com/consultorios-farmacias-crecen-38-10-000024013.html",
  },
  {
    id: 2,
    name: "Locatel 0311 medical line",
    type: "Substitute",
    region: "Mexico (CDMX)",
    price: "Free",
    urgencyLevel: "Yes (by phone)",
    savesHistory: "No",
    inputs: "Phone conversation",
    weakness: "Only Mexico City, only by phone, nothing written down afterwards.",
    source: "https://www.tvazteca.com/aztecanoticias/asistencia-medica-gratuita-al",
  },
  {
    id: 3,
    name: "1DOC3",
    type: "Direct",
    region: "Latin America",
    price: "Paid (mostly via employers)",
    urgencyLevel: "Yes (doctor chat)",
    savesHistory: "Partial",
    inputs: "Chat with a doctor",
    weakness: "Mainly sold as an employee benefit; needs an account and a doctor on the other side.",
    source: "https://www.1doc3.com/",
  },
  {
    id: 4,
    name: "Doctoralia",
    type: "Adjacent",
    region: "Mexico + global",
    price: "Free to search",
    urgencyLevel: "No",
    savesHistory: "No",
    inputs: "Search by specialty",
    weakness: "Helps book a doctor, not decide whether it is urgent.",
    source: "https://www.doctoralia.com.mx/",
  },
  {
    id: 5,
    name: "Ada Health",
    type: "Direct",
    region: "Global (Spanish available)",
    price: "Free",
    urgencyLevel: "Yes",
    savesHistory: "Yes",
    inputs: "Symptoms (long interview)",
    weakness: "Symptom-based, not vital-sign-based; long question flow; not built for Mexico.",
    source: "https://www.iatrox.com/blog/ada-symptom-checker-review-uk-gp-2026",
  },
  {
    id: 6,
    name: "OMRON connect",
    type: "Adjacent",
    region: "Global",
    price: "Free app (needs OMRON device)",
    urgencyLevel: "No",
    savesHistory: "Yes",
    inputs: "Blood pressure from device",
    weakness: "Logs readings but does not tell you what to do; locked to one brand.",
    source: "https://omronhealthcare.com/omron-connect-app",
  },
  {
    id: 7,
    name: "Apple Health / smartwatch",
    type: "Adjacent",
    region: "Global",
    price: "Expensive hardware",
    urgencyLevel: "Partial (heart alerts)",
    savesHistory: "Yes",
    inputs: "Automatic sensors",
    weakness: "Needs an iPhone/Watch; alerts cover specific heart events, not a general urgency check.",
    source: "https://support.apple.com/en-us/120276",
  },
  {
    id: 8,
    name: "Google search / WhatsApp family group / paper notebook",
    type: "Substitute",
    region: "Everywhere",
    price: "Free",
    urgencyLevel: "No",
    savesHistory: "Partial (paper, chat)",
    inputs: "Free text",
    weakness: "Inconsistent answers, worry or false reassurance; history is scattered.",
    source: null,
  },
];

// Benchmark: what "good" looks like for our product, measured against the field.
export const BENCHMARKS = [
  {
    id: "time",
    metric: "Time to an urgency answer",
    ours: "< 1 minute (4 numbers)",
    field: "Symptom checkers: multi-question interview; consultorio: travel + wait",
  },
  {
    id: "explain",
    metric: "Explainability",
    ours: "Every point of the score is visible (rule-based)",
    field: "AI checkers show a result, not the reasoning",
  },
  {
    id: "standard",
    metric: "Clinical reference",
    ours: "Simplified from NEWS2 early-warning parameters",
    field: "NEWS2 (UK Royal College of Physicians) is the hospital standard",
    source: "https://www.rcp.ac.uk/resources/national-early-warning-score-news-2/",
  },
  {
    id: "history",
    metric: "Saved history for the family",
    ours: "Every result saved to a shared dashboard",
    field: "Only device apps (OMRON, Apple) save history — and they don't triage",
  },
];

// Risk map: likelihood x impact, 1 (low) to 3 (high).
export const RISKS = [
  {
    id: "under",
    risk: "Under-triage: tool says Stable when the patient needs care",
    likelihood: 2,
    impact: 3,
    mitigation: "Clear disclaimer; any single severe value pushes the result up; always show 'call 911 if…' guidance.",
  },
  {
    id: "diagnosis",
    risk: "Users treat the result as a diagnosis",
    likelihood: 3,
    impact: 2,
    mitigation: "Word outputs as 'next step', never as a disease name (lesson from NHS 111 and Ada).",
  },
  {
    id: "device",
    risk: "Bad readings from cheap home devices (oximeter, thermometer)",
    likelihood: 2,
    impact: 2,
    mitigation: "Input ranges validated; tip to re-measure before acting.",
  },
  {
    id: "privacy",
    risk: "Health data stored without consent (LFPDPPP — Mexican data protection law)",
    likelihood: 2,
    impact: 3,
    mitigation: "No names or IDs stored; only anonymous readings. Add consent before any account feature.",
  },
  {
    id: "trust",
    risk: "Low trust vs. a real doctor at the pharmacy",
    likelihood: 3,
    impact: 1,
    mitigation: "Position as 'decide if you need to go', not a replacement for the doctor.",
  },
  {
    id: "regulatory",
    risk: "Could be considered medical-device software by COFEPRIS if it claims diagnosis",
    likelihood: 1,
    impact: 3,
    mitigation: "Stay educational, no diagnosis claims; review before any commercial launch.",
  },
];

export const GAPS = [
  "No free, no-login tool in Mexico turns home vital signs (not symptoms) into an urgency level.",
  "Tools that save history (OMRON, Apple Health) don't tell you what to do; tools that triage don't save a shared family history.",
  "Existing triage is either a black box (AI) or requires a human on the phone — nothing is explainable and instant.",
];

// Pure helper used by the page and by the unit tests.
export function filterCompetitors(list, { query = "", type = "All" } = {}) {
  const q = query.trim().toLowerCase();
  return list.filter((c) => {
    if (type !== "All" && c.type !== type) return false;
    if (!q) return true;
    return [c.name, c.region, c.price, c.inputs, c.weakness, c.type]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });
}

export function riskLevel({ likelihood, impact }) {
  const s = likelihood * impact;
  if (s >= 6) return "High";
  if (s >= 3) return "Medium";
  return "Low";
}
