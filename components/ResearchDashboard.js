"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, supabaseConfigOk } from "@/lib/supabaseClient";
import {
  RESEARCH_QUESTION,
  GLOBAL_EXAMPLES,
  MEXICO_FACTS,
  COMPETITORS,
  BENCHMARKS,
  RISKS,
  GAPS,
  filterCompetitors,
  riskLevel,
} from "@/lib/researchData";

const TYPES = ["All", "Direct", "Adjacent", "Substitute"];

const TYPE_STYLES = {
  Direct: "bg-emerald-50 text-emerald-800",
  Adjacent: "bg-sky-50 text-sky-800",
  Substitute: "bg-amber-50 text-amber-800",
};

const LEVEL_STYLES = {
  High: "bg-red-100",
  Medium: "bg-amber-100",
  Low: "bg-green-100",
};

const initialForm = {
  research_question: RESEARCH_QUESTION,
  target_user: "Caregivers of older adults in Mexico City",
  region: "Mexico",
  source_type: "Desk research",
  key_finding: "",
};

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function Section({ title, subtitle, children, testId }) {
  return (
    <section className="mt-10" data-testid={testId}>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function ResearchDashboard() {
  // ---- Saved research records (Supabase) ----
  const [form, setForm] = useState(initialForm);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  async function loadRecords() {
    setLoading(true);
    setLoadError("");
    try {
      const { data, error } = await supabase
        .from("research_records")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      setLoadError(err?.message || String(err));
    }
    setLoading(false);
  }

  useEffect(() => {
    loadRecords();
  }, []);

  function handleChange(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    const clean = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v.trim()])
    );
    if (Object.values(clean).some((v) => !v)) {
      setSaveMessage({ ok: false, text: "Please fill in every field before saving." });
      return;
    }

    setSaving(true);
    setSaveMessage(null);
    try {
      const { data, error } = await supabase
        .from("research_records")
        .insert(clean)
        .select()
        .single();
      if (error) throw error;
      setSaveMessage({ ok: true, text: `Saved. Record id: ${data.id}` });
      setForm((f) => ({ ...f, key_finding: "" }));
      loadRecords();
    } catch (err) {
      // Show the real error — hiding it is what kept the Week 1 bug invisible.
      setSaveMessage({ ok: false, text: `Save failed: ${err?.message || String(err)}` });
    }
    setSaving(false);
  }

  // ---- Competitor table filter/search ----
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const visible = useMemo(
    () => filterCompetitors(COMPETITORS, { query, type }),
    [query, type]
  );

  const highRisks = RISKS.filter((r) => riskLevel(r) === "High").length;
  const validations = records.filter((r) => r.source_type === "Human validation").length;

  return (
    <div>
      {!supabaseConfigOk && (
        <p className="mt-6 rounded-md bg-red-50 p-3 text-sm text-red-800">
          Database configuration error: check the Supabase environment variables
          in Vercel (no spaces or line breaks) and redeploy.
        </p>
      )}

      <p className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        <span className="font-semibold">Research question: </span>
        {RESEARCH_QUESTION}
      </p>

      {/* 1. Intake + 6. Dashboard widget */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <form
          onSubmit={handleSave}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          data-testid="research-intake"
        >
          <h2 className="text-sm font-semibold text-gray-900">New research record</h2>

          <label className="mt-4 block text-xs font-medium text-gray-600" htmlFor="rq">
            Research question
          </label>
          <textarea
            id="rq"
            rows={2}
            value={form.research_question}
            onChange={handleChange("research_question")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />

          <label className="mt-3 block text-xs font-medium text-gray-600" htmlFor="tu">
            Target user
          </label>
          <input
            id="tu"
            value={form.target_user}
            onChange={handleChange("target_user")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600" htmlFor="rg">
                Region
              </label>
              <input
                id="rg"
                value={form.region}
                onChange={handleChange("region")}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600" htmlFor="st">
                Source type
              </label>
              <select
                id="st"
                value={form.source_type}
                onChange={handleChange("source_type")}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option>Desk research</option>
                <option>Human validation</option>
                <option>Competitor test</option>
              </select>
            </div>
          </div>

          <label className="mt-3 block text-xs font-medium text-gray-600" htmlFor="kf">
            Key finding / gap
          </label>
          <textarea
            id="kf"
            rows={3}
            placeholder="e.g. My interviewee writes readings in a notebook and calls her sister to decide."
            value={form.key_finding}
            onChange={handleChange("key_finding")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />

          <button
            type="submit"
            disabled={saving}
            className="mt-5 w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save research record"}
          </button>

          {saveMessage && (
            <p
              data-testid="save-message"
              className={`mt-2 text-xs ${saveMessage.ok ? "text-emerald-700" : "text-red-700"}`}
            >
              {saveMessage.text}
            </p>
          )}
        </form>

        <div
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          data-testid="dashboard-widget"
        >
          <h2 className="text-sm font-semibold text-gray-900">Research dashboard</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { n: loading ? "…" : records.length, l: "records saved" },
              { n: loading ? "…" : validations, l: "human validations" },
              { n: COMPETITORS.length, l: "competitors" },
              { n: highRisks, l: "high risks" },
            ].map((s) => (
              <div key={s.l} className="rounded-lg border border-gray-200 p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">{s.n}</div>
                <div className="text-xs text-gray-500">{s.l}</div>
              </div>
            ))}
          </div>

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Latest saved records
          </h3>
          {loading && <p className="mt-2 text-xs text-gray-400">Loading...</p>}
          {loadError && (
            <p className="mt-2 text-xs text-red-700">Could not load records: {loadError}</p>
          )}
          {!loading && !loadError && records.length === 0 && (
            <p className="mt-2 text-xs text-gray-400">No research records saved yet.</p>
          )}
          <ul className="mt-2 space-y-2">
            {records.slice(0, 5).map((r) => (
              <li key={r.id} className="rounded-md bg-gray-50 p-2 text-xs text-gray-700">
                <span className="font-semibold">{r.source_type}</span> ·{" "}
                {new Date(r.created_at).toLocaleString("en-US")}
                <div className="mt-0.5 text-gray-600">{r.key_finding}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 2. Global examples */}
      <Section
        title="5 global examples"
        subtitle="How other countries help people decide how urgent a health problem is."
        testId="global-examples"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {GLOBAL_EXAMPLES.map((g) => (
            <article key={g.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900">{g.name}</h3>
              <p className="text-xs text-gray-500">
                {g.country} · {g.model}
              </p>
              <p className="mt-2 text-xs text-gray-700">{g.whatItDoes}</p>
              <p className="mt-2 text-xs text-emerald-800">
                <span className="font-semibold">Lesson: </span>
                {g.lesson}
              </p>
              <a href={g.source} target="_blank" rel="noreferrer" className="mt-2 block text-[11px] text-gray-400 underline">
                {hostOf(g.source)}
              </a>
            </article>
          ))}
        </div>
      </Section>

      {/* 3. Mexico localization */}
      <Section
        title="Mexico localization"
        subtitle="Why the problem is real here."
        testId="mexico"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MEXICO_FACTS.map((f) => (
            <div key={f.id} className="rounded-xl border border-gray-200 bg-[#f3f0ea] p-4">
              <div className="text-2xl font-bold text-gray-900">{f.value}</div>
              <p className="mt-1 text-xs font-medium text-gray-800">{f.label}</p>
              <p className="mt-1 text-xs text-gray-600">{f.detail}</p>
              <a href={f.source} target="_blank" rel="noreferrer" className="mt-2 block text-[11px] text-gray-400 underline">
                {hostOf(f.source)}
              </a>
            </div>
          ))}
        </div>
      </Section>

      {/* 4. Competitor table + filter/search */}
      <Section
        title="8 competitors and substitutes"
        subtitle="Direct = gives an urgency level · Adjacent = solves part of the job · Substitute = what people do instead. Ratings are our own judgement."
        testId="competitors"
      >
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            aria-label="Search competitors"
            placeholder="Search (e.g. free, Mexico, history)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-xs rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                aria-pressed={type === t}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  type === t
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-500" data-testid="result-count">
            Showing {visible.length} of {COMPETITORS.length}
          </span>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[820px] text-left text-xs">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Region</th>
                <th className="p-3 font-medium">Price</th>
                <th className="p-3 font-medium">Gives urgency level?</th>
                <th className="p-3 font-medium">Saves history?</th>
                <th className="p-3 font-medium">Main weakness</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 align-top">
                  <td className="p-3 font-medium text-gray-900">
                    {c.source ? (
                      <a href={c.source} target="_blank" rel="noreferrer" className="hover:underline">
                        {c.name}
                      </a>
                    ) : (
                      c.name
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 ${TYPE_STYLES[c.type]}`}>{c.type}</span>
                  </td>
                  <td className="p-3 text-gray-700">{c.region}</td>
                  <td className="p-3 text-gray-700">{c.price}</td>
                  <td className="p-3 text-gray-700">{c.urgencyLevel}</td>
                  <td className="p-3 text-gray-700">{c.savesHistory}</td>
                  <td className="p-3 text-gray-600">{c.weakness}</td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-400">
                    No competitors match that search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Benchmark cards */}
      <Section
        title="Benchmarks"
        subtitle="What good looks like, and where Vitalis stands."
        testId="benchmarks"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENCHMARKS.map((b) => (
            <div key={b.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900">{b.metric}</h3>
              <p className="mt-2 text-xs text-emerald-800">
                <span className="font-semibold">Vitalis: </span>
                {b.ours}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                <span className="font-semibold">Field: </span>
                {b.field}
              </p>
              {b.source && (
                <a href={b.source} target="_blank" rel="noreferrer" className="mt-2 block text-[11px] text-gray-400 underline">
                  {hostOf(b.source)}
                </a>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* 5. Risk map */}
      <Section
        title="Risk map"
        subtitle="Likelihood × impact. Numbers match the list on the right."
        testId="risk-map"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
          <div>
            <div className="grid grid-cols-[48px_repeat(3,1fr)] gap-1 text-[11px] text-gray-500">
              {[3, 2, 1].map((impact) => (
                <div key={impact} className="contents">
                  <div className="flex items-center">
                    {impact === 3 ? "High" : impact === 2 ? "Med" : "Low"}
                  </div>
                  {[1, 2, 3].map((likelihood) => {
                    const here = RISKS.map((r, i) => ({ ...r, n: i + 1 })).filter(
                      (r) => r.impact === impact && r.likelihood === likelihood
                    );
                    return (
                      <div
                        key={likelihood}
                        className={`flex h-16 flex-wrap content-start gap-1 rounded-md p-1.5 ${
                          LEVEL_STYLES[riskLevel({ likelihood, impact })]
                        }`}
                      >
                        {here.map((r) => (
                          <span
                            key={r.id}
                            title={r.risk}
                            className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-[10px] font-bold text-white"
                          >
                            {r.n}
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
              <div />
              <div className="text-center">Low</div>
              <div className="text-center">Med</div>
              <div className="text-center">High</div>
            </div>
            <p className="mt-1 text-[11px] text-gray-500">↑ impact · likelihood →</p>
          </div>

          <ol className="space-y-2">
            {RISKS.map((r, i) => (
              <li key={r.id} className="rounded-md border border-gray-200 bg-white p-3 text-xs">
                <span className="font-semibold text-gray-900">
                  {i + 1}. {r.risk}
                </span>{" "}
                <span className="text-gray-500">({riskLevel(r)})</span>
                <div className="mt-1 text-gray-600">
                  <span className="font-medium">Mitigation: </span>
                  {r.mitigation}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* Gaps */}
      <Section title="Gaps we found" testId="gaps">
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
          {GAPS.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
