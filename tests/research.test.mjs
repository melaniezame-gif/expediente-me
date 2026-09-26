// Run with: npm test   (uses Node's built-in test runner, no extra deps)
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  COMPETITORS,
  GLOBAL_EXAMPLES,
  RISKS,
  filterCompetitors,
  riskLevel,
} from "../lib/researchData.js";
import { calculateTriage } from "../lib/triage.js";

test("Test 1 — competitor search and type filter return the right rows", () => {
  const all = filterCompetitors(COMPETITORS, {});
  assert.equal(all.length, 8);

  const free = filterCompetitors(COMPETITORS, { query: "free" });
  assert.deepEqual(
    free.map((c) => c.id),
    [2, 4, 5, 6, 8]
  );

  const substitutes = filterCompetitors(COMPETITORS, { type: "Substitute" });
  assert.deepEqual(substitutes.map((c) => c.id), [1, 2, 8]);

  const combined = filterCompetitors(COMPETITORS, { query: "mexico", type: "Direct" });
  // Only Ada matches, and only because its weakness says "not built for Mexico".
  assert.deepEqual(combined.map((c) => c.id), [5]);

  const none = filterCompetitors(COMPETITORS, { query: "zzz-no-match" });
  assert.equal(none.length, 0);
});

test("Test 2 — dataset completeness and risk levels", () => {
  assert.equal(GLOBAL_EXAMPLES.length, 5);
  assert.equal(COMPETITORS.length, 8);
  assert.equal(riskLevel({ likelihood: 3, impact: 3 }), "High");
  assert.equal(riskLevel({ likelihood: 2, impact: 3 }), "High");
  assert.equal(riskLevel({ likelihood: 2, impact: 2 }), "Medium");
  assert.equal(riskLevel({ likelihood: 1, impact: 2 }), "Low");
  for (const r of RISKS) {
    assert.ok(r.likelihood >= 1 && r.likelihood <= 3);
    assert.ok(r.impact >= 1 && r.impact <= 3);
    assert.ok(r.mitigation.length > 0);
  }
});

test("Test 3 — triage formula still matches the Week 1 cases (regression)", () => {
  const normal = calculateTriage({ temperature: 37.0, heartRate: 80, oxygenSaturation: 98, painLevel: 1 });
  assert.equal(normal.score, 0);
  assert.equal(normal.status, "Stable");

  const moderate = calculateTriage({ temperature: 37.5, heartRate: 105, oxygenSaturation: 93, painLevel: 5 });
  assert.equal(moderate.score, 4);
  assert.equal(moderate.status, "Review");

  const severe = calculateTriage({ temperature: 39.0, heartRate: 130, oxygenSaturation: 88, painLevel: 9 });
  assert.equal(severe.score, 8);
  assert.equal(severe.status, "Attention");
});
