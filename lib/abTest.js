// Week 4 — A/B testing logic. Pure functions only (no React, no Supabase).

export const VARIANTS = ["A", "B"];
export const MIN_VIEWS_PER_VARIANT = 30;

function isVariant(v) {
  return v === "A" || v === "B";
}

// Order of priority: forced override (?ab=A) → existing sticky assignment → coin flip.
export function assignVariant({ override, stored, random = Math.random } = {}) {
  const forced = typeof override === "string" ? override.toUpperCase() : override;
  if (isVariant(forced)) return forced;
  if (isVariant(stored)) return stored;
  return random() < 0.5 ? "A" : "B";
}

// Counts UNIQUE visitors per variant: refreshing the page or clicking twice
// must not inflate the numbers.
export function summarizeEvents(events, testId) {
  const sets = { A: { view: new Set(), click: new Set() }, B: { view: new Set(), click: new Set() } };
  for (const e of events || []) {
    if (e.test_id !== testId || !isVariant(e.variant)) continue;
    if (e.event !== "view" && e.event !== "click") continue;
    sets[e.variant][e.event].add(e.visitor_id);
  }
  const out = {};
  for (const v of VARIANTS) {
    // A click only counts if that visitor also has a view for the same variant.
    const clicks = [...sets[v].click].filter((id) => sets[v].view.has(id)).length;
    out[v] = { views: sets[v].view.size, clicks };
  }
  return out;
}

// Abramowitz–Stegun approximation of the standard normal CDF.
function normalCdf(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

// Two-proportion z-test on click-through rate.
export function analyzeABTest(summary, { minViews = MIN_VIEWS_PER_VARIANT, alpha = 0.05 } = {}) {
  const a = summary.A;
  const b = summary.B;
  const ctrA = a.views > 0 ? a.clicks / a.views : 0;
  const ctrB = b.views > 0 ? b.clicks / b.views : 0;
  const lift = ctrA > 0 ? (ctrB - ctrA) / ctrA : null;
  const leader = ctrB > ctrA ? "B" : ctrA > ctrB ? "A" : null;

  const base = { ctrA, ctrB, lift, leader, z: null, pValue: null, winner: null };

  if (a.views < minViews || b.views < minViews) {
    const needed = Math.max(minViews - a.views, minViews - b.views, 0);
    return {
      ...base,
      verdict: "keep_running",
      message: `Keep running — need at least ${minViews} visitors per variant (${needed} more for the smaller one).`,
    };
  }

  const pooled = (a.clicks + b.clicks) / (a.views + b.views);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / a.views + 1 / b.views));
  if (se === 0) {
    return { ...base, verdict: "no_difference", message: "No difference — both variants have the same click rate." };
  }
  const z = (ctrB - ctrA) / se;
  const pValue = 2 * (1 - normalCdf(Math.abs(z)));

  if (pValue < alpha) {
    return {
      ...base,
      z,
      pValue,
      winner: leader,
      verdict: "winner",
      message: `Variant ${leader} wins (p = ${pValue.toFixed(3)}).`,
    };
  }
  return {
    ...base,
    z,
    pValue,
    verdict: "no_difference",
    message: `No significant difference yet (p = ${pValue.toFixed(2)}). ${leader ? `${leader} is ahead.` : ""}`.trim(),
  };
}

export function formatPct(x) {
  return `${(x * 100).toFixed(1)}%`;
}
