// Week 4 — Marketing Engine + Content System.
// All marketing content lives here, versioned in Git and reviewed by a human.
// Pure data + pure helpers only (no React, no Supabase) so it can be unit-tested.
//
// Health-content rule for every asset: we describe what Vitalis does and what
// the numbers mean inside Vitalis. We never promise a diagnosis and always
// point to a doctor or emergency line when something looks serious.

export const BRAND = {
  name: "Vitalis",
  tagline: "Know when to act, in time.",
  promise:
    "Four readings, one clear light — so families in Mexico know whether to wait, book a check-up or seek care now.",
  colors: [
    { name: "Vitalis Emerald", hex: "#047857", use: "Primary actions, links, logo dot" },
    { name: "Ink", hex: "#111827", use: "Headlines and body text" },
    { name: "Paper", hex: "#F7F5F2", use: "Page background — warm, not clinical white" },
    { name: "Stable", hex: "#16A34A", use: "Triage status only" },
    { name: "Review", hex: "#F59E0B", use: "Triage status only" },
    { name: "Attention", hex: "#DC2626", use: "Triage status only" },
  ],
  colorRule:
    "Green, amber and red are reserved for the triage light. Never use them as decoration, so the light always means something.",
  type: [
    { level: "Display", spec: "System sans, 36–48 px, bold, tight leading" },
    { level: "Heading", spec: "System sans, 18–24 px, semibold" },
    { level: "Body", spec: "System sans, 14–16 px, regular, grey-600 for secondary text" },
    { level: "Numbers", spec: "Monospace for readings and results (37.5 °C, 105 bpm)" },
  ],
  voiceDo: [
    "Be calm and concrete: say what the number means and what to do next.",
    "Talk to the caregiver as a capable adult (\"you\"), in plain words.",
    "Always add the safety line: Vitalis is not a diagnosis; in an emergency call 911.",
  ],
  voiceDont: [
    "No fear marketing (\"this could kill your parent\").",
    "No accuracy claims we can't prove (\"99% accurate\", \"AI doctor\").",
    "No medical jargon without a one-line explanation.",
  ],
};

export const PERSONA = {
  name: "Daniela Ruiz",
  age: 38,
  city: "Mexico City (Coyoacán)",
  role: "Accountant, full time · main caregiver for her father, 67",
  situation:
    "Her father has a home blood-pressure monitor and a pulse oximeter. When a reading looks high at night she texts her siblings, searches Google and ends up guessing whether to go to urgencias.",
  goals: [
    "Know quickly if a reading is urgent or can wait until morning.",
    "Keep one history of her father's readings to show the doctor.",
    "Share updates with her siblings without a long WhatsApp thread.",
  ],
  frustrations: [
    "Symptom checkers ask 20 questions and end in a list of diseases.",
    "Locatel works but is phone-only and nothing is saved.",
    "Paper notes get lost; the doctor asks for history she doesn't have.",
  ],
  channels: ["WhatsApp (family group)", "Facebook caregiver groups", "Instagram", "TikTok / Reels"],
  quote: "I don't need a diagnosis. I need to know if I should get in the car.",
};

// Landing page copy. Hero A/B variants are also used by the live A/B tests.
export const LANDING_COPY = [
  {
    id: "L1",
    title: "Hero headline — variant A (control)",
    channel: "Landing page",
    body: "Understand your vital signs and know when to seek care",
  },
  {
    id: "L2",
    title: "Hero headline — variant B (problem-led)",
    channel: "Landing page",
    body: "A worrying reading at home? Know in 30 seconds if it's urgent.",
  },
  {
    id: "L3",
    title: "Hero subheadline",
    channel: "Landing page",
    body:
      "Enter temperature, heart rate, oxygen and pain. Vitalis turns them into one clear light — Stable, Review or Attention — with what to do next. Free, no account needed.",
  },
  {
    id: "L4",
    title: "CTA button — variants A and B",
    channel: "Landing page",
    body: "A: Start the check\nB: Check my vitals — free",
  },
  {
    id: "L5",
    title: "Problem section",
    channel: "Landing page",
    body:
      "Most worrying readings happen at home, at night, with no doctor nearby. 40.5% of Mexican adults with hypertension don't know they have it, and families are left guessing whether to wait or go to urgencias.",
  },
  {
    id: "L6",
    title: "How it works section",
    channel: "Landing page",
    body:
      "1. Enter 4 readings you can take at home.\n2. See your light: Stable, Review or Attention, with a clear next step.\n3. Save the result and show your history to the doctor.",
  },
  {
    id: "L7",
    title: "Trust section",
    channel: "Landing page",
    body:
      "No black box. Vitalis uses a fixed, published rule set inspired by hospital early-warning scores — you can see exactly why you got each light. It is an educational tool, not a diagnosis. In an emergency, call 911.",
  },
  {
    id: "L8",
    title: "Final CTA band",
    channel: "Landing page",
    body: "Know when to act, in time. Run your first check now — it takes about 30 seconds.",
  },
];

