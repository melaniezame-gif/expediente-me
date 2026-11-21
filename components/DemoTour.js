"use client";

import { useState } from "react";
import { DEMO_STEPS } from "@/lib/siteMap";

// Guided walkthrough: a numbered stepper + the active step. Progress lives in
// React state only (nothing saved) — the tester form below records the result.
export default function DemoTour() {
  const [active, setActive] = useState(0);
  const [done, setDone] = useState(() => new Set());
  const step = DEMO_STEPS[active];
  const total = DEMO_STEPS.length;
  const isDone = done.has(step.id);

  function toggleDone() {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(step.id)) next.delete(step.id);
      else next.add(step.id);
      return next;
    });
  }

  function markAndNext() {
    setDone((prev) => new Set(prev).add(step.id));
    if (active < total - 1) setActive(active + 1);
  }

  return (
    <section aria-label="Guided walkthrough" className="mt-6">
      <div className="flex items-center justify-between text-xs text-gray-600">
        <p data-testid="tour-progress">
          {done.size} / {total} steps done
        </p>
        {done.size === total ? (
          <a href="#tester-form" className="font-semibold text-emerald-700 underline">
            All done — tell us how it went ↓
          </a>
        ) : null}
      </div>
      <div
        className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done.size}
        aria-label="Walkthrough progress"
      >
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(done.size / total) * 100}%` }} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[17rem_1fr]">
        <ol className="flex gap-2 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-2 md:flex-col md:overflow-visible">
          {DEMO_STEPS.map((s, i) => {
            const current = i === active;
            return (
              <li key={s.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-current={current ? "step" : undefined}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                    current ? "border border-emerald-700 bg-emerald-50 font-semibold text-gray-900" : "text-gray-700 hover:bg-white"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      done.has(s.id) ? "bg-emerald-600 text-white" : "border border-gray-300 bg-white text-gray-600"
                    }`}
                    aria-hidden="true"
                  >
                    {done.has(s.id) ? "✓" : i + 1}
                  </span>
                  <span className="whitespace-nowrap md:whitespace-normal">{s.title}</span>
                  {done.has(s.id) ? <span className="sr-only">(done)</span> : null}
                </button>
              </li>
            );
          })}
        </ol>

        <article className="rounded-xl border-2 border-gray-300 bg-white p-5 sm:p-6" aria-live="polite">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Step {active + 1} of {total} · <code className="normal-case">{step.href}</code>
          </p>
          <h2 className="mt-1 text-xl font-bold text-gray-900" data-testid="tour-title">
            {step.title}
          </h2>
          <p className="mt-3 text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Why it exists: </span>
            {step.why}
          </p>
          <p className="mt-4 text-sm font-semibold text-gray-900">Try this</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-gray-700">
            {step.tryThis.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <span className="font-semibold">Expected: </span>
            {step.expected}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={step.href}
              target="_blank"
              rel="noopener"
              className="rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-700"
            >
              Open {step.href} ↗
            </a>
            <button
              type="button"
              onClick={toggleDone}
              aria-pressed={isDone}
              className="rounded-full border border-emerald-700 px-5 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
            >
              {isDone ? "Done ✓ (undo)" : "Mark as done"}
            </button>
            <div className="flex gap-2 sm:ml-auto">
              <button
                type="button"
                onClick={() => setActive(Math.max(0, active - 1))}
                disabled={active === 0}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700 disabled:opacity-40"
              >
                ← Back
              </button>
              {active < total - 1 ? (
                <button
                  type="button"
                  onClick={markAndNext}
                  className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900"
                >
                  Done, next →
                </button>
              ) : (
                <a href="#tester-form" onClick={markAndNext} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900">
                  Finish ↓
                </a>
              )}
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">The page opens in a new tab, so this tour keeps your place.</p>
        </article>
      </div>
    </section>
  );
}
