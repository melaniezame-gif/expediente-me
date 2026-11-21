"use client";

import { useEffect, useState } from "react";
import { supabase, supabaseConfigOk } from "@/lib/supabaseClient";
import { SITE_TEST_TARGET, WOULD_USE, isFounderTest, buildSiteTestRow, summarizeSiteTests, validateSiteTest } from "@/lib/dashboard";
import { DEMO_STEPS } from "@/lib/siteMap";
import { MANUAL_CHECKS, OBSERVATIONS, REGRESSION_RUNS, SOFTWARE_SUITES } from "@/lib/testingLog";

const EMPTY = {
  tester_label: "",
  device: "phone",
  steps_completed: "5",
  task_completed: null,
  ease: "",
  trust: "",
  would_use: "",
  confusing: "",
  comment: "",
};

const RESULT_PILL = {
  pass: "bg-emerald-100 text-emerald-800",
  fail: "bg-red-100 text-red-800",
  pending: "bg-gray-100 text-gray-600",
};

function Scale({ name, label, value, onChange, low, high }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-gray-900">{label}</legend>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-gray-500">{low}</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border text-sm font-semibold ${
              String(value) === String(n) ? "border-emerald-700 bg-emerald-700 text-white" : "border-gray-300 bg-white text-gray-700"
            }`}
          >
            <input type="radio" name={name} value={n} checked={String(value) === String(n)} onChange={() => onChange(String(n))} className="sr-only" />
            {n}
          </label>
        ))}
        <span className="text-xs text-gray-500">{high}</span>
      </div>
    </fieldset>
  );
}

// External user testing: the form that testers fill in after the walkthrough,
// and the live testing summary (site_tests) + software / regression evidence.
export default function DemoTesting() {
  const [rows, setRows] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null); // { ok, text }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabaseConfigOk) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError(null);
      const { data, error } = await supabase.from("site_tests").select("*").order("created_at", { ascending: true }).limit(200);
      if (cancelled) return;
      if (error) {
        console.error("Load site_tests failed:", error);
        setLoadError(error.message);
      } else setRows(data || []);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  async function submit(e) {
    e.preventDefault();
    setResult(null);
    const problem = validateSiteTest(form);
    if (problem) {
      setResult({ ok: false, text: problem });
      return;
    }
    if (!supabaseConfigOk) {
      setResult({ ok: false, text: "Supabase is not configured — nothing was saved." });
      return;
    }
    setSaving(true);
    const { data, error } = await supabase.from("site_tests").insert(buildSiteTestRow(form)).select("id").single();
    setSaving(false);
    if (error) {
      console.error("Save site test failed:", error);
      setResult({ ok: false, text: `Not saved — Supabase error: ${error.message}` });
      return;
    }
    setResult({ ok: true, text: `Saved ✓ — thank you! Row id ${data.id}` });
    setForm(EMPTY);
    setRefreshKey((k) => k + 1);
  }

  const s = summarizeSiteTests(rows, SITE_TEST_TARGET);
  const lastRun = REGRESSION_RUNS[REGRESSION_RUNS.length - 1];

  return (
    <>
      {/* ---------- Tester form ---------- */}
      <section id="tester-form" className="mt-10 scroll-mt-6">
        <h2 className="text-xl font-bold text-gray-900">I finished the tour</h2>
        <p className="mt-1 max-w-3xl text-sm text-gray-600">
          For external testers (18+). Takes 1 minute. Use a code like <strong>U4</strong> — please don&apos;t write your
          name or any personal or health information.
        </p>
        <form onSubmit={submit} className="mt-4 grid gap-5 rounded-xl border border-gray-200 bg-white p-5 md:grid-cols-2" noValidate>
          <label className="text-sm font-medium text-gray-900">
            Tester code (optional)
            <input
              value={form.tester_label}
              onChange={(e) => set("tester_label")(e.target.value)}
              maxLength={12}
              placeholder="U4"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
            />
          </label>
          <label className="text-sm font-medium text-gray-900">
            Device
            <select
              value={form.device}
              onChange={(e) => set("device")(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-normal"
            >
              <option value="phone">Phone</option>
              <option value="laptop">Laptop / desktop</option>
              <option value="tablet">Tablet</option>
            </select>
          </label>
          <label className="text-sm font-medium text-gray-900">
            How many of the 5 steps did you complete?
            <select
              value={form.steps_completed}
              onChange={(e) => set("steps_completed")(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-normal"
            >
              {[5, 4, 3, 2, 1, 0].map((n) => (
                <option key={n} value={String(n)}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend className="text-sm font-medium text-gray-900">Did you get a triage result and find it on the dashboard?</legend>
            <div className="mt-2 flex gap-2">
              {[
                [true, "Yes"],
                [false, "No"],
              ].map(([v, l]) => (
                <label
                  key={l}
                  className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm ${
                    form.task_completed === v ? "border-emerald-700 bg-emerald-700 text-white" : "border-gray-300 text-gray-700"
                  }`}
                >
                  <input type="radio" name="task_completed" checked={form.task_completed === v} onChange={() => set("task_completed")(v)} className="sr-only" />
                  {l}
                </label>
              ))}
            </div>
          </fieldset>
          <Scale name="ease" label="How easy was it to use?" value={form.ease} onChange={set("ease")} low="hard" high="easy" />
          <Scale name="trust" label="How much would you trust its advice?" value={form.trust} onChange={set("trust")} low="not at all" high="fully" />
          <fieldset>
            <legend className="text-sm font-medium text-gray-900">Would you use Vitalis for yourself or a family member?</legend>
            <div className="mt-2 flex gap-2">
              {WOULD_USE.map((v) => (
                <label
                  key={v}
                  className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm capitalize ${
                    form.would_use === v ? "border-emerald-700 bg-emerald-700 text-white" : "border-gray-300 text-gray-700"
                  }`}
                >
                  <input type="radio" name="would_use" checked={form.would_use === v} onChange={() => set("would_use")(v)} className="sr-only" />
                  {v}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="text-sm font-medium text-gray-900 md:col-span-2">
            What was confusing or didn&apos;t work? (optional)
            <textarea
              value={form.confusing}
              onChange={(e) => set("confusing")(e.target.value)}
              rows={2}
              maxLength={500}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
            />
          </label>
          <label className="text-sm font-medium text-gray-900 md:col-span-2">
            Any other comment? (optional)
            <textarea
              value={form.comment}
              onChange={(e) => set("comment")(e.target.value)}
              rows={2}
              maxLength={500}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save my test result"}
            </button>
            {result ? (
              <p role="status" data-testid="site-test-result" className={`text-sm ${result.ok ? "text-emerald-700" : "text-red-700"}`}>
                {result.text}
              </p>
            ) : null}
          </div>
        </form>
      </section>
      <div id="evaluators" className="mt-16 scroll-mt-6 border-t-2 border-gray-200 pt-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">For evaluators and investors</p>
        <h2 className="mt-1 text-2xl font-bold text-gray-900">How Vitalis works, and whether it works</h2>
        <p className="mt-1 max-w-3xl text-sm text-gray-600">
          Testers can stop here. Below: test results, the agent map, the impact check and the V2 roadmap.
        </p>
      </div>
      {/* ---------- Testing summary ---------- */}
      <section id="testing" className="mt-8 scroll-mt-6">
        <h2 className="text-xl font-bold text-gray-900">Testing summary</h2>
        <p className="mt-1 max-w-3xl text-sm text-gray-600">
          External users take the 5-step tour on their own device; their answers are read live from Supabase{" "}
          <code>site_tests</code>. Nothing here is typed in by hand.
        </p>

        {loadError ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
            Could not read site_tests: {loadError}
          </p>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5" data-testid="testing-tiles">
          {[
            ["External testers", loading ? "…" : `${s.count} / ${s.target}`, s.targetMet ? "Target met" : "Target: 5"],
            ["Completed the task", `${s.completedPct}%`, ""],
            ["Ease (1–5)", s.count ? s.avgEase : "—", "average"],
            ["Trust (1–5)", s.count ? s.avgTrust : "—", "average"],
            ["Would use it", `${s.wouldUsePct}%`, "answered “yes”"],
          ].map(([label, value, note]) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-medium text-gray-500">{label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
              {note ? <p className="mt-1 text-xs text-gray-500">{note}</p> : null}
            </div>
          ))}
        </div>

        {rows.length > 0 ? (
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2">Tester</th>
                  <th className="px-3 py-2">Device</th>
                  <th className="px-3 py-2">Steps</th>
                  <th className="px-3 py-2">Task</th>
                  <th className="px-3 py-2">Ease</th>
                  <th className="px-3 py-2">Trust</th>
                  <th className="px-3 py-2">Would use</th>
                  <th className="px-3 py-2">Confusing / comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.filter((r) => !isFounderTest(r)).map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2 font-medium">{r.tester_label || "—"}</td>
                    <td className="px-3 py-2">{r.device || "—"}</td>
                    <td className="px-3 py-2">{r.steps_completed}/{DEMO_STEPS.length}</td>
                    <td className="px-3 py-2">{r.task_completed ? "✓" : "✗"}</td>
                    <td className="px-3 py-2">{r.ease}</td>
                    <td className="px-3 py-2">{r.trust}</td>
                    <td className="px-3 py-2">{r.would_use}</td>
                    <td className="px-3 py-2 text-gray-700">
                      {r.confusing ? <span className="block">⚠ {r.confusing}</span> : null}
                      {r.comment ? <span className="block">“{r.comment}”</span> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !loading && !loadError ? (
          <p className="mt-4 rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            No external tests saved yet.
          </p>
        ) : null}

        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">What testers said (founder&apos;s notes) → what changed</h3>
          <ul className="mt-2 space-y-3 text-sm text-gray-800">
            {OBSERVATIONS.map((o) => (
              <li key={o.who}>
                <p className="font-semibold">{o.who}</p>
                <p>{o.note}</p>
                <p className="text-xs text-gray-600">→ {o.action}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-gray-900">Automated tests (regression suite, <code>npm test</code>)</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              {SOFTWARE_SUITES.map((t) => (
                <li key={t.file}>
                  <code className="text-xs">{t.file}</code> <span className="text-xs text-gray-400">W{t.week}</span> — {t.what}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-gray-700" data-testid="regression-last">
              <span className="font-semibold">Live route regression (all 10 pages): </span>
              {lastRun
                ? `${lastRun.passed}/${lastRun.total} passed on ${lastRun.date}${lastRun.notes ? ` — ${lastRun.notes}` : ""}`
                : "not run yet against the live URL."}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-gray-900">Manual full-site checklist (every Save button)</h3>
            <ul className="mt-2 space-y-2 text-sm text-gray-700">
              {MANUAL_CHECKS.map((m) => (
                <li key={m.id} className="flex items-start gap-2">
                  <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${RESULT_PILL[m.result]}`}>{m.result}</span>
                  <span>
                    <strong>{m.id}</strong> <code className="text-xs">{m.page}</code> {m.check}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-gray-500">“pass” only with a Supabase Table Editor screenshot of the row.</p>
          </div>
        </div>
      </section>

    </>
  );
}