export const FAQ = [
  {
    q: "Is this a diagnosis?",
    a: "No. Vitalis tells you how urgent your readings look using fixed rules, so you can decide on the next step. Only a health professional can diagnose. In an emergency call 911.",
  },
  {
    q: "Do I need an account?",
    a: "No. The check is free and works without signing up. Saving a family history is part of the Plus plan.",
  },
  {
    q: "How is the light calculated?",
    a: "Each reading adds 0, 1 or 2 points depending on how far it is from the normal range. 0–1 points is Stable, 2–4 is Review and 5–8 is Attention. The full rules are shown on the triage page.",
  },
  {
    q: "What devices do I need?",
    a: "A thermometer and a pulse oximeter (it shows heart rate and oxygen). Pain is a 0–10 number you choose.",
  },
];

export const CHANNELS = ["Instagram", "TikTok", "Facebook", "X", "LinkedIn", "WhatsApp"];
export const PILLARS = ["Educate", "Problem", "Product", "Trust", "Community"];
export const CHANNEL_LIMITS = { X: 280 };

export const SOCIAL_POSTS = [
  {
    id: "P1",
    channel: "Instagram",
    pillar: "Educate",
    format: "Carousel (5 slides)",
    title: "The 4 numbers that tell you if it's urgent",
    body:
      "Slide 1: The 4 numbers that tell you if a reading at home is urgent 👇\nSlide 2: 🌡️ Temperature — normal is about 36.1–37.2 °C.\nSlide 3: ❤️ Heart rate — at rest, 60–100 beats per minute.\nSlide 4: 🫁 Oxygen (SpO₂) — 95% or more is the usual range.\nSlide 5: Put all 4 into Vitalis and get one clear light: Stable, Review or Attention. Link in bio.",
    hashtags: "#caregivers #vitalsigns #healthtips #mexico",
  },
  {
    id: "P2",
    channel: "TikTok",
    pillar: "Problem",
    format: "15 s video caption",
    title: "2 a.m. and the oximeter says 92%",
    body:
      "2 a.m. Your dad's oximeter says 92%. Do you wake everyone up and drive to urgencias… or wait? 😰 That moment is why we built Vitalis. 4 readings → 1 clear answer. Not a diagnosis, just clarity when you need it.",
    hashtags: "#caregiver #momentosdecuidador #health #fyp",
  },
  {
    id: "P3",
    channel: "Facebook",
    pillar: "Problem",
    format: "Text + image",
    title: "40.5% don't know",
    body:
      "40.5% of Mexican adults with hypertension don't know they have it (Ensanut 2021–2024). For many families the first warning is a reading at home that nobody knows how to interpret. If you look after a parent, Vitalis helps you turn those readings into a clear next step — free, in 30 seconds.",
    hashtags: "#salud #cuidadores #hipertension",
  },
  {
    id: "P4",
    channel: "X",
    pillar: "Product",
    format: "Post",
    title: "Launch post",
    body:
      "Meet Vitalis: enter temperature, heart rate, oxygen and pain → get Stable, Review or Attention plus what to do next. Free, no account, rules you can read. Built for families caring for someone at home in Mexico. Not a diagnosis.",
    hashtags: "#healthtech #Mexico",
  },
  {
    id: "P5",
    channel: "LinkedIn",
    pillar: "Trust",
    format: "Founder post",
    title: "Why we chose rules over AI",
    body:
      "When we started Vitalis, the obvious move was \"add AI\". We didn't. Babylon Health reached a USD 4.2B valuation and then collapsed in 2023, partly because its AI triage claims couldn't be proven. For a health tool, trust beats magic. Vitalis uses a fixed score inspired by hospital early-warning systems: every point is explainable. Simple, honest, testable.",
    hashtags: "#healthtech #productdesign #startups",
  },
  {
    id: "P6",
    channel: "WhatsApp",
    pillar: "Product",
    format: "Status / broadcast",
    title: "Share with the family group",
    body:
      "Family 👋 If anyone measures pressure, pulse or oxygen at home, try this free check: you enter 4 readings and it tells you if it's Stable, needs Review, or needs Attention. Takes 30 seconds 👉 expediente-me-wine.vercel.app",
    hashtags: "",
  },
  {
    id: "P7",
    channel: "Instagram",
    pillar: "Trust",
    format: "Single image",
    title: "No black box",
    body:
      "No black box. Each reading adds 0, 1 or 2 points. 0–1 = Stable 🟢 · 2–4 = Review 🟡 · 5–8 = Attention 🔴. You always see why you got your light. Vitalis is educational, not a diagnosis — in an emergency call 911.",
    hashtags: "#transparency #healthliteracy #caregivers",
  },
  {
    id: "P8",
    channel: "TikTok",
    pillar: "Educate",
    format: "30 s explainer caption",
    title: "What your oximeter is really telling you",
    body:
      "Your pulse oximeter shows TWO numbers: SpO₂ (oxygen, %) and PR (pulse, bpm). Most people only look at one. In Vitalis, oxygen of 91–94% adds 1 point and 90% or less adds 2. Always follow your doctor's advice for your own targets.",
    hashtags: "#oximeter #healthtok #learnontiktok",
  },
  {
    id: "P9",
    channel: "Facebook",
    pillar: "Community",
    format: "Question post",
    title: "What do you do first?",
    body:
      "Caregivers, a question for you 💬 When a reading at home looks off, what do you do first? A) Call a doctor or Locatel B) Search Google C) Ask the family group D) Wait and measure again. Tell us in the comments — your answers shape what we build next.",
    hashtags: "#cuidadores #comunidad",
  },
  {
    id: "P10",
    channel: "X",
    pillar: "Educate",
    format: "Post",
    title: "Fever + fast pulse",
    body:
      "A fever on its own is common. A fever PLUS a fast pulse PLUS low oxygen is a different story. That's why Vitalis looks at 4 readings together instead of one. Combined signals → one clear light.",
    hashtags: "#health #caregivers",
  },
];

