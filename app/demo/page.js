import DemoTour from "@/components/DemoTour";
import DemoTesting from "@/components/DemoTesting";
import { AGENTS } from "@/lib/siteMap";
import { HARMS, ROADMAP, VALUE, VIABILITY_NOTES, viabilitySnapshot } from "@/lib/impact";
import { formatMXN } from "@/lib/pricing";

export const metadata = {
  title: "Demo — Vitalis",
  description: "A 5-minute guided walkthrough of the whole Vitalis venture: agent map, impact check, testing summary and V2 roadmap.",
};

const KIND_STYLE = {
  rule: { box: "border-emerald-600 bg-emerald-50", tag: "bg-emerald-100 text-emerald-800", label: "Rule-based agent" },
  human: { box: "border-amber-500 bg-amber-50", tag: "bg-amber-100 text-amber-900", label: "Human checkpoint" },
  coding: { box: "border-slate-500 bg-slate-50", tag: "bg-slate-200 text-slate-800", label: "Coding agent (AI)" },
};

const HARM_STATUS = {
  Mitigated: "bg-emerald-100 text-emerald-800",
  "Partly mitigated": "bg-amber-100 text-amber-900",
};

const JUMPS = [
  ["#agent-map", "Agent map"],
  ["#impact", "Impact check"],
  ["#roadmap", "V2 roadmap"],
  ["#testing", "Testing summary"],
  ["#tester-form", "I finished the walkthrough"],
];

