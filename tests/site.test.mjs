// Week 6 integrated-site tests. Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { ALL_PAGES, AGENTS, DEMO_LINK, DEMO_STEPS, NAV_GROUPS } from "../lib/siteMap.js";
import { HARMS, ROADMAP, VALUE, viabilitySnapshot } from "../lib/impact.js";
import { SCENARIOS, calculateRevenue } from "../lib/pricing.js";
import {
  buildSiteTestRow,
  filterRecords,
  normalizeRecords,
  recordsToCSV,
  summarizeRecords,
  summarizeSiteTests,
  validateSiteTest,
} from "../lib/dashboard.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pageFile = (href) => path.join(root, "app", href === "/" ? "" : href.replace(/^\//, ""), "page.js");

test("S1 — navigation integrity: every linked route has a page, no duplicates, demo + dashboard in nav", () => {
  const navHrefs = NAV_GROUPS.flatMap((g) => g.links.map((l) => l.href)).concat(DEMO_LINK.href);
  const allHrefs = ALL_PAGES.map((p) => p.href);
  const stepHrefs = DEMO_STEPS.map((s) => s.href);

  for (const href of new Set([...navHrefs, ...allHrefs, ...stepHrefs])) {
    assert.ok(existsSync(pageFile(href)), `missing page file for ${href}`);
  }
  assert.equal(new Set(navHrefs).size, navHrefs.length, "duplicate link in the header nav");
  assert.equal(new Set(allHrefs).size, allHrefs.length, "duplicate page in the site map");
  assert.ok(navHrefs.includes("/demo") && navHrefs.includes("/dashboard"));
  // Every page except the home page is in the header (home = the logo).
  for (const href of allHrefs.filter((h) => h !== "/")) assert.ok(navHrefs.includes(href), `${href} not in nav`);
  assert.equal(ALL_PAGES.length, 10);
  assert.equal(DEMO_STEPS.length, 7);
  for (const s of DEMO_STEPS) {
    assert.ok(s.why && s.expected && s.tryThis.length >= 1, `step ${s.id} incomplete`);
  }
});