export const VIDEO_SCRIPTS = [
  {
    id: "S1",
    title: "The 2 a.m. decision",
    channel: "TikTok / Reels",
    length: "35 s",
    hook: "It's 2 a.m. and the number on the screen looks wrong.",
    scenes: [
      { time: "0–3 s", visual: "Dark kitchen, phone light on a hand holding an oximeter.", voice: "It's 2 a.m. and the number on the screen looks wrong.", text: "2:07 a.m." },
      { time: "3–10 s", visual: "Daniela typing in a family WhatsApp group, no replies.", voice: "Do you wake everyone up? Drive to urgencias? Or wait until morning?", text: "Wait… or go?" },
      { time: "10–22 s", visual: "Screen recording: entering 4 readings in Vitalis, light turns amber.", voice: "Vitalis takes four readings and gives you one clear light — plus what to do next.", text: "4 readings → 1 answer" },
      { time: "22–30 s", visual: "Daniela calmer, saving the result, sharing it with her sister.", voice: "Save it, share it, and show the doctor the history tomorrow.", text: "Saved ✓" },
      { time: "30–35 s", visual: "Logo on Paper background.", voice: "Vitalis. Know when to act, in time.", text: "Not a diagnosis · Emergency: 911" },
    ],
  },
  {
    id: "S2",
    title: "4 numbers in 40 seconds",
    channel: "Instagram Reels / YouTube Shorts",
    length: "40 s",
    hook: "Four numbers you can measure at home — and what they mean.",
    scenes: [
      { time: "0–4 s", visual: "Thermometer, oximeter and a 0–10 pain card on a table.", voice: "Four numbers you can measure at home — and what they mean.", text: "The 4 numbers" },
      { time: "4–12 s", visual: "Thermometer close-up.", voice: "Temperature: around 36 to 37 degrees is normal. Above 38 counts more.", text: "🌡️ 36.1–37.2 °C" },
      { time: "12–22 s", visual: "Oximeter close-up, pointing at both numbers.", voice: "Your oximeter shows two: heart rate, usually 60 to 100, and oxygen, usually 95% or more.", text: "❤️ 60–100 bpm · 🫁 ≥95%" },
      { time: "22–30 s", visual: "Hand choosing 6 on the pain card.", voice: "And pain, from 0 to 10 — only you can say it.", text: "Pain 0–10" },
      { time: "30–40 s", visual: "Vitalis result card animating Stable → Review → Attention.", voice: "Put them together in Vitalis and get one clear light. Link in bio.", text: "Try it free" },
    ],
  },
  {
    id: "S3",
    title: "Vitalis in 30 seconds (product demo)",
    channel: "All channels",
    length: "30 s",
    hook: "Here's how Vitalis works, start to finish.",
    scenes: [
      { time: "0–4 s", visual: "Homepage on a phone.", voice: "Here's how Vitalis works, start to finish.", text: "Vitalis demo" },
      { time: "4–14 s", visual: "Typing 37.5, 105, 93, 5.", voice: "Type temperature, heart rate, oxygen and pain.", text: "37.5 · 105 · 93 · 5" },
      { time: "14–22 s", visual: "Amber 'Review' card with score 4/8 and the recommendation.", voice: "You get your light and a clear next step. This one says: book a check-up within a few hours.", text: "Review · 4/8" },
      { time: "22–30 s", visual: "Saving the result; dashboard list updates.", voice: "Save it to your history. Free, no account needed.", text: "Know when to act, in time." },
    ],
  },
];

