// Week 3 — Product Architecture + Pricing Simulator
// Pure functions only: no React, no Supabase. This keeps the math easy to test.

export const TIERS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    segment: "B2C",
    audience: "One person trying the triage and a basic record.",
    highlights: ["1 profile", "Triage + last 10 results"],
  },
  {
    id: "plus",
    name: "Plus",
    price: 79,
    segment: "B2C",
    audience: "Individuals and families who share records with doctors.",
    highlights: ["Up to 5 family profiles", "PDF export + check-up reminders"],
    recommended: true,
  },
  {
    id: "clinic",
    name: "Clinic",
    price: 599,
    segment: "B2B",
    audience: "Independent doctors and small clinics (1–5 doctors).",
    highlights: ["Patient list dashboard", "Front-desk triage, up to 5 staff"],
  },
];

// true = included, false = not included, string = included with a limit.
export const FEATURE_MAP = [
  { feature: "Vital-signs triage (/core)", free: true, plus: true, clinic: true },
  { feature: "Saved triage history", free: "Last 10", plus: "Unlimited", clinic: "Unlimited" },
  { feature: "Profiles", free: "1", plus: "Up to 5 (family)", clinic: "Unlimited patients" },
  { feature: "Export record as PDF for a doctor", free: false, plus: true, clinic: true },
  { feature: "Check-up reminders", free: false, plus: true, clinic: true },
  { feature: "Patient list dashboard", free: false, plus: false, clinic: true },
  { feature: "Front-desk triage mode", free: false, plus: false, clinic: true },
  { feature: "Multiple staff users", free: false, plus: false, clinic: "Up to 5" },
];

export const SEGMENTS = [
  {
    id: "b2c",
    name: "B2C · Individuals and families",
    who: "Adults 18+ in Mexico who track their own or a family member's health.",
    tiers: ["Free", "Plus"],
  },
  {
    id: "b2b",
    name: "B2B · Small clinics",
    who: "Independent doctors and small clinics (1–5 doctors) in Mexico.",
    tiers: ["Clinic"],
  },
];

export const SCENARIOS = {
  Conservative: { b2cUsers: 1000, plusConversion: 2, plusPrice: 79, clinics: 10, clinicPrice: 599 },
  Base: { b2cUsers: 3000, plusConversion: 4, plusPrice: 79, clinics: 25, clinicPrice: 599 },
  Optimistic: { b2cUsers: 8000, plusConversion: 7, plusPrice: 79, clinics: 60, clinicPrice: 599 },
};

export const INPUT_FIELDS = ["b2cUsers", "plusConversion", "plusPrice", "clinics", "clinicPrice"];

// Returns an error message, or "" when the inputs are valid.
export function validateInputs(inputs) {
  for (const field of INPUT_FIELDS) {
    const value = inputs[field];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return "Every field needs a number.";
    }
    if (value < 0) return "Values cannot be negative.";
  }
  if (inputs.plusConversion > 100) return "Plus conversion cannot be above 100%.";
  return "";
}

// Monthly = floor(users × conversion%) × Plus price + clinics × Clinic price
// Annual  = monthly × 12
export function calculateRevenue({ b2cUsers, plusConversion, plusPrice, clinics, clinicPrice }) {
  // The tiny epsilon stops float noise (e.g. 3000 × 4.1 = 12299.999…) from
  // rounding a whole user down.
  const payingPlusUsers = Math.floor((b2cUsers * plusConversion) / 100 + 1e-9);
  const plusRevenue = payingPlusUsers * plusPrice;
  const clinicRevenue = clinics * clinicPrice;
  const monthlyRevenue = plusRevenue + clinicRevenue;
  return {
    payingPlusUsers,
    plusRevenue,
    clinicRevenue,
    monthlyRevenue,
    annualRevenue: monthlyRevenue * 12,
  };
}

export function formatMXN(value) {
  return `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)} MXN`;
}
