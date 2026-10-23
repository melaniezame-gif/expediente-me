import HeroAB from "@/components/HeroAB";
import { MEXICO_FACTS } from "@/lib/researchData";
import { TIERS } from "@/lib/pricing";
import { BRAND, FAQ } from "@/lib/marketingData";

const STAT_IDS = ["hypertension", "digital", "pharmacy"];

const STEPS = [
  { n: "1", title: "Enter 4 readings", text: "Temperature, heart rate, oxygen (SpO₂) and pain from 0 to 10 — all things you can measure at home." },
  { n: "2", title: "Get your light", text: "Stable, Review or Attention, with the score and a clear next step. You always see why." },
  { n: "3", title: "Save and share", text: "Keep a history to show the doctor and share with the family instead of a long WhatsApp thread." },
];

export default function HomePage() {
  const stats = STAT_IDS.map((id) => MEXICO_FACTS.find((f) => f.id === id)).filter(Boolean);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-emerald-100 bg-gradient-to-b from-emerald-50/70 to-transparent">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.25fr_1fr] md:items-center md:py-20">
          <HeroAB />

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm" aria-label="Example result">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Example result</p>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-2xl font-bold text-amber-700">Review</p>
              <p className="font-mono text-sm text-gray-500">score 4 / 8</p>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center font-mono text-xs">
              {[["37.5", "°C"], ["105", "bpm"], ["93", "% SpO₂"], ["5", "pain"]].map(([v, u]) => (
                <div key={u} className="rounded-lg bg-gray-50 p-2">
                  <p className="text-base font-semibold text-gray-900">{v}</p>
                  <p className="text-gray-500">{u}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              Some vital signs are out of range. A medical check-up within the next few hours is recommended.
            </p>
            <div className="mt-4 flex gap-2 text-center text-xs font-semibold">
              <span className="flex-1 rounded-md bg-green-50 py-1.5 text-green-700">Stable 0–1</span>
              <span className="flex-1 rounded-md bg-amber-100 py-1.5 text-amber-800">Review 2–4</span>
              <span className="flex-1 rounded-md bg-red-50 py-1.5 text-red-700">Attention 5–8</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        {/* Problem */}
        <section className="py-14" data-testid="problem-stats">
          <h2 className="text-xl font-bold text-gray-900 md:text-2xl">The worrying reading happens at home</h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Families measure more at home than ever, but the numbers alone don&apos;t say whether to wait, book a
            check-up or go now.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {stats.map((s) => (
              <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="text-3xl font-extrabold text-emerald-700">{s.value}</p>
                <p className="mt-2 text-sm text-gray-700">{s.label}</p>
                <a href={s.source} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-gray-400 underline hover:text-gray-600">
                  Source
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-8 border-t border-gray-200 py-14">
          <h2 className="text-xl font-bold text-gray-900 md:text-2xl">How it works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-xl border border-gray-200 bg-white p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
                  {s.n}
                </span>
                <p className="mt-3 font-semibold text-gray-900">{s.title}</p>
                <p className="mt-1 text-sm text-gray-600">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Plans */}
        <section className="border-t border-gray-200 py-14" data-testid="home-plans">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-900 md:text-2xl">Start free. Upgrade when the family needs it.</h2>
            <a href="/product" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              Compare all features →
            </a>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {TIERS.map((t) => (
              <div
                key={t.id}
                className={`rounded-xl p-5 ${t.recommended ? "border-2 border-emerald-600 bg-emerald-50/40" : "border border-gray-200 bg-white"}`}
              >
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{t.name}</p>
                <p className="mt-1 text-2xl font-extrabold text-gray-900">
                  ${t.price} <span className="text-xs font-normal text-gray-500">MXN / month</span>
                </p>
                <p className="mt-2 text-sm text-gray-600">{t.audience}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust + FAQ */}
        <section className="grid gap-8 border-t border-gray-200 py-14 md:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-xl font-bold text-gray-900 md:text-2xl">No black box</h2>
            <p className="mt-3 text-sm text-gray-600">
              Vitalis uses a fixed, published rule set inspired by hospital early-warning scores. Every point is
              explainable, nothing is guessed by AI. It is an educational tool, not a diagnosis.
            </p>
            <p className="mt-4 rounded-lg border border-gray-300 bg-white p-3 text-sm font-semibold text-gray-900">
              In an emergency, call 911.
            </p>
          </div>
          <div className="space-y-2" data-testid="faq">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-lg border border-gray-200 bg-white p-4">
                <summary className="cursor-pointer list-none font-medium text-gray-900">
                  <span className="mr-2 inline-block text-emerald-700 transition group-open:rotate-90">▸</span>
                  {f.q}
                </summary>
                <p className="mt-2 pl-5 text-sm text-gray-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      {/* Final CTA */}
      <section className="bg-gray-900">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 md:flex-row md:items-center">
          <div>
            <p className="text-xl font-bold text-white">{BRAND.tagline}</p>
            <p className="mt-1 text-sm text-gray-300">Run your first check now — it takes about 30 seconds.</p>
          </div>
          <a href="/core" className="rounded-md bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500">
            Run my first check
          </a>
        </div>
      </section>
    </div>
  );
}