// 14-day campaign starting Monday 26 Oct 2026. Every day references an asset id.
export const CAMPAIGN_START = "2026-10-26";
export const CALENDAR = [
  { day: 1, assetId: "P4", channel: "X", goal: "Launch announcement", metric: "Link clicks" },
  { day: 2, assetId: "P1", channel: "Instagram", goal: "Educate on the 4 numbers", metric: "Saves" },
  { day: 3, assetId: "S1", channel: "TikTok", goal: "Emotional hook for caregivers", metric: "Views + profile visits" },
  { day: 4, assetId: "P3", channel: "Facebook", goal: "Prove the problem with data", metric: "Shares" },
  { day: 5, assetId: "P6", channel: "WhatsApp", goal: "Word of mouth in family groups", metric: "Homepage visits" },
  { day: 6, assetId: "P9", channel: "Facebook", goal: "Listen to caregivers", metric: "Comments" },
  { day: 7, assetId: "P7", channel: "Instagram", goal: "Build trust (no black box)", metric: "Saves" },
  { day: 8, assetId: "P5", channel: "LinkedIn", goal: "Founder credibility", metric: "Reactions" },
  { day: 9, assetId: "S2", channel: "Instagram", goal: "Educate in video", metric: "Watch time" },
  { day: 10, assetId: "P2", channel: "TikTok", goal: "Relatable night-time problem", metric: "Comments" },
  { day: 11, assetId: "P10", channel: "X", goal: "Explain combined signals", metric: "Link clicks" },
  { day: 12, assetId: "P8", channel: "TikTok", goal: "Oximeter literacy", metric: "Shares" },
  { day: 13, assetId: "S3", channel: "Instagram", goal: "Show the product working", metric: "Homepage visits" },
  { day: 14, assetId: "S3", channel: "Facebook", goal: "Re-share demo + announce A/B winner headline", metric: "Check started (CTA clicks)" },
];

export const AB_TESTS = [
  {
    id: "hero_headline",
    name: "A/B test 1 · Hero headline",
    hypothesis:
      "A problem-led headline (B) that names the moment of worry will get more visitors to start the check than the descriptive control (A).",
    metric: "Click-through to /core (unique clickers ÷ unique viewers)",
    variants: {
      A: "Understand your vital signs and know when to seek care",
      B: "A worrying reading at home? Know in 30 seconds if it's urgent.",
    },
  },
  {
    id: "cta_text",
    name: "A/B test 2 · CTA button text",
    hypothesis:
      "Saying \"free\" and \"my vitals\" (B) lowers the perceived cost and increases clicks compared with \"Start the check\" (A).",
    metric: "Click-through to /core (unique clickers ÷ unique viewers)",
    variants: {
      A: "Start the check",
      B: "Check my vitals — free",
    },
  },
];

