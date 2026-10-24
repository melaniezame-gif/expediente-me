"use client";

import { analyzeABTest, formatPct, summarizeEvents, MIN_VIEWS_PER_VARIANT } from "@/lib/abTest";
import { AB_TESTS } from "@/lib/marketingData";

const VERDICT_STYLE = {
  winner: "bg-emerald-50 text-emerald-800",
  no_difference: "bg-gray-100 text-gray-700",
  keep_running: "bg-gray-100 text-gray-700",
};

function Bar({ value, max }) {
  const width = max > 0 ? Math.max(2, (value / max) * 100) : 2;
  return (
    <div className="h-2 w-full rounded bg-gray-100">
      <div className="h-2 rounded bg-emerald-600" style={{ width: `${width}%` }} />
    </div>
  );
}

export default function ABTester({ events, loading, error, onRefresh }) {
  return (
    <section id="ab" className="scroll-mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">A/B tester</h2>
          <p className="text-sm text-gray-600">
            Live from the homepage. Each visitor sees A or B (50/50, sticky); we count unique viewers and unique CTA
            clickers. Minimum {MIN_VIEWS_PER_VARIANT} visitors per variant before calling a winner (two-proportion z-test).
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50"
        >
          {loading ? "Loading…" : "Refresh results"}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">Could not load A/B events: {error}</p>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2" data-testid="ab-tests">
        {AB_TESTS.map((t) => {
          const summary = summarizeEvents(events, t.id);
          const r = analyzeABTest(summary);
          const maxCtr = Math.max(r.ctrA, r.ctrB);
          return (
            <div key={t.id} className="rounded-xl border border-gray-200 bg-white p-5" data-testid={`ab-${t.id}`}>
              <p className="font-semibold text-gray-900">{t.name}</p>
              <p className="mt-1 text-xs text-gray-500">Hypothesis: {t.hypothesis}</p>
              <table className="mt-4 w-full text-left text-sm">
                <thead className="text-xs text-gray-500">
                  <tr>
                    <th className="pb-2 font-medium">Variant</th>
                    <th className="w-14 pb-2 pl-3 text-right font-medium">Views</th>
                    <th className="w-14 pb-2 pl-3 text-right font-medium">Clicks</th>
                    <th className="w-14 pb-2 pl-3 text-right font-medium">CTR</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {["A", "B"].map((v) => {
                    const ctr = v === "A" ? r.ctrA : r.ctrB;
                    return (
                      <tr key={v} className="border-t border-gray-100">
                        <td className="py-2 pr-2">
                          <span className="mr-2 font-mono font-bold">{v}</span>
                          <span className="text-gray-700">“{t.variants[v]}”</span>
                          <div className="mt-1.5"><Bar value={ctr} max={maxCtr} /></div>
                        </td>
                        <td className="py-2 text-right font-mono">{summary[v].views}</td>
                        <td className="py-2 text-right font-mono">{summary[v].clicks}</td>
                        <td className="py-2 text-right font-mono font-semibold">{formatPct(ctr)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className={`mt-3 rounded-md px-3 py-2 text-sm font-medium ${VERDICT_STYLE[r.verdict]}`} role="status">
                {r.message}
                {r.lift !== null && r.verdict !== "keep_running" && (
                  <span className="font-normal"> Lift of B vs A: {r.lift >= 0 ? "+" : ""}{formatPct(r.lift)}.</span>
                )}
              </p>
              <div className="mt-3 flex gap-3 text-xs">
                <a href="/?ab=A" target="_blank" rel="noreferrer" className="font-semibold text-emerald-700 hover:underline">
                  Preview A ↗
                </a>
                <a href="/?ab=B" target="_blank" rel="noreferrer" className="font-semibold text-emerald-700 hover:underline">
                  Preview B ↗
                </a>
                <span className="text-gray-400">Previews are not counted.</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