test("S2 — dashboard logic: normalize, summarize, filter and export across tables", () => {
  const rows = {
    triage: [
      { id: "t1", created_at: "2026-11-20T10:00:00Z", temperature: 37.5, heart_rate: 105, oxygen_saturation: 93, pain_level: 5, risk_score: 4, status: "Review" },
      { id: "t2", created_at: "2026-11-20T12:00:00Z", temperature: 39, heart_rate: 130, oxygen_saturation: 88, pain_level: 9, risk_score: 8, status: "Attention" },
    ],
    chat: [
      { id: "c1", created_at: "2026-11-19T09:00:00Z", tester_label: "U3", triage_status: null, red_flag: "chest_pain", guardrails: ["emergency"], needs_review: true, overall_rating: 5, tester_comment: "Would trust it" },
      { id: "c2", created_at: "2026-11-19T08:00:00Z", tester_label: "U1", triage_status: "Stable", triage_score: 1, guardrails: [], needs_review: false, overall_rating: 4 },
    ],
    feedback: [{ id: "f1", created_at: "2026-11-18T08:00:00Z", rating: -1, intent: "fallback", bot_text: "I don't have a reliable answer" }],
    research: [{ id: "r1", created_at: "2026-11-01T08:00:00Z", source_type: "Interview", region: "CDMX", key_finding: "Caregivers use WhatsApp to share readings" }],
    pricing: [{ id: "p1", created_at: "2026-10-10T08:00:00Z", name: "Base", scenario_type: "Base", monthly_revenue: 24455 }],
    marketing: [{ id: "m1", created_at: "2026-10-20T08:00:00Z", asset_id: "P1", channel: "Instagram", title: "Is 93% oxygen bad?" }],
    site_test: [{ id: "s1", created_at: "2026-11-21T08:00:00Z", tester_label: "U4", device: "phone", steps_completed: 7, task_completed: true, ease: 5, trust: 4, would_use: "yes" }],
    ab: [
      { id: "a1", created_at: "2026-11-20T08:00:00Z", test_id: "hero_headline", variant: "A", event: "view", visitor_id: "v1" },
      { id: "a2", created_at: "2026-11-20T08:01:00Z", test_id: "hero_headline", variant: "A", event: "click", visitor_id: "v1" },
      { id: "a3", created_at: "2026-11-20T08:02:00Z", test_id: "cta_text", variant: "B", event: "view", visitor_id: "v2" },
    ],
  };
  const records = normalizeRecords(rows);

  // Newest first, A/B events counted but never listed.
  assert.equal(records[0].id, "site_test:s1");
  assert.match(records.find((r) => r.id === "triage:t1").summary, /37\.5 °C · 105 bpm · 93% SpO₂ · pain 5 → score 4\/8/);
  assert.match(records.find((r) => r.id === "chat:c2").summary, /U1 · Stable 1\/8 · 4★/);
  assert.match(records.find((r) => r.id === "chat:c1").summary, /red flag: chest_pain · guardrails: emergency/);

  const s = summarizeRecords(records);
  assert.equal(s.total, 9); // 2 + 2 + 1 + 1 + 1 + 1 + 1, ab excluded
  assert.equal(s.bySource.ab, 3);
  assert.equal(s.abVisitors, 2);
  assert.deepEqual(s.status, { Stable: 1, Review: 1, Attention: 1 });
  assert.equal(s.attentionPct, 33);
  assert.equal(s.needsReview, 3); // Attention triage + flagged chat + 👎

  assert.equal(filterRecords(records).length, 9);
  assert.equal(filterRecords(records, { source: "triage" }).length, 2);
  assert.deepEqual(filterRecords(records, { query: "whatsapp" }).map((r) => r.id), ["research:r1"]);
  assert.equal(filterRecords(records, { reviewOnly: true }).length, 3);
  assert.equal(filterRecords(records, { source: "ab" }).length, 0);

  const csv = recordsToCSV(filterRecords(records, { source: "chat" })).split("\r\n");
  assert.equal(csv.length, 3);
  assert.equal(csv[0], "created_at,source,status,needs_review,summary,row_id");
  assert.match(csv[1], /^2026-11-19T09:00:00Z,Chat,,yes,"?U3/);
});

test("S3 — agents, impact, roadmap, viability and the external tester form", () => {
  assert.ok(AGENTS.length >= 6);
  for (const a of AGENTS) {
    for (const key of ["name", "input", "output", "table", "checkpoint", "page"]) assert.ok(a[key], `${a.id}.${key}`);
  }
  // Only the coding agent uses generative AI; nothing that talks to patients does.
  assert.deepEqual(AGENTS.filter((a) => a.ai).map((a) => a.id), ["claude"]);
  assert.ok(AGENTS.some((a) => a.kind === "human"));

  assert.ok(VALUE.length >= 4);
  assert.ok(HARMS.length >= 5);
  for (const h of HARMS) assert.ok(h.mitigation && h.where && h.status, `harm ${h.id} incomplete`);
  for (const col of ["now", "next", "later"]) {
    assert.ok(ROADMAP[col].length >= 3, `roadmap ${col}`);
    for (const r of ROADMAP[col]) assert.ok(r.item && r.why);
  }

  // Viability numbers must be exactly the /pricing numbers.
  for (const v of viabilitySnapshot()) {
    assert.equal(v.monthlyRevenue, calculateRevenue(SCENARIOS[v.name]).monthlyRevenue);
  }

  const good = { tester_label: " U4 ", device: "phone", steps_completed: "7", task_completed: true, ease: "5", trust: "4", would_use: "yes", confusing: "", comment: " Clear " };
  assert.equal(validateSiteTest(good), "");
  assert.match(validateSiteTest({ ...good, ease: "0" }), /easy/);
  assert.match(validateSiteTest({ ...good, would_use: "" }), /yes, maybe or no/);
  assert.match(validateSiteTest({ ...good, tester_label: "Melanie Zamora" }), /not your name/);
  assert.match(validateSiteTest({ ...good, task_completed: undefined }), /completed/);
  assert.deepEqual(buildSiteTestRow(good), {
    tester_label: "U4", device: "phone", steps_completed: 7, task_completed: true, ease: 5, trust: 4,
    would_use: "yes", confusing: null, comment: "Clear",
  });

  const summary = summarizeSiteTests([
    { tester_label: "U4", ease: 5, trust: 4, task_completed: true, would_use: "yes", device: "phone", comment: "Clear" },
    { tester_label: "U5", ease: 4, trust: 5, task_completed: true, would_use: "maybe", device: "laptop", confusing: "Where is Save?" },
    { tester_label: "U6", ease: 3, trust: 3, task_completed: false, would_use: "yes", device: "phone" },
    { tester_label: "test", ease: 1, trust: 1, task_completed: false, would_use: "no", device: "laptop" }, // founder check, ignored
  ]);
  assert.equal(summary.count, 3);
  assert.equal(summary.targetMet, false);
  assert.equal(summary.avgEase, 4);
  assert.equal(summary.avgTrust, 4);
  assert.equal(summary.completedPct, 67);
  assert.equal(summary.wouldUsePct, 67);
  assert.deepEqual(summary.devices, ["phone", "laptop"]);
  assert.deepEqual(summary.confusing, [{ who: "U5", text: "Where is Save?" }]);
});
