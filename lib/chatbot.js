// Vitalis Guide — Week 5 guided assistant.
// PURE logic: no React, no Supabase, no network. Every answer is written by a
// human and reviewed; nothing is generated. Educational guide, not a diagnosis.
import { calculateTriage } from "./triage.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export const EMERGENCY_NUMBER = "911";
export const CRISIS_LINE = "Línea de la Vida: 800 911 2000 (free, 24/7)";

export const VITAL_RANGES = {
  temperature: { min: 30, max: 45, unit: "°C", label: "Temperature" },
  heartRate: { min: 20, max: 250, unit: "bpm", label: "Heart rate" },
  oxygenSaturation: { min: 50, max: 100, unit: "%", label: "Oxygen saturation (SpO₂)" },
  painLevel: { min: 0, max: 10, unit: "/10", label: "Pain level" },
};
const VITAL_ORDER = ["temperature", "heartRate", "oxygenSaturation", "painLevel"];

export const Q1_CHOICES = [
  { value: "self", label: "Me" },
  { value: "other", label: "Someone I care for" },
];
export const Q2_CHOICES = [
  { value: "18-64", label: "18–64" },
  { value: "65+", label: "65 or older" },
  { value: "under18", label: "Under 18" },
];
export const RED_FLAGS = [
  { value: "chest_pain", label: "Chest pain or pressure" },
  { value: "breathing", label: "Severe trouble breathing" },
  { value: "fainting", label: "Fainting, confusion or a seizure" },
  { value: "stroke", label: "Face drooping, arm weakness or slurred speech" },
  { value: "none", label: "None of these" },
];
const INTAKE_STEPS = ["q1", "q2", "q3", "vitals", "checkpoint"];
const RED_FLAG_LABEL = Object.fromEntries(RED_FLAGS.map((f) => [f.value, f.label]));
const WHO_LABEL = { self: "Me", other: "Someone I care for" };
const AGE_LABEL = { "18-64": "18–64", "65+": "65 or older", under18: "Under 18" };

export const SUGGESTED_QUESTIONS = [
  "What does my result mean?",
  "How do I measure oxygen correctly?",
  "What are normal ranges?",
  "Where can I get care?",
];

