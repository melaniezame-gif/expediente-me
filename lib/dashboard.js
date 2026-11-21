// Week 6 — /dashboard and /demo logic. Pure functions: no React, no network,
// so every number on the dashboard can be unit-tested (tests/site.test.mjs).

// Tables read by /dashboard. `list: false` = counted in the KPIs but not shown
// row by row (ab_events has one row per view/click — too noisy for a list).
export const SOURCES = [
  { id: "triage", table: "core_outputs", label: "Triage", page: "/core", list: true },
  { id: "chat", table: "chat_sessions", label: "Chat", page: "/chat", list: true },
  { id: "feedback", table: "chat_feedback", label: "Chat rating", page: "/chat", list: true },
  { id: "research", table: "research_records", label: "Research", page: "/research", list: true },
  { id: "pricing", table: "pricing_scenarios", label: "Pricing", page: "/pricing", list: true },
  { id: "marketing", table: "marketing_assets", label: "Marketing", page: "/marketing", list: true },
  { id: "site_test", table: "site_tests", label: "Site test", page: "/demo", list: true },
  { id: "ab", table: "ab_events", label: "A/B event", page: "/", list: false },
];

export const SITE_TEST_TARGET = 5;

const STATUSES = ["Stable", "Review", "Attention"];

function clip(text, n = 90) {
  const s = String(text ?? "").replace(/\s+/g, " ").trim();
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

function mxn(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n)} MXN`;
}

// One row from any table → { id, source, created_at, summary, status, needs_review }
export function normalizeRecord(sourceId, row) {
  const base = {
    id: `${sourceId}:${row.id}`,
    rowId: row.id,
    source: sourceId,
    created_at: row.created_at || null,
    status: null,
    needs_review: false,
    summary: "",
  };
  switch (sourceId) {
    case "triage":
      return {
        ...base,
        status: STATUSES.includes(row.status) ? row.status : null,
        needs_review: row.status === "Attention",
        summary: `${row.temperature} °C · ${row.heart_rate} bpm · ${row.oxygen_saturation}% SpO₂ · pain ${row.pain_level} → score ${row.risk_score}/8`,
      };
    case "chat": {
      const parts = [];
      if (row.tester_label) parts.push(row.tester_label);
      if (row.triage_status) parts.push(`${row.triage_status} ${row.triage_score ?? ""}/8`.replace(" /8", "/8"));
      else if (row.red_flag && row.red_flag !== "none") parts.push(`red flag: ${row.red_flag}`);
      else parts.push("no result");
      if (row.guardrails?.length) parts.push(`guardrails: ${row.guardrails.join(", ")}`);
      parts.push(`${row.overall_rating}★`);
      if (row.tester_comment) parts.push(`“${clip(row.tester_comment, 60)}”`);
      return {
        ...base,
        status: STATUSES.includes(row.triage_status) ? row.triage_status : null,
        needs_review: Boolean(row.needs_review),
        summary: parts.join(" · "),
      };
    }
    case "feedback":
      return {
        ...base,
        needs_review: row.rating === -1,
        summary: `${row.rating === 1 ? "👍" : "👎"} ${row.intent} — “${clip(row.bot_text, 70)}”`,
      };
    case "research":
      return { ...base, summary: `${row.source_type || "Research"} · ${row.region} — ${clip(row.key_finding, 80)}` };
    case "pricing":
      return { ...base, summary: `${row.name} (${row.scenario_type}) · ${mxn(row.monthly_revenue)} / month` };
    case "marketing":
      return { ...base, summary: `${row.asset_id} · ${row.channel} — ${clip(row.title, 70)}` };
    case "site_test":
      return {
        ...base,
        needs_review: row.task_completed === false || Number(row.trust) <= 2,
        summary: `${row.tester_label || "Tester"} · ${row.device || "device ?"} · ${row.steps_completed}/7 steps · ease ${row.ease} · trust ${row.trust} · would use: ${row.would_use}${row.comment ? ` · “${clip(row.comment, 50)}”` : ""}`,
      };
    case "ab":
      return { ...base, summary: `${row.test_id} · ${row.variant} · ${row.event}`, visitor_id: row.visitor_id };
    default:
      return base;
  }
}

// rowsBySource: { triage: [...], chat: [...], ... } → newest-first list
export function normalizeRecords(rowsBySource) {
  const out = [];
  for (const s of SOURCES) {
    for (const row of rowsBySource[s.id] || []) out.push(normalizeRecord(s.id, row));
  }
  return out.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
}

export function summarizeRecords(records) {
  const bySource = Object.fromEntries(SOURCES.map((s) => [s.id, 0]));
  const status = { Stable: 0, Review: 0, Attention: 0 };
  const visitors = new Set();
  let needsReview = 0;
  for (const r of records) {
    if (r.source in bySource) bySource[r.source] += 1;
    if (r.status && r.status in status) status[r.status] += 1;
    if (r.needs_review) needsReview += 1;
    if (r.source === "ab" && r.visitor_id) visitors.add(r.visitor_id);
  }
  const listed = records.filter((r) => r.source !== "ab").length;
  const statusTotal = status.Stable + status.Review + status.Attention;
  return {
    total: listed,
    bySource,
    status,
    statusTotal,
    attentionPct: statusTotal ? Math.round((status.Attention / statusTotal) * 100) : 0,
    needsReview,
    abVisitors: visitors.size,
  };
}

export function filterRecords(records, { source = "all", query = "", reviewOnly = false } = {}) {
  const q = query.trim().toLowerCase();
  return records.filter((r) => {
    if (r.source === "ab") return false;
    if (source !== "all" && r.source !== source) return false;
    if (reviewOnly && !r.needs_review) return false;
    if (q && !`${r.summary} ${r.status || ""}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