// ---------- Helpers (pure) ----------

export function findAsset(id) {
  return (
    SOCIAL_POSTS.find((p) => p.id === id) ||
    VIDEO_SCRIPTS.find((s) => s.id === id) ||
    LANDING_COPY.find((l) => l.id === id) ||
    null
  );
}

export function calendarDate(day, start = CAMPAIGN_START) {
  const d = new Date(`${start}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + day - 1);
  return d.toISOString().slice(0, 10);
}

export function weekday(isoDate) {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

// Plain text a person can paste straight into the platform.
export function postText(post) {
  return post.hashtags ? `${post.body}\n\n${post.hashtags}` : post.body;
}

export function scriptText(script) {
  const lines = [`${script.title} (${script.length}, ${script.channel})`, `Hook: ${script.hook}`, ""];
  for (const s of script.scenes) {
    lines.push(`[${s.time}] VISUAL: ${s.visual}`, `VO: ${s.voice}`, `ON-SCREEN: ${s.text}`, "");
  }
  return lines.join("\n").trim();
}

export function filterPosts(posts, { channel = "All", query = "" } = {}) {
  const q = query.trim().toLowerCase();
  return posts.filter((p) => {
    if (channel !== "All" && p.channel !== channel) return false;
    if (!q) return true;
    return [p.title, p.body, p.hashtags, p.pillar, p.channel].join(" ").toLowerCase().includes(q);
  });
}

function csvCell(value) {
  const s = String(value ?? "");
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// RFC 4180 CSV: cells with commas, quotes or line breaks are quoted.
export function toCSV(rows, columns) {
  const header = columns.map((c) => csvCell(c.label)).join(",");
  const body = rows.map((r) => columns.map((c) => csvCell(r[c.key])).join(","));
  return [header, ...body].join("\r\n");
}

export function calendarRows() {
  return CALENDAR.map((c) => {
    const date = calendarDate(c.day);
    const asset = findAsset(c.assetId);
    return {
      day: c.day,
      date,
      weekday: weekday(date),
      channel: c.channel,
      assetId: c.assetId,
      assetTitle: asset ? asset.title : "MISSING",
      goal: c.goal,
      metric: c.metric,
    };
  });
}

export const CALENDAR_COLUMNS = [
  { key: "day", label: "Day" },
  { key: "date", label: "Date" },
  { key: "weekday", label: "Weekday" },
  { key: "channel", label: "Channel" },
  { key: "assetId", label: "Asset" },
  { key: "assetTitle", label: "Title" },
  { key: "goal", label: "Goal" },
  { key: "metric", label: "Success metric" },
];

export function calendarMarkdown() {
  const rows = calendarRows();
  const lines = [
    "# Vitalis — 14-day campaign calendar",
    "",
    "| Day | Date | Channel | Asset | Goal | Metric |",
    "|---|---|---|---|---|---|",
    ...rows.map(
      (r) => `| ${r.day} | ${r.weekday} ${r.date} | ${r.channel} | ${r.assetId} · ${r.assetTitle} | ${r.goal} | ${r.metric} |`
    ),
  ];
  return lines.join("\n");
}

// The whole content library as one Markdown file (export button).
export function libraryMarkdown() {
  const out = [`# ${BRAND.name} — Content library`, "", `_${BRAND.tagline}_`, "", "## Landing page copy", ""];
  for (const l of LANDING_COPY) out.push(`### ${l.id} · ${l.title}`, "", l.body, "");
  out.push("## Social posts", "");
  for (const p of SOCIAL_POSTS) out.push(`### ${p.id} · ${p.channel} · ${p.pillar} — ${p.title}`, "", postText(p), "");
  out.push("## Video scripts", "");
  for (const s of VIDEO_SCRIPTS) out.push(`### ${s.id} · ${s.title}`, "", "```", scriptText(s), "```", "");
  return out.join("\n");
}
