"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const STATUS_STYLES = {
  Stable: { label: "Estable", dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50" },
  Review: { label: "Revisión", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  Attention: { label: "Atención", dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
};

// Cálculo puro basado en reglas. Sin IA ni APIs externas.
// Inspirado en escalas de alerta temprana (NEWS) simplificadas para fines
// educativos: NO sustituye el criterio de un profesional de la salud.
export function calculateTriage({ temperature, heartRate, oxygenSaturation, painLevel }) {
  let score = 0;

  if (temperature > 38.0 || temperature < 35.0) score += 2;
  else if (
    (temperature >= 37.3 && temperature <= 38.0) ||
    (temperature >= 35.1 && temperature <= 36.0)
  )
    score += 1;

  if (heartRate > 120 || heartRate < 50) score += 2;
  else if ((heartRate >= 101 && heartRate <= 120) || (heartRate >= 50 && heartRate <= 59))
    score += 1;

  if (oxygenSaturation <= 90) score += 2;
  else if (oxygenSaturation >= 91 && oxygenSaturation <= 94) score += 1;

  if (painLevel >= 7) score += 2;
  else if (painLevel >= 4) score += 1;

  let status = "Stable";
  let recommendation =
    "Los signos vitales están dentro de rango normal. No se requiere atención inmediata.";

  if (score >= 5) {
    status = "Attention";
    recommendation =
      "Los signos vitales indican riesgo alto. Se recomienda buscar atención médica inmediata.";
  } else if (score >= 2) {
    status = "Review";
    recommendation =
      "Algunos signos vitales están alterados. Se recomienda una revisión médica en las próximas horas.";
  }

  return { score, status, recommendation };
}

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

  async function loadHistory() {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from("core_outputs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) setHistory(data);
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

    const { error } = await supabase.from("core_outputs").insert({
      temperature: result.temperature,
      heart_rate: result.heartRate,
      oxygen_saturation: result.oxygenSaturation,
      pain_level: result.painLevel,
      risk_score: result.score,
      status: result.status,
      recommendation: result.recommendation,
    });

    setSaving(false);

    if (error) {
      setSaveMessage("No se pudo guardar el resultado. Intenta de nuevo.");
      return;
    }

    setSaveMessage("Resultado guardado correctamente.");
    loadHistory();
  }

  const statusStyle = result ? STATUS_STYLES[result.status] : null;

  return (
    <div className="mt-8 grid gap-8 md:grid-cols-2">
      <form
        onSubmit={handleCalculate}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-gray-900">
          Datos del paciente
        </h2>

        <label className="mt-4 block text-xs font-medium text-gray-600">
          Temperatura corporal (°C)
        </label>
        <input
          required
          type="number"
          step="0.1"
          placeholder="ej. 37.0"
          value={form.temperature}
          onChange={handleChange("temperature")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <label className="mt-4 block text-xs font-medium text-gray-600">
          Frecuencia cardiaca (lpm)
        </label>
        <input
          required
          type="number"
          step="1"
          placeholder="ej. 80"
          value={form.heartRate}
          onChange={handleChange("heartRate")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <label className="mt-4 block text-xs font-medium text-gray-600">
          Saturación de oxígeno (%)
        </label>
        <input
          required
          type="number"
          step="1"
          placeholder="ej. 97"
          value={form.oxygenSaturation}
          onChange={handleChange("oxygenSaturation")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <label className="mt-4 block text-xs font-medium text-gray-600">
          Nivel de dolor (0-10)
        </label>
        <input
          required
          type="number"
          step="1"
          min="0"
          max="10"
          placeholder="ej. 2"
          value={form.painLevel}
          onChange={handleChange("painLevel")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <button
          type="submit"
          className="mt-6 w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Calcular
        </button>
      </form>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Resultado</h2>

        {!result && (
          <p className="mt-4 text-sm text-gray-500">
            Llena el formulario y presiona Calcular para ver tu resultado
            aquí.
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
                <dt className="text-gray-500">Puntaje de riesgo</dt>
                <dd className="font-medium text-gray-900">{result.score} / 8</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Temperatura</dt>
                <dd className="font-medium text-gray-900">{result.temperature} °C</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Frecuencia cardiaca</dt>
                <dd className="font-medium text-gray-900">{result.heartRate} lpm</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Saturación de oxígeno</dt>
                <dd className="font-medium text-gray-900">{result.oxygenSaturation}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Nivel de dolor</dt>
                <dd className="font-medium text-gray-900">{result.painLevel} / 10</dd>
              </div>
            </dl>

            <p className="mt-4 text-sm text-gray-700">{result.recommendation}</p>

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-5 w-full rounded-md border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar este resultado"}
            </button>

            {saveMessage && (
              <p className="mt-2 text-xs text-gray-600">{saveMessage}</p>
            )}
          </div>
        )}

        <div className="mt-8 border-t border-gray-100 pt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Panel — resultados guardados
          </h3>

          {loadingHistory && (
            <p className="mt-3 text-xs text-gray-400">Cargando...</p>
          )}

          {!loadingHistory && history.length === 0 && (
            <p className="mt-3 text-xs text-gray-400">
              Todavía no hay resultados guardados.
            </p>
          )}

          {!loadingHistory && history.length > 0 && (
            <table className="mt-3 w-full text-left text-xs">
              <thead>
                <tr className="text-gray-400">
                  <th className="pb-2 font-medium">Fecha</th>
                  <th className="pb-2 font-medium">Puntaje</th>
                  <th className="pb-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100">
                    <td className="py-2 text-gray-600">
                      {new Date(row.created_at).toLocaleDateString()}
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