export default function DemoPage() {
  const viability = viabilitySnapshot();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Week 6 · Integrated agentic venture</p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900">Guided walkthrough: Vitalis in 5 minutes</h1>
      <p className="mt-2 max-w-3xl text-sm text-gray-600">
        Vitalis helps caregivers and adults in Mexico decide, in under a minute, whether a vital-signs reading taken at home
        is urgent. Follow the 7 steps below — each one opens a live part of the site — then see who does what (agent map),
        whether it helps without hurting (impact check), what comes next and how real people rated it.
      </p>
      <nav aria-label="On this page" className="mt-4 flex flex-wrap gap-2 text-sm">
        {JUMPS.map(([href, label]) => (
          <a key={href} href={href} className="rounded-full border border-gray-300 bg-white px-3 py-1 text-gray-700 hover:border-gray-500">
            {label}
          </a>
        ))}
      </nav>

      <DemoTour />

      {/* ---------- Agent map ---------- */}
      <section id="agent-map" className="mt-14 scroll-mt-6">
        <h2 className="text-xl font-bold text-gray-900">Agent map</h2>
        <p className="mt-1 max-w-3xl text-sm text-gray-600">
          Who — or what — acts in Vitalis, on what input, where the result is stored and where a human checks it. Only one
          agent uses generative AI, and it writes code, not medical answers.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          {Object.values(KIND_STYLE).map((k) => (
            <span key={k.label} className={`rounded-full px-2 py-0.5 font-semibold ${k.tag}`}>
              {k.label}
            </span>
          ))}
        </div>

        <div className="mt-4 grid items-stretch gap-3 lg:grid-cols-[1fr_auto_2.4fr_auto_1fr]">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
            <p className="font-semibold text-gray-900">Inputs</p>
            <ul className="mt-2 space-y-1 text-gray-700">
              <li>4 home readings</li>
              <li>Chat messages + intake answers</li>
              <li>Desk research + interviews</li>
              <li>Pricing assumptions</li>
              <li>Landing-page visitors</li>
              <li>Tester feedback</li>
            </ul>
          </div>
          <div className="hidden items-center text-2xl text-gray-400 lg:flex" aria-hidden="true">→</div>
          <ul className="grid gap-3 sm:grid-cols-2" data-testid="agent-list">
            {AGENTS.map((a) => {
              const k = KIND_STYLE[a.kind];
              return (
                <li key={a.id} className={`rounded-xl border-l-4 p-3 text-sm ${k.box}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold text-gray-900">{a.name}</p>
                    <code className="text-xs text-gray-500">{a.page}</code>
                  </div>
                  <p className="mt-1 text-gray-700">
                    <span className="text-xs font-semibold uppercase text-gray-500">In </span>
                    {a.input}
                  </p>
                  <p className="text-gray-700">
                    <span className="text-xs font-semibold uppercase text-gray-500">Out </span>
                    {a.output}
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    <span className="font-semibold">Human check: </span>
                    {a.checkpoint}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {a.ai ? "Uses generative AI" : "No generative AI"} · <code>{a.file}</code>
                  </p>
                </li>
              );
            })}
          </ul>
          <div className="hidden items-center text-2xl text-gray-400 lg:flex" aria-hidden="true">→</div>
          <div className="rounded-xl border border-dashed border-gray-400 bg-white p-4 text-sm">
            <p className="font-semibold text-gray-900">Stored in Supabase</p>
            <ul className="mt-2 space-y-1 font-mono text-xs text-gray-700">
              {[...new Set(AGENTS.flatMap((a) => a.table.split(" · ")))]
                .filter((t) => /^[a-z_]+$/.test(t))
                .map((t) => (
                  <li key={t}>{t}</li>
                ))}
              <li>site_tests</li>
            </ul>
            <p className="mt-3 text-xs text-gray-500">
              All shown together on <a href="/dashboard" className="underline">/dashboard</a>. Anon users can insert and read, never
              edit or delete.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Impact check ---------- */}
      <section id="impact" className="mt-14 scroll-mt-6">
        <h2 className="text-xl font-bold text-gray-900">Practical impact check</h2>
        <p className="mt-1 max-w-3xl text-sm text-gray-600">
          Does it create value, and does it avoid obvious harm? Every harm lists the mitigation and where you can check it
          on the site. Open items are not hidden — they lead the V2 roadmap.
        </p>

        <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-emerald-800">Value created</h3>
        <ul className="mt-2 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {VALUE.map((v) => (
            <li key={v.id} className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm">
              <p className="font-semibold text-gray-900">{v.claim}</p>
              <p className="mt-1 text-gray-700">{v.detail}</p>
              <p className="mt-2 text-xs text-gray-600">
                <span className="font-semibold">Evidence: </span>
                {v.evidence}
              </p>
            </li>
          ))}
        </ul>

        <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-red-800">Possible harms → mitigation</h3>
        <div className="mt-2 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2">Harm</th>
                <th className="px-3 py-2">Who</th>
                <th className="px-3 py-2">Mitigation</th>
                <th className="px-3 py-2">Where</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 align-top">
              {HARMS.map((h) => (
                <tr key={h.id}>
                  <td className="px-3 py-2 font-medium text-gray-900">{h.harm}</td>
                  <td className="px-3 py-2 text-gray-700">{h.who}</td>
                  <td className="px-3 py-2 text-gray-700">{h.mitigation}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">{h.where}</td>
                  <td className="px-3 py-2">
                    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${HARM_STATUS[h.status] || "bg-red-100 text-red-800"}`}>
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-gray-700">Viability snapshot</h3>
        <div className="mt-2 grid gap-3 md:grid-cols-3">
          {viability.map((v) => (
            <div key={v.name} className="rounded-xl border border-gray-200 bg-white p-4 text-sm">
              <p className="font-semibold text-gray-900">{v.name}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{formatMXN(v.monthlyRevenue)}</p>
              <p className="text-xs text-gray-500">per month · {formatMXN(v.annualRevenue)} per year</p>
              <p className="mt-2 text-xs text-gray-600">
                {v.inputs.b2cUsers.toLocaleString("en-US")} users × {v.inputs.plusConversion}% on Plus + {v.inputs.clinics} clinics
              </p>
            </div>
          ))}
        </div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
          {VIABILITY_NOTES.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
        <p className="mt-1 text-xs text-gray-500">
          Same formula as <a href="/pricing" className="underline">/pricing</a> — a test fails if the numbers ever drift apart.
        </p>
      </section>

      {/* ---------- V2 roadmap ---------- */}
      <section id="roadmap" className="mt-14 scroll-mt-6">
        <h2 className="text-xl font-bold text-gray-900">Version 2 roadmap</h2>
        <p className="mt-1 max-w-3xl text-sm text-gray-600">
          What we&apos;d build next and why — each item comes from an open harm, a scope cut or a pricing-plan promise.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            ["now", "Now", "Before real patients"],
            ["next", "Next", "To earn the Plus plan"],
            ["later", "Later", "To reach clinics"],
          ].map(([key, title, sub]) => (
            <div key={key} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-bold text-gray-900">{title}</p>
              <p className="text-xs text-gray-500">{sub}</p>
              <ol className="mt-3 space-y-3">
                {ROADMAP[key].map((r) => (
                  <li key={r.item} className="rounded-lg bg-white p-3 text-sm shadow-sm">
                    <p className="font-medium text-gray-900">{r.item}</p>
                    <p className="mt-1 text-xs text-gray-600">Why: {r.why}</p>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <DemoTesting />
    </div>
  );
}
