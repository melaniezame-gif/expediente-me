"use client";

import { useMemo, useState } from "react";
import {
  INPUT_FIELDS,
  SCENARIOS,
  calculateRevenue,
  formatMXN,
  validateInputs,
} from "@/lib/pricing";

const FIELD_LABELS = {
  b2cUsers: "Registered users",
  plusConversion: "Plus conversion (%)",
  plusPrice: "Plus price (MXN / month)",
  clinics: "Paying clinics",
  clinicPrice: "Clinic price (MXN / month)",
};

const GROUPS = [
  { title: "B2C · Individuals and families", fields: ["b2cUsers", "plusConversion", "plusPrice"] },
  { title: "B2B · Small clinics", fields: ["clinics", "clinicPrice"] },
];

// Inputs are kept as strings so a field can be cleared while typing.
function toForm(values) {
  return Object.fromEntries(INPUT_FIELDS.map((f) => [f, String(values[f])]));
}

function toNumbers(form) {
  return Object.fromEntries(
    INPUT_FIELDS.map((f) => [f, form[f].trim() === "" ? NaN : Number(form[f])])
  );
}

export default function PricingSimulator() {
  const [scenario, setScenario] = useState("Base");
  const [form, setForm] = useState(toForm(SCENARIOS.Base));

  const inputs = useMemo(() => toNumbers(form), [form]);
  const inputError = validateInputs(inputs);
  const result = inputError ? null : calculateRevenue(inputs);

  function pickScenario(name) {
    setScenario(name);
    setForm(toForm(SCENARIOS[name]));
  }

  function handleChange(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setScenario("Custom");
    };
  }

  const assumptions = result
    ? [
        ["Registered B2C users", inputs.b2cUsers.toLocaleString("en-US"), "Base of possible Plus subscribers"],
        ["Plus conversion", `${inputs.plusConversion}%`, `${result.payingPlusUsers.toLocaleString("en-US")} paying Plus users (rounded down)`],
        ["Plus price", formatMXN(inputs.plusPrice), "Plus revenue = paying users × price"],
        ["Paying clinics", inputs.clinics.toLocaleString("en-US"), "Clinic revenue = clinics × price"],
        ["Clinic price", formatMXN(inputs.clinicPrice), "Flat monthly fee per clinic"],
        ["Months per year", "12", "Annual revenue = monthly × 12"],
      ]
    : [];

  return (
    <div className="mt-8 space-y-10">
      {/* Scenario toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Scenario:</span>
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-1 text-sm" data-testid="scenario-toggle">
          {Object.keys(SCENARIOS).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => pickScenario(name)}
              className={`rounded-md px-4 py-1.5 ${
                scenario === name ? "bg-emerald-700 font-semibold text-white" : "text-gray-700 hover:text-gray-900"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        {scenario === "Custom" && (
          <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
            Custom inputs
          </span>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Calculator inputs */}
        <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:col-span-3">
          {GROUPS.map((group) => (
            <fieldset key={group.title}>
              <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {group.title}
              </legend>
              <div className="mt-2 space-y-2">
                {group.fields.map((field) => (
                  <label key={field} className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-3 text-sm">
                    <span className="font-medium text-gray-700">{FIELD_LABELS[field]}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      value={form[field]}
                      onChange={handleChange(field)}
                      className="w-28 rounded-md border border-gray-300 px-2 py-1 text-right font-mono"
                      aria-label={FIELD_LABELS[field]}
                    />
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          {inputError && (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">
              {inputError}
            </p>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4 rounded-xl bg-gray-900 p-6 text-white md:col-span-2" data-testid="results">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Results · {scenario}
          </p>
          <div>
            <p className="text-sm text-gray-300">Monthly revenue</p>
            <p className="font-mono text-3xl font-extrabold">{result ? formatMXN(result.monthlyRevenue) : "—"}</p>
          </div>
          <div className="border-t border-gray-700 pt-4">
            <p className="text-sm text-gray-300">Annual revenue</p>
            <p className="font-mono text-2xl font-bold text-emerald-300">{result ? formatMXN(result.annualRevenue) : "—"}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-800 p-3 text-xs text-gray-300">
            <div>Plus: <span className="font-semibold text-white">{result ? formatMXN(result.plusRevenue) : "—"}</span></div>
            <div>Clinic: <span className="font-semibold text-white">{result ? formatMXN(result.clinicRevenue) : "—"}</span></div>
          </div>
        </div>
      </div>

      {/* Assumptions table */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900">Assumptions</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[520px] text-left text-sm" data-testid="assumptions">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-700">
              <tr>
                <th className="p-3">Assumption</th>
                <th className="p-3">Value</th>
                <th className="p-3">Used for</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assumptions.map(([name, value, use]) => (
                <tr key={name}>
                  <td className="p-3 font-medium text-gray-800">{name}</td>
                  <td className="p-3 font-mono text-gray-800">{value}</td>
                  <td className="p-3 text-gray-500">{use}</td>
                </tr>
              ))}
              {!result && (
                <tr>
                  <td colSpan={3} className="p-3 text-gray-500">Fix the inputs above to see the assumptions.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