export const REVIEW_REASON_LABELS = {
  emergency: "Emergency symptoms mentioned",
  self_harm: "Self-harm or suicide mentioned",
  attention_result: "Attention result (score 5–8)",
  negative_feedback: "User rated an answer 👎",
  user_requested_human: "User asked to talk to a person",
  minor: "Possible minor (under 18)",
};

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------
function norm(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // á → a, so Spanish matches with or without accents
    .replace(/[’`]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// Words that negate a symptom when they appear shortly BEFORE it, in the same clause.
const NEGATION = /\b(no|not|without|never|sin|denies|deny|isn't|isnt|doesn't|doesnt|don't|dont|didn't|didnt|hasn't|hasnt|haven't|havent|nunca)\b/;
const CLAUSE_BREAK = /\b(but|pero|however|although|aunque|and now|y ahora)\b|[.;!?]/g;

function isNegated(text, index) {
  let window = text.slice(Math.max(0, index - 30), index);
  // Only look inside the current clause: "no fever but chest pain" is NOT negated.
  let last = -1;
  let m;
  CLAUSE_BREAK.lastIndex = 0;
  while ((m = CLAUSE_BREAK.exec(window))) last = m.index + m[0].length;
  if (last >= 0) window = window.slice(last);
  return NEGATION.test(window);
}

function findPattern(text, patterns, { allowNegation = true } = {}) {
  for (const p of patterns) {
    const re = new RegExp(p.source, "g");
    let m;
    while ((m = re.exec(text))) {
      if (!allowNegation || !isNegated(text, m.index)) return m[0];
      if (m[0].length === 0) re.lastIndex++;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Personal data (redacted BEFORE anything is shown in the transcript or saved)
// ---------------------------------------------------------------------------
const PII_PATTERNS = [
  { type: "CURP", re: /\b[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b/gi },
  { type: "email", re: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g },
  { type: "phone", re: /(?:\+?52[\s-]?)?\b\d{2,3}[\s-]?\d{3,4}[\s-]?\d{4}\b/g },
];

export function redactPII(text) {
  let out = String(text || "");
  const found = [];
  for (const { type, re } of PII_PATTERNS) {
    out = out.replace(re, () => {
      found.push(type);
      return `[${type} removed]`;
    });
  }
  return { text: out, found };
}

// ---------------------------------------------------------------------------
// Guardrails
// ---------------------------------------------------------------------------
const SELF_HARM = [
  /\bkill(ing)? (myself|me)\b/, /\bsuicid/, /\bend (my|it all|my own) ?(life)?\b/, /\bend it all\b/,
  /\b(want|wanna|going) to die\b/, /\bwant to be dead\b/, /\bdon'?t want to (live|be alive)\b/,
  /\b(hurt|harm|cut) myself\b/, /\bself[- ]?harm/, /\bquiero morir/, /\bme quiero morir/,
  /\bquitarme la vida/, /\bmatarme\b/, /\bno quiero vivir/, /\bhacerme dano/,
];

const EMERGENCY = {
  chest_pain: [
    /\bchest (pain|pressure|tightness|hurts?)\b/, /\bpain in (my|his|her|the) chest\b/, /\btight(ness)? (in )?(my |his |her )?chest\b/,
    /\bheart attack\b/, /\bdolor (de|en el) pecho\b/, /\binfarto\b/,
  ],
  breathing: [
    /\b(can'?t|cannot|can not|unable to|struggling to|hard to) breathe\b/, /\b(severe|serious) (shortness of breath|trouble breathing)\b/,
    /\b(trouble|difficulty) breathing\b/, /\bnot breathing\b/, /\bchoking\b/, /\bno (puedo|puede) respirar\b/,
    /\b(me|le) falta (el )?aire\b/,
  ],
  fainting: [
    /\bfainted\b/, /\bpassed out\b/, /\bunconscious\b/, /\bunresponsive\b/, /\bwon'?t wake\b/, /\bnot waking\b/,
    /\bcollapsed\b/, /\bseizure\b/, /\bconvuls/, /\b(is|seems|became|got|very|suddenly) confused\b/, /\bdesmay/,
    /\binconsciente\b/,
  ],
  stroke: [
    /\bstroke\b/, /\bface (is )?droop/, /\bdrooping face\b/, /\bslurred speech\b/, /\b(weak|numb)(ness)? (on|in) one side\b/,
    /\bone side of (the|his|her|my) face\b/, /\bderrame\b/, /\bembolia\b/,
  ],
  bleeding: [/\b(heavy|severe) bleeding\b/, /\bbleeding (a lot|heavily)\b/, /\bwon'?t stop bleeding\b/, /\bsangrado (fuerte|abundante)\b/],
};

const MINOR_WORDS = /\b(baby|babies|infant|newborn|toddler|child|children|kid|kids|teen|teenager|bebe|nino|nina|ninos|hijo de \d)\b/;
const MEDICATION = [
  /\b(dose|doses|dosage|dosis|mg|milligrams?)\b/,
  /\b(ibuprofen|ibuprofeno|paracetamol|acetaminophen|tylenol|aspirin|aspirina|naproxen|antibiotics?|antibiotico|amoxicillin|metamizol|insulin|prednisone)\b/,
  /\b(should|can|could|may) (i|he|she|we) (take|give|have) (a |an |some )?(pill|tablet|medicine|medication|drug|something)/,
  /\bwhat (medicine|medication|pill|drug)s?\b/, /\bwhich (medicine|medication|pill|drug)s?\b/, /\bprescri/,
  /\b(how many|how much) (pills?|tablets?|mg)\b/, /\bque (medicamento|medicina|pastilla)/,
];
const DIAGNOSIS = [
  /\bdo i have (?!a fever|fever|a temperature)/, /\b(does|do) (he|she|they|my \w+) have (?!a fever|fever|a temperature)/, /\bdiagnos/, /\bwhat (disease|illness|condition|infection)\b/,
  /\bwhat'?s wrong with\b/, /\bwhat is wrong with\b/, /\bis (it|this) (covid|cancer|diabetes|dengue|the flu|flu|pneumonia|an infection|a virus|hypertension)\b/,
  /\bque enfermedad\b/, /\bque tengo\b/, /\btengo (covid|cancer|diabetes|dengue)\b/,
];

/**
 * Check one user message. Returns the highest-priority guardrail that fires
 * (or null) plus any personal data found. Priority:
 * self_harm > emergency > minor > medication > diagnosis.
 * (off_topic is decided later, only when no answer matches.)
 */
export function checkGuardrails(rawText) {
  const { found } = redactPII(rawText);
  const text = norm(rawText);
  const result = { id: null, detail: null, pii: found };

  if (findPattern(text, SELF_HARM, { allowNegation: false })) {
    return { ...result, id: "self_harm" };
  }
  for (const [flag, patterns] of Object.entries(EMERGENCY)) {
    const hit = findPattern(text, patterns);
    if (hit) return { ...result, id: "emergency", detail: flag };
  }
  const age = parseAge(text);
  if ((age !== null && age < 18) || /\bunder 18\b|\bmenor de edad\b/.test(text) || (MINOR_WORDS.test(text) && !/\badult\b/.test(text))) {
    return { ...result, id: "minor" };
  }
  if (findPattern(text, MEDICATION, { allowNegation: false })) return { ...result, id: "medication" };
  if (findPattern(text, DIAGNOSIS, { allowNegation: false })) return { ...result, id: "diagnosis" };
  return result;
}

// ---------------------------------------------------------------------------
// Parsers for intake answers
// ---------------------------------------------------------------------------
export function parseAge(text) {
  const t = norm(text);
  if (/^\d{1,3}$/.test(t)) return Number(t);
  const m =
    t.match(/\b(\d{1,3})\s*(years?|yrs?|y\/o|yo|anos|year-old)\b/) ||
    t.match(/\b(?:i'?m|i am|he'?s|she'?s|he is|she is|tiene|tengo|age|aged|edad)\s*(\d{1,3})\b/);
  if (m) {
    const n = Number(m[1] || m[2]);
    return Number.isFinite(n) ? n : null;
  }
  if (/\b\d{1,2}\s*(months?|meses|weeks?|semanas)\b/.test(t)) return 0;
  return null;
}

function parseWho(text) {
  const t = norm(text);
  if (/\b(me|myself|mine|i am|i'm|for me|yo|para mi)\b/.test(t)) return "self";
  if (/\b(dad|father|mom|mother|mum|parent|grand\w*|husband|wife|partner|son|daughter|brother|sister|friend|someone|somebody|him|her|patient|papa|mama|abuel\w*|esposo|esposa|hermano|hermana|amigo|amiga)\b/.test(t)) return "other";
  return null;
}

function parseAgeGroup(text) {
  const t = norm(text);
  if (/\b(under 18|minor|menor)\b/.test(t)) return "under18";
  if (/\b65\s*\+|\b65 or older\b|\bover 65\b|\bolder\b|\bsenior\b|\belderly\b/.test(t)) return "65+";
  if (/\b18\s*[-–]\s*64\b|\badult\b/.test(t)) return "18-64";
  const age = parseAge(t);
  if (age === null) return null;
  if (age < 18) return "under18";
  return age >= 65 ? "65+" : "18-64";
}

function parseRedFlag(text) {
  const t = norm(text);
  if (/^(no|nope|none|nothing|neither|nada|ninguno|ninguna|no ninguno|none of these|none of them|all good|i'?m fine|he'?s fine|she'?s fine)\b/.test(t)) return "none";
  return null;
}

/** Turn "38.5 110 93 6" (or "38,5, 110, 93, 6") into the 4 vitals, in order. */
export function parseVitals(text) {
  const nums = String(text || "").match(/\d+(?:[.,]\d+)?/g);
  if (!nums || nums.length !== 4) return null;
  const values = nums.map((n) => Number(n.replace(",", ".")));
  return Object.fromEntries(VITAL_ORDER.map((k, i) => [k, values[i]]));
}

/** Validate the 4 readings. Returns { ok, values, errors[] } with human-readable errors. */
export function validateVitals(input) {
  const errors = [];
  const values = {};
  for (const key of VITAL_ORDER) {
    const r = VITAL_RANGES[key];
    const raw = input?.[key];
    const n = typeof raw === "number" ? raw : Number(String(raw ?? "").replace(",", ".").trim());
    if (raw === undefined || raw === null || String(raw).trim() === "" || !Number.isFinite(n)) {
      errors.push(`${r.label} is missing.`);
      continue;
    }
    if (n < r.min || n > r.max) {
      errors.push(`${r.label} ${n}${r.unit === "/10" ? "" : " " + r.unit} is not possible — enter a value between ${r.min} and ${r.max}${r.unit === "/10" ? "" : " " + r.unit}.`);
      continue;
    }
    if (key === "painLevel" && !Number.isInteger(n)) {
      errors.push("Pain level must be a whole number from 0 to 10.");
      continue;
    }
    values[key] = n;
  }
  return { ok: errors.length === 0, values: errors.length ? null : values, errors };
}

// ---------------------------------------------------------------------------
// Curated answers (human-written). Response logic for free-text questions.
// ---------------------------------------------------------------------------
export const INTENTS = [
  {
    id: "normal_ranges",
    keywords: ["normal", "range", "ranges", "healthy", "typical", "should be", "good reading"],
    answer:
      "Typical resting values for adults:\n• Temperature: about 36.1–37.2 °C (38 °C or more is a fever).\n• Heart rate: 60–100 beats per minute at rest.\n• Oxygen saturation (SpO₂): 95–100 %.\n• Pain: 0 is none, 10 is the worst imaginable.\nSome people have different normal values because of a known condition — their doctor's targets come first.",
  },
  {
    id: "fever",
    keywords: ["fever", "temperature", "hot", "chills", "thermometer", "calentura", "fiebre"],
    answer:
      "A temperature of 38 °C or more is a fever; 37.3–38 °C is slightly raised. Measure again after 15–20 minutes of rest, without a hot drink or blanket just before. Get checked sooner if the fever lasts more than 2–3 days, goes above 39.5 °C, or comes with a stiff neck, a rash, confusion or trouble breathing (that last group = call 911).",
  },
  {
    id: "oxygen",
    keywords: ["oxygen", "spo2", "saturation", "oximeter", "oximetro", "oxigeno", "sat", "measure oxygen"],
    answer:
      "To get a reliable oxygen reading: sit and rest for 5 minutes, warm the hand, remove nail polish or false nails, keep the hand still at chest level, and wait until the number stops changing (about 30–60 seconds). 95–100 % is typical; 91–94 % deserves a check-up; 90 % or less is a warning sign — seek care, especially with shortness of breath.",
  },
  {
    id: "heart_rate",
    keywords: ["heart rate", "pulse", "bpm", "heartbeat", "beats", "pulso", "frecuencia"],
    answer:
      "Resting heart rate for adults is usually 60–100 beats per minute. Measure after 5 minutes sitting still — not right after walking, coffee or a scare. Above 120 or below 50 at rest is a warning sign. A very fast or irregular pulse with dizziness, chest pain or fainting is an emergency: call 911.",
  },
  {
    id: "pain",
    keywords: ["pain level", "pain scale", "rate pain", "how much pain", "scale", "dolor"],
    answer:
      "The pain level goes from 0 (no pain) to 10 (the worst pain imaginable). 1–3 is mild, 4–6 moderate (it interrupts what you're doing), 7–10 severe. Sudden, severe pain — especially in the chest, head or belly — is a reason to seek care right away.",
  },
  {
    id: "where_care",
    keywords: ["where", "hospital", "clinic", "clinica", "urgencias", "emergency room", "er", "doctor", "medico", "imss", "issste", "call", "go to", "ambulance"],
    answer:
      "Where to go depends on how urgent it is:\n• Emergency (chest pain, can't breathe, fainting, stroke signs): call 911 — free, 24/7.\n• Attention result or getting worse: the nearest urgencias (IMSS, ISSSTE, IMSS-Bienestar or a private hospital).\n• Review result: your family doctor or clinic today, or a pharmacy-attached doctor's office for a quick check.\n• In Mexico City, Locatel (55 5658 1111) can connect you with medical advice by phone.",
  },
  {
    id: "result_meaning",
    keywords: ["result", "mean", "stable", "review", "attention", "status", "light", "urgent", "serious", "bad"],
    answer:
      "Vitalis gives one of three lights:\n• Stable (score 0–1): readings are in the normal range; keep an eye on how the person feels.\n• Review (score 2–4): some readings are out of range — get a medical check-up within the next few hours, sooner if it gets worse.\n• Attention (score 5–8): high risk — seek care now (911 or the nearest urgencias).\nHow the person looks and feels always matters more than the number.",
  },
  {
    id: "score_logic",
    keywords: ["score", "calculate", "calculated", "formula", "points", "how does it work", "how do you decide", "rules", "algorithm"],
    answer:
      "Each of the 4 readings gives 0, 1 or 2 points (0 = normal, 2 = far from normal), for a total from 0 to 8. Example: oxygen 91–94 % = 1 point, 90 % or less = 2 points. It's a simplified early-warning score inspired by NEWS, written as fixed rules — no AI — so the same readings always give the same result.",
  },
  {
    id: "privacy",
    keywords: ["privacy", "private", "data", "store", "stored", "save", "saved", "who sees", "delete", "personal", "datos"],
    answer:
      "This test version saves the conversation anonymously only when you press \"Finish & save\" — with your answers, readings, the result and your rating. It removes CURP, phone numbers and emails before saving, and it does not ask for your name. Please don't type personal identifiers. It's a class project, not a medical record yet.",
  },
  {
    id: "pricing",
    keywords: ["price", "cost", "free", "pay", "plan", "plans", "subscription", "premium", "precio", "cuanto cuesta"],
    answer:
      "The check and this guide are free. Vitalis plans: Free ($0), Plus ($79 MXN/month — history, reminders and sharing with family), and Clinic ($599 MXN/month for small practices). See the Product and Pricing pages for details.",
  },
  {
    id: "about",
    keywords: ["who are you", "what are you", "are you a doctor", "are you human", "are you real", "your name", "ai", "bot", "robot", "vitalis", "chatgpt"],
    answer:
      "I'm the Vitalis Guide — an automated assistant with fixed, human-written answers. I'm not a doctor, a nurse or a person, and I can't diagnose or prescribe. I help you decide how urgent things look and where to go. For an emergency, call 911.",
  },
  {
    id: "blood_pressure",
    keywords: ["blood pressure", "pressure", "presion", "hypertension", "mmhg"],
    answer:
      "Vitalis doesn't score blood pressure yet — it uses temperature, heart rate, oxygen and pain. As a general reference, below 120/80 is normal for adults and 140/90 or more on repeated readings needs a doctor. A reading of 180/120 or higher with chest pain, a bad headache, confusion or weakness is an emergency: call 911.",
  },
  {
    id: "thanks",
    keywords: ["thanks", "thank you", "gracias", "great", "ok thanks", "perfect", "bye"],
    answer: "You're welcome. If things change or you're unsure, check again or ask a health professional. Remember: in an emergency, call 911.",
  },
  {
    id: "greeting",
    keywords: ["hi", "hello", "hey", "hola", "good morning", "good evening", "buenas"],
    answer: "Hi! Ask me about your result, normal ranges, how to measure, or where to get care. Or press Restart for a new check.",
  },
];

const HEALTH_WORDS =
  /\b(vital|vitals|temperature|temp|fever|heart|pulse|oxygen|spo2|saturation|pain|blood|pressure|breath\w*|cough|dizzy|dizziness|nause\w*|vomit\w*|headache|doctor|nurse|hospital|sick|ill|symptom\w*|health|reading\w*|score|triage|measure\w*|thermometer|oximeter|care|medical|salud|dolor|fiebre|tos|mareo)\b/;

/** Pick the curated answer whose keywords best match the question. */
export function matchIntent(rawText) {
  const t = ` ${norm(rawText).replace(/[^\w\s'+]/g, " ").replace(/\s+/g, " ")} `;
  let best = null;
  for (const intent of INTENTS) {
    let score = 0;
    for (const kw of intent.keywords) {
      if (t.includes(` ${kw} `)) score += kw.includes(" ") ? 2 : 1; // multi-word keywords are stronger
    }
    if (score > 0 && (!best || score > best.score)) best = { ...intent, score };
  }
  return best;
}

export function isHealthRelated(rawText) {
  return HEALTH_WORDS.test(norm(rawText));
}

// ---------------------------------------------------------------------------
// Result explanation (same rules as /core)
// ---------------------------------------------------------------------------
export function explainReadings(v) {
  const lines = [];
  if (v.temperature > 38.0) lines.push(`Temperature ${v.temperature} °C — fever.`);
  else if (v.temperature >= 37.3) lines.push(`Temperature ${v.temperature} °C — slightly raised.`);
  else if (v.temperature < 35.0) lines.push(`Temperature ${v.temperature} °C — very low (possible hypothermia).`);
  else if (v.temperature <= 36.0) lines.push(`Temperature ${v.temperature} °C — a bit low.`);

  if (v.heartRate > 120) lines.push(`Heart rate ${v.heartRate} bpm — very fast at rest.`);
  else if (v.heartRate >= 101) lines.push(`Heart rate ${v.heartRate} bpm — fast at rest.`);
  else if (v.heartRate < 50) lines.push(`Heart rate ${v.heartRate} bpm — very slow.`);
  else if (v.heartRate <= 59) lines.push(`Heart rate ${v.heartRate} bpm — a bit slow.`);

  if (v.oxygenSaturation <= 90) lines.push(`Oxygen ${v.oxygenSaturation} % — low.`);
  else if (v.oxygenSaturation <= 94) lines.push(`Oxygen ${v.oxygenSaturation} % — slightly low.`);

  if (v.painLevel >= 7) lines.push(`Pain ${v.painLevel}/10 — severe.`);
  else if (v.painLevel >= 4) lines.push(`Pain ${v.painLevel}/10 — moderate.`);

  if (lines.length === 0) lines.push("All 4 readings are in the normal range.");
  return lines;
}

// ---------------------------------------------------------------------------
// Guardrail replies
// ---------------------------------------------------------------------------
const GUARDRAIL_TEXT = {
  self_harm:
    `I'm really sorry you're feeling this way, and I'm glad you said it. You deserve support from a person right now.\n• In Mexico you can call ${CRISIS_LINE} to talk with someone.\n• If you might act on these thoughts or are in danger, call 911 now.\n• If you can, tell someone you trust how you're feeling, or ask them to stay with you.\nI'm an automated guide, so I can't give you the support a person can.`,
  emergency_base:
    "This could be an emergency. Call 911 now (free, 24/7) or go to the nearest urgencias — don't wait to take readings.\nWhile you wait: stay with the person, keep them sitting or lying down, unlock the door, and don't give food or drink.",
  minor:
    "Vitalis is designed for adults (18+). Children's normal readings are different, so these rules could give a wrong answer. Please contact the child's pediatrician or a health professional — and for an emergency, call 911.",
  medication:
    "I can't recommend medicines, doses or combinations — that depends on the person's age, weight, other conditions and other medicines. Please ask a pharmacist or a doctor, and follow the label or the prescription. If symptoms are severe, call 911.",
  diagnosis:
    "I can't diagnose illnesses — only a health professional who examines the person can do that. What I can do is look at the 4 readings and tell you how urgent it looks, and help you decide where to go.",
  off_topic:
    "I can only help with vital signs and when to seek care. Try: \"What does my result mean?\", \"What are normal ranges?\" or \"Where can I get care?\"",
  unknown_health:
    "I don't have a reliable, reviewed answer for that, and I'd rather not guess about health. Please ask a doctor or pharmacist. I can explain your result, normal ranges, how to measure, or where to get care.",
};

const EMERGENCY_DETAIL = {
  chest_pain: "You mentioned chest pain or pressure.",
  breathing: "You mentioned severe trouble breathing.",
  fainting: "You mentioned fainting, confusion or a seizure.",
  stroke: "You mentioned possible stroke signs (face, arm or speech).",
  bleeding: "You mentioned heavy bleeding.",
};

// ---------------------------------------------------------------------------
// Conversation state machine
// ---------------------------------------------------------------------------
export function initialChatState() {
  return {
    step: "start", // start → q1 → q2 → q3 → vitals → checkpoint → open
    n: 0,
    intake: { whoFor: null, ageGroup: null, redFlag: null },
    vitals: null,
    result: null,
    emergency: false,
    guardrails: [],
    reasons: [],
  };
}

function addUnique(list, item) {
  return list.includes(item) ? list : [...list, item];
}

/**
 * Pure reducer: (state, event) → { state, messages }.
 * `messages` already contains the (redacted) user message and the bot replies,
 * in order, so the UI only appends them.
 */
export function reduceChat(prev, event) {
  let s = { ...prev, intake: { ...prev.intake }, guardrails: [...prev.guardrails], reasons: [...prev.reasons] };
  const out = [];
  const bot = (msg) => {
    s.n += 1;
    out.push({ id: `b${s.n}`, role: "bot", rateable: false, ...msg });
  };
  const user = (text) => {
    s.n += 1;
    out.push({ id: `u${s.n}`, role: "user", text });
  };
  const flag = (g) => (s.guardrails = addUnique(s.guardrails, g));
  const reason = (r) => (s.reasons = addUnique(s.reasons, r));

  const askQ1 = () =>
    bot({ kind: "question", text: "Question 1 of 3 — Who is this check for?", choices: Q1_CHOICES });
  const askQ2 = () =>
    bot({
      kind: "question",
      text: `Question 2 of 3 — ${s.intake.whoFor === "other" ? "How old are they?" : "How old are you?"}`,
      choices: Q2_CHOICES,
    });
  const askQ3 = () =>
    bot({
      kind: "question",
      text: `Question 3 of 3 — Is any of this happening ${s.intake.whoFor === "other" ? "to them" : "to you"} right now?`,
      choices: RED_FLAGS,
    });
  const askVitals = () =>
    bot({
      kind: "question",
      form: "vitals",
      text: "Thanks. Now the 4 readings. Use the form, or type them in this order: temperature, heart rate, oxygen, pain — e.g. \"37.5 105 93 5\".",
      choices: [{ value: "skip_vitals", label: "I don't have readings" }],
    });
  // Suggested questions are shown as quick chips by the UI whenever step === "open".
  const openPrompt = (text) => bot({ kind: "info", text });

  const emergencyReply = (detail) => {
    s.emergency = true;
    flag("emergency");
    reason("emergency");
    s.step = "open";
    bot({
      kind: "emergency",
      rateable: true,
      intent: "guardrail_emergency",
      text: `${EMERGENCY_DETAIL[detail] || ""}\n${GUARDRAIL_TEXT.emergency_base}`.trim(),
    });
  };
  const minorReply = () => {
    flag("minor");
    reason("minor");
    s.intake.ageGroup = "under18";
    s.step = "open";
    bot({ kind: "guardrail", rateable: true, intent: "guardrail_minor", text: GUARDRAIL_TEXT.minor });
  };

  const showCheckpoint = () => {
    s.step = "checkpoint";
    const v = s.vitals;
    bot({
      kind: "checkpoint",
      text: "Before I give a result, please check that I understood correctly:",
      summary: [
        `For: ${WHO_LABEL[s.intake.whoFor] || "—"}`,
        `Age group: ${AGE_LABEL[s.intake.ageGroup] || "—"}`,
        `Red-flag symptoms: ${RED_FLAG_LABEL[s.intake.redFlag] || "—"}`,
        `Temperature ${v.temperature} °C · Heart rate ${v.heartRate} bpm · Oxygen ${v.oxygenSaturation} % · Pain ${v.painLevel}/10`,
      ],
      choices: [
        { value: "confirm", label: "Yes, that's right" },
        { value: "edit", label: "No, start over" },
      ],
    });
  };

  const showResult = () => {
    const r = calculateTriage(s.vitals);
    s.result = r;
    s.step = "open";
    const lines = [`${r.status} — score ${r.score} of 8.`, r.recommendation, "", ...explainReadings(s.vitals).map((l) => `• ${l}`)];
    if (r.status === "Attention") {
      reason("attention_result");
      lines.push("", "Call 911 or go to the nearest urgencias now.");
    }
    if (r.status === "Stable") {
      // Added after external user test U3: a tester read "Stable" as "I don't need a doctor for minor
      // symptoms anymore". Stable only describes these 4 readings, right now.
      lines.push(
        "",
        "Stable only describes these 4 readings right now — it doesn't replace a doctor. If a symptom lasts more than 2–3 days, keeps coming back, or worries you, book a check-up."
      );
    }
    if (s.intake.ageGroup === "65+") {
      lines.push("", "Age 65+: older adults can be seriously ill with only small changes in their readings — if in doubt, get checked.");
    }
    if (s.intake.whoFor === "other") {
      lines.push("", "If they get worse, become confused or very drowsy, call 911 — don't wait for new readings.");
    }
    lines.push("", "Educational guide, not a diagnosis.");
    bot({ kind: "result", rateable: true, intent: "triage_result", result: r, text: lines.join("\n") });
    openPrompt("You can ask me a question about this result, or press Restart for a new check.");
  };

  const answerFreeText = (text) => {
    const intent = matchIntent(text);
    if (intent) {
      bot({ kind: "answer", rateable: true, intent: intent.id, text: intent.answer });
      return;
    }
    if (isHealthRelated(text)) {
      bot({ kind: "guardrail", rateable: true, intent: "fallback_unknown", text: GUARDRAIL_TEXT.unknown_health });
    } else {
      flag("off_topic");
      bot({ kind: "guardrail", rateable: true, intent: "guardrail_off_topic", text: GUARDRAIL_TEXT.off_topic });
    }
  };

  // Runs the safety checks on any typed text. Returns the guardrail id if the message was fully handled.
  const guard = (rawText) => {
    const g = checkGuardrails(rawText);
    if (g.pii.length) {
      flag("pii");
      bot({
        kind: "guardrail",
        rateable: false,
        intent: "guardrail_pii",
        text: `For your privacy I removed the ${[...new Set(g.pii)].join(" and ")} you typed. Please don't share personal identifiers here.`,
      });
    }
    if (g.id === "self_harm") {
      flag("self_harm");
      reason("self_harm");
      bot({ kind: "emergency", rateable: true, intent: "guardrail_self_harm", text: GUARDRAIL_TEXT.self_harm });
      return g.id;
    }
    if (g.id === "emergency") {
      emergencyReply(g.detail);
      return g.id;
    }
    if (g.id === "minor") {
      minorReply();
      return g.id;
    }
    if (g.id === "medication" || g.id === "diagnosis") {
      flag(g.id);
      bot({ kind: "guardrail", rateable: true, intent: `guardrail_${g.id}`, text: GUARDRAIL_TEXT[g.id] });
      return g.id;
    }
    return null;
  };

  const skipVitals = () => {
    s.step = "open";
    bot({
      kind: "answer",
      rateable: true,
      intent: "no_readings",
      text:
        "No problem — without readings I can't give a score. If you have a thermometer or an oximeter, measure after 5 minutes of rest and press Restart.\n" +
        "If anything feels severe or is getting worse, don't wait for numbers: call 911.",
    });
    openPrompt("You can also ask me a question.");
  };

  const reask = () => {
    if (s.step === "q1") askQ1();
    else if (s.step === "q2") askQ2();
    else if (s.step === "q3") askQ3();
    else if (s.step === "vitals") askVitals();
    else if (s.step === "checkpoint") showCheckpoint();
  };

  switch (event.type) {
    case "start": {
      s = { ...initialChatState(), n: s.n };
      bot({
        kind: "info",
        text: "Hi, I'm the Vitalis Guide — an automated assistant, not a doctor. I'll ask 3 quick questions, then 4 readings, and tell you how urgent things look.\nIf someone is in danger right now, call 911. Please don't type names, CURP or phone numbers.",
      });
      s.step = "q1";
      askQ1();
      break;
    }

    case "human": {
      user("Talk to a person");
      reason("user_requested_human");
      bot({
        kind: "handoff",
        rateable: true,
        intent: "human_handoff",
        text: "I'm an automated guide, so I can't connect you to a person live. I've flagged this conversation for review by the Vitalis team (not in real time). Right now you can:\n• Emergency: call 911.\n• Medical advice by phone (Mexico City): Locatel 55 5658 1111.\n• Your family doctor, clinic or a pharmacist.",
      });
      if (INTAKE_STEPS.includes(s.step)) reask(); // keep the check going if they want to continue
      break;
    }

    case "choice": {
      const { value, label } = event;
      if (value.startsWith("ask:")) return reduceChat(prev, { type: "text", text: value.slice(4) });
      if (value === "skip_vitals" && s.step === "vitals") {
        user(label);
        skipVitals();
        break;
      }
      if (s.step === "q1" && Q1_CHOICES.some((c) => c.value === value)) {
        user(label);
        s.intake.whoFor = value;
        s.step = "q2";
        askQ2();
      } else if (s.step === "q2" && Q2_CHOICES.some((c) => c.value === value)) {
        user(label);
        if (value === "under18") {
          minorReply();
          break;
        }
        s.intake.ageGroup = value;
        s.step = "q3";
        askQ3();
      } else if (s.step === "q3" && RED_FLAGS.some((c) => c.value === value)) {
        user(label);
        s.intake.redFlag = value;
        if (value !== "none") {
          emergencyReply(value);
          break;
        }
        s.step = "vitals";
        askVitals();
      } else if (s.step === "checkpoint" && value === "confirm") {
        user(label);
        showResult();
      } else if (s.step === "checkpoint" && value === "edit") {
        user(label);
        s.intake = { whoFor: null, ageGroup: null, redFlag: null };
        s.vitals = null;
        s.step = "q1";
        askQ1();
      }
      // A click on an old, already-answered button is ignored (no message).
      break;
    }

    case "vitals": {
      if (s.step !== "vitals") break;
      const v = validateVitals(event.values);
      user(
        VITAL_ORDER.map((k) => `${String(event.values?.[k] ?? "").trim() || "—"}`).join(" · ")
      );
      if (!v.ok) {
        bot({ kind: "guardrail", intent: "invalid_vitals", text: `I can't use these readings:\n• ${v.errors.join("\n• ")}\nPlease check and try again.` });
        break;
      }
      s.vitals = v.values;
      showCheckpoint();
      break;
    }

    case "text": {
      const raw = String(event.text || "").trim();
      if (!raw) break;
      const { text: clean, found: pii } = redactPII(raw);
      user(clean);
      const handled = guard(raw);
      if (handled) {
        // Fix after browser testing: a blocked question during the intake used to leave the user
        // with no buttons. Ask the current question again so the flow can continue.
        if ((handled === "medication" || handled === "diagnosis") && INTAKE_STEPS.includes(s.step)) reask();
        break;
      }

      // Fix after external user test U2: during the 3 questions, a message that was only personal data
      // got the privacy note AND "Sorry, I didn't catch that", and a real question ("What's your name?")
      // was ignored. Now: personal data → privacy note + the question again; a question we have an
      // answer for → answer it, then the question again; anything else → a clearer hint.
      const notUnderstood = (hint) => {
        const intent = matchIntent(clean);
        if (pii.length && !intent && !isHealthRelated(clean)) {
          reask();
        } else if (intent && !["greeting", "thanks"].includes(intent.id)) {
          bot({ kind: "answer", rateable: true, intent: intent.id, text: intent.answer });
          bot({ kind: "info", text: "Now, back to the check:" });
          reask();
        } else {
          bot({ kind: "info", text: hint });
          reask();
        }
      };

      if (s.step === "q1") {
        const who = parseWho(clean);
        if (who) {
          s.intake.whoFor = who;
          s.step = "q2";
          askQ2();
        } else {
          notUnderstood("I didn't catch that. Tap one of the options below, or type who it's for — like \"me\" or \"my dad\".");
        }
      } else if (s.step === "q2") {
        const group = parseAgeGroup(clean);
        if (group === "under18") minorReply();
        else if (group) {
          s.intake.ageGroup = group;
          s.step = "q3";
          askQ3();
        } else {
          notUnderstood("I didn't catch the age. Tap an option below, or type a number like 67.");
        }
      } else if (s.step === "q3") {
        if (parseRedFlag(clean) === "none") {
          s.intake.redFlag = "none";
          s.step = "vitals";
          askVitals();
        } else {
          notUnderstood("I didn't catch that. Please tap one of the options below — or \"None of these\" if everything is OK.");
        }
      } else if (s.step === "vitals") {
        const parsed = parseVitals(clean);
        if (/\b(skip|don'?t have|no readings|no tengo)\b/.test(norm(clean))) {
          skipVitals();
          break;
        }
        if (!parsed) {
          bot({ kind: "info", text: "I need exactly 4 numbers in this order: temperature, heart rate, oxygen, pain — e.g. \"37.5 105 93 5\". Or use the form." });
          askVitals();
          break;
        }
        const v = validateVitals(parsed);
        if (!v.ok) {
          bot({ kind: "guardrail", intent: "invalid_vitals", text: `I can't use these readings:\n• ${v.errors.join("\n• ")}\nPlease check and try again.` });
          break;
        }
        s.vitals = v.values;
        showCheckpoint();
      } else if (s.step === "checkpoint") {
        const t = norm(clean);
        if (/^(yes|yeah|yep|correct|right|confirm|si|ok)\b/.test(t)) showResult();
        else if (/^(no|nope|wrong|edit|start over)\b/.test(t)) {
          s.intake = { whoFor: null, ageGroup: null, redFlag: null };
          s.vitals = null;
          s.step = "q1";
          askQ1();
        } else {
          answerFreeText(clean);
          reask();
        }
      } else {
        // open Q&A (after a result, after an emergency, or after skipping)
        if (/\b(restart|start over|new check)\b/.test(norm(clean))) {
          s.step = "q1";
          s.intake = { whoFor: null, ageGroup: null, redFlag: null };
          s.vitals = null;
          s.result = null;
          askQ1();
        } else if (pii.length && !matchIntent(clean) && !isHealthRelated(clean)) {
          // Fix after browser testing: a message that was only personal data got the privacy note
          // AND an "off-topic" reply. The privacy note is enough.
        } else answerFreeText(clean);
      }
      break;
    }

    case "rate": {
      if (event.rating === -1) reason("negative_feedback");
      break;
    }

    default:
      break;
  }

  return { state: s, messages: out };
}

// ---------------------------------------------------------------------------
// Rows for Supabase (built here so they can be tested without a network)
// ---------------------------------------------------------------------------
export function buildFeedbackRow({ sessionId, message, rating }) {
  if (![1, -1].includes(rating)) throw new Error("rating must be 1 or -1");
  return {
    session_id: sessionId,
    message_id: message.id,
    intent: message.intent || message.kind || "unknown",
    rating,
    bot_text: redactPII(message.text).text.slice(0, 1000),
  };
}

export function buildSessionSummary({ sessionId, state, messages, testerLabel, rating, comment }) {
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) throw new Error("Choose a rating from 1 to 5 stars.");
  return {
    session_id: sessionId,
    tester_label: redactPII(String(testerLabel || "").trim()).text.slice(0, 40) || null,
    who_for: state.intake.whoFor,
    age_group: state.intake.ageGroup,
    red_flag: state.intake.redFlag,
    vitals: state.vitals,
    triage_status: state.result?.status ?? null,
    triage_score: state.result?.score ?? null,
    guardrails: state.guardrails,
    needs_review: state.reasons.length > 0,
    review_reasons: state.reasons,
    overall_rating: r,
    tester_comment: redactPII(String(comment || "").trim()).text.slice(0, 500) || null,
    message_count: messages.length,
    transcript: messages.map((m) => ({ role: m.role, kind: m.kind || null, text: redactPII(m.text).text })),
  };
}
