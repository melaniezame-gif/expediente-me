// Week 3 pricing logic tests. Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { SCENARIOS, TIERS, calculateRevenue, validateInputs } from "../lib/pricing.js";

test("Pricing test P1 — the three scenarios give the totals in the spec", () => {
  const base = calculateRevenue(SCENARIOS.Base);
  assert.equal(base.payingPlusUsers, 120);
  assert.equal(base.plusRevenue, 9480);
  assert.equal(base.clinicRevenue, 14975);
  assert.equal(base.monthlyRevenue, 24455);
  assert.equal(base.annualRevenue, 293460);

  assert.equal(calculateRevenue(SCENARIOS.Conservative).monthlyRevenue, 7570);
  assert.equal(calculateRevenue(SCENARIOS.Conservative).annualRevenue, 90840);
  assert.equal(calculateRevenue(SCENARIOS.Optimistic).monthlyRevenue, 80180);
  assert.equal(calculateRevenue(SCENARIOS.Optimistic).annualRevenue, 962160);
});

test("Pricing test P2 — custom input rounds paying users down", () => {
  const r = calculateRevenue({ b2cUsers: 1250, plusConversion: 3, plusPrice: 79, clinics: 0, clinicPrice: 599 });
  assert.equal(r.payingPlusUsers, 37); // 37.5 → 37
  assert.equal(r.monthlyRevenue, 2923);
  assert.equal(r.annualRevenue, 35076);

  // Float noise must not drop a user: 3000 × 4.1% = exactly 123.
  const noisy = calculateRevenue({ b2cUsers: 3000, plusConversion: 4.1, plusPrice: 79, clinics: 0, clinicPrice: 599 });
  assert.equal(noisy.payingPlusUsers, 123);
});

test("Validation and tiers — bad inputs are rejected, 3 tiers exist", () => {
  assert.equal(validateInputs(SCENARIOS.Base), "");
  assert.notEqual(validateInputs({ ...SCENARIOS.Base, plusConversion: 150 }), "");
  assert.notEqual(validateInputs({ ...SCENARIOS.Base, clinics: -1 }), "");
  assert.notEqual(validateInputs({ ...SCENARIOS.Base, b2cUsers: NaN }), "");
  assert.deepEqual(TIERS.map((t) => [t.name, t.price]), [["Free", 0], ["Plus", 79], ["Clinic", 599]]);
});
