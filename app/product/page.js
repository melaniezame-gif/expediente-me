import { FEATURE_MAP, SEGMENTS, TIERS } from "@/lib/pricing";

export const metadata = {
  title: "Product — Vitalis",
};

function Cell({ value, highlight }) {
  const base = `p-3 text-center ${highlight ? "bg-emerald-50/60" : ""}`;
  if (value === true) return <td className={`${base} font-bold text-emerald-700`}>✓</td>;
  if (value === false) return <td className={`${base} text-gray-400`}>—</td>;
  return <td className={`${base} text-gray-700`}>{value}</td>;
}

export default function ProductPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        Week 3 · Product Architecture
      </p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">
        One place for your vital signs and medical records
      </h1>
      <p className="mt-2 max-w-3xl text-sm text-gray-600">
        Vitalis has three plans: two for individuals and families, and one for small clinics in Mexico.
      </p>

      {/* Customer segments */}
      <section className="mt-8 grid gap-4 md:grid-cols-2" data-testid="segments">
        {SEGMENTS.map((s) => (
          <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-semibold text-gray-900">{s.name}</p>
            <p className="mt-1 text-sm text-gray-600">{s.who}</p>
            <p className="mt-2 text-xs text-gray-500">Plans: {s.tiers.join(", ")}</p>
          </div>
        ))}
      </section>

      {/* Feature map */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900">Feature map</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[560px] text-left text-sm" data-testid="feature-map">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="p-3 font-semibold text-gray-700">Feature</th>
                <th className="p-3 text-center font-semibold text-gray-700">Free</th>
                <th className="bg-emerald-50 p-3 text-center font-semibold text-emerald-800">Plus</th>
                <th className="p-3 text-center font-semibold text-gray-700">Clinic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {FEATURE_MAP.map((row) => (
                <tr key={row.feature}>
                  <td className="p-3 font-medium text-gray-800">{row.feature}</td>
                  <Cell value={row.free} />
                  <Cell value={row.plus} highlight />
                  <Cell value={row.clinic} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing tiers */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900">Plans</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-3" data-testid="tiers">
          {TIERS.map((t) => (
            <div
              key={t.id}
              className={`relative rounded-xl p-5 ${
                t.recommended
                  ? "border-2 border-emerald-600 bg-emerald-50/40"
                  : "border border-gray-200 bg-white"
              }`}
            >
              {t.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-700 px-3 py-0.5 text-[10px] font-bold uppercase text-white">
                  Recommended
                </span>
              )}
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                {t.name} · {t.segment}
              </p>
              <p className="mt-2 text-3xl font-extrabold text-gray-900">
                ${t.price} <span className="text-xs font-normal text-gray-500">MXN / month</span>
              </p>
              <p className="mt-2 text-sm text-gray-600">{t.audience}</p>
              <ul className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm text-gray-700">
                {t.highlights.map((h) => (
                  <li key={h}>✓ {h}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <a
          href="/pricing"
          className="mt-8 inline-block rounded-md bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Open the revenue simulator
        </a>
      </section>
    </div>
  );
}
