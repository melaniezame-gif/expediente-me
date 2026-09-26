"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { calculateTriage } from "@/lib/triage";

const STATUS_STYLES = {
  Stable: { label: "Stable", dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50" },
  Review: { label: "Review", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  Attention: { label: "Attention", dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
};

export { calculateTriage };

const initialForm = {
  temperature: "",
  heartRate: "",
  oxygenSaturation: "",
  painLevel: "",
};

export default function CoreCalculator() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState("");

  async function loadHistory() {
    setLoadingHistory(true);
    setHistoryError("");
    try {
      const { data, error } = await supabase
        .from("core_outputs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      setHistoryError(err?.message || String(err));
    }
    setLoadingHistory(false);
  }

  useEffect(() => {
    loadHistory();
  }, []);

  function handleChange(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleCalculate(e) {
    e.preventDefault();
    const parsed = {
      temperature: parseFloat(form.temperature),
      heartRate: parseFloat(form.heartRate),
      oxygenSaturation: parseFloat(form.oxygenSaturation),
      painLevel: parseFloat(form.painLevel),
    };

    if (Object.values(parsed).some((v) => Number.isNaN(v))) {
      setResult(null);
      setSaveMessage("");
      return;
    }

    const triage = calculateTriage(parsed);
    setResult({ ...parsed, ...triage });
    setSaveMessage("");
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    setSaveMessage("");

    try {
      const { error } = await supabase.from("core_outputs").insert({
        temperature: result.temperature,
        heart_rate: result.heartRate,
        oxygen_saturation: result.oxygenSaturation,
        pain_level: result.painLevel,
        risk_score: result.score,
        status: result.status,
        recommendation: result.recommendation,
      });
      if (error) throw error;
      setSaveMessage("Result saved.");
      loadHistory();
    } catch (err) {
      // Show the real error instead of a generic message (Week 1 lesson).
      setSaveMessage(`Save failed: ${err?.message || String(err)}`);
    }
    setSaving(false);
  }

  const statusStyle = result ? STATUS_STYLES[result.status] : null;

  return (
    <div className="mt-8 grid gap-8 md:grid-cols-2">
      <form
        onSubmit={handleCalculate}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-gray-900">
          Patient data
        </h2>

        <label className="mt-4 block text-xs font-medium text-gray-600">
          Body temperature (°C)
        </label>
        <input
          required
          type="number"
          step="0.1"
          min="30"
          max="45"
          placeholder="e.g. 37.0"
          value={form.temperature}
          onChange={handleChange("temperature")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <label className="mt-4 block text-xs font-medium text-gray-600">
          Heart rate (bpm)
        </label>
        <input
          required
          type="number"
          step="1"
          min="20"
          max="250"
          placeholder="e.g. 80"
          value={form.heartRate}
          onChange={handleChange("heartRate")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <label className="mt-4 block text-xs font-medium text-gray-600">
          Oxygen saturation (%)
        </label>
        <input
          required
          type="number"
          step="1"
          min="50"
          max="100"
          placeholder="e.g. 97"
          value={form.oxygenSaturation}
          onChange={handleChange("oxygenSaturation")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <label className="mt-4 block text-xs font-medium text-gray-600">
          Pain level (0-10)
        </label>
        <input
          required
          type="number"
          step="1"
          min="0"
          max="10"
          placeholder="e.g. 2"
          value={form.painLevel}
          onChange={handleChange("painLevel")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <button
          type="submit"
          className="mt-6 w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Calculate
        </button>
      </form>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Result</h2>

        {!result && (
          <p className="mt-4 text-sm text-gray-500">
            Fill in the form and press Calculate to see the result here.
          </p>
        )}

        {result && (
          <div className="mt-4">
            <div className={`flex items-center gap-2 rounded-md p-3 ${statusStyle.bg}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${statusStyle.dot}`} />
              <span className={`text-sm font-semibold ${statusStyle.text}`}>
                {statusStyle.label}
              </span>
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Risk score</dt>
                <dd className="font-medium text-gray-900">{result.score} / 8</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Temperature</dt>
                <dd className="font-medium text-gray-900">{result.temperature} °C</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Heart rate</dt>
                <dd className="font-medium text-gray-900">{result.heartRate} bpm</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Oxygen saturation</dt>
                <dd className="font-medium text-gray-900">{result.oxygenSaturation}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Pain level</dt>
                <dd className="font-medium text-gray-900">{result.painLevel} / 10</dd>
              </div>
            </dl>

            <p className="mt-4 text-sm text-gray-700">{result.recommendation}</p>
            <p className="mt-2 text-xs text-red-700">
              If the patient has chest pain, trouble breathing, confusion or
              fainted, call 911 now — whatever the score says. Re-measure if a
              reading looks wrong.
            </p>

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-5 w-full rounded-md border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save this result"}
            </button>

            {saveMessage && (
              <p className="mt-2 text-xs text-gray-600">{saveMessage}</p>
            )}
          </div>
        )}

        <div className="mt-8 border-t border-gray-100 pt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Dashboard — saved results
          </h3>

          {loadingHistory && (
            <p className="mt-3 text-xs text-gray-400">Loading...</p>
          )}

          {historyError && (
            <p className="mt-3 text-xs text-red-700">
              Could not load saved results: {historyError}
            </p>
          )}

          {!loadingHistory && !historyError && history.length === 0 && (
            <p className="mt-3 text-xs text-gray-400">
              No saved results yet.
            </p>
          )}

          {!loadingHistory && history.length > 0 && (
            <table className="mt-3 w-full text-left text-xs">
              <thead>
                <tr className="text-gray-400">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Score</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100">
                    <td className="py-2 text-gray-600">
                      {new Date(row.created_at).toLocaleString("en-US")}
                    </td>
                    <td className="py-2 text-gray-600">{row.risk_score} / 8</td>
                    <td className="py-2 text-gray-600">
                      {STATUS_STYLES[row.status]?.label ?? row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