function csvCell(v) {
  const s = String(v ?? "");
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function recordsToCSV(records) {
  const label = Object.fromEntries(SOURCES.map((s) => [s.id, s.label]));
  const header = ["created_at", "source", "status", "needs_review", "summary", "row_id"];
  const rows = records.map((r) =>
    [r.created_at, label[r.source] || r.source, r.status || "", r.needs_review ? "yes" : "no", r.summary, r.rowId]
      .map(csvCell)
      .join(",")
  );
  return [header.join(","), ...rows].join("\r\n");
}

// ---------- /demo external tester form + testing summary ----------

export const WOULD_USE = ["yes", "maybe", "no"];

// Returns "" when valid, otherwise the first problem found.
export function validateSiteTest(form) {
  const ease = Number(form.ease);
  const trust = Number(form.trust);
  const steps = Number(form.steps_completed);
  if (!Number.isInteger(ease) || ease < 1 || ease > 5) return "Rate how easy it was from 1 to 5.";
  if (!Number.isInteger(trust) || trust < 1 || trust > 5) return "Rate how much you'd trust it from 1 to 5.";
  if (!Number.isInteger(steps) || steps < 0 || steps > 7) return "Steps completed must be between 0 and 7.";
  if (!WOULD_USE.includes(form.would_use)) return "Choose yes, maybe or no for “would you use it”.";
  if (typeof form.task_completed !== "boolean") return "Say whether you completed the task.";
  const label = String(form.tester_label || "").trim();
  if (label.length > 12) return "Tester code is max 12 characters — a code like U4, not your name.";
  return "";
}

export function buildSiteTestRow(form) {
  return {
    tester_label: String(form.tester_label || "").trim() || null,
    device: form.device || null,
    steps_completed: Number(form.steps_completed),
    task_completed: form.task_completed,
    ease: Number(form.ease),
    trust: Number(form.trust),
    would_use: form.would_use,
    confusing: String(form.confusing || "").trim() || null,
    comment: String(form.comment || "").trim() || null,
  };
}

export function summarizeSiteTests(rows, target = SITE_TEST_TARGET) {
  const n = rows.length;
  const avg = (key) => (n ? Math.round((rows.reduce((s, r) => s + Number(r[key] || 0), 0) / n) * 10) / 10 : 0);
  const pct = (fn) => (n ? Math.round((rows.filter(fn).length / n) * 100) : 0);
  return {
    count: n,
    target,
    targetMet: n >= target,
    avgEase: avg("ease"),
    avgTrust: avg("trust"),
    completedPct: pct((r) => r.task_completed === true),
    wouldUsePct: pct((r) => r.would_use === "yes"),
    devices: [...new Set(rows.map((r) => r.device).filter(Boolean))],
    confusing: rows.filter((r) => r.confusing).map((r) => ({ who: r.tester_label || "Tester", text: r.confusing })),
    comments: rows.filter((r) => r.comment).map((r) => ({ who: r.tester_label || "Tester", text: r.comment })),
  };
}
