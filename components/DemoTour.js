"use client";

import { useEffect, useState } from "react";
import { DEMO_STEPS, tourHref } from "@/lib/siteMap";
import { readTourDone } from "@/components/TourBar";

// The tour's starting point on /demo: what will happen, one button to start.
// The step-by-step instructions appear on each page (components/TourBar.js),
// in the same tab, so the visitor never has to come back here mid-tour.
export default function DemoTour() {
  const [done, setDone] = useState([]);

  useEffect(() => {
    setDone(readTourDone());
  }, []);

  const total = DEMO_STEPS.length;
  const nextIndex = DEMO_STEPS.findIndex((s) => !done.includes(s.id));
  const finished = done.length > 0 && nextIndex === -1;
  const started = done.length > 0;

  return (
    <section aria-label="Guided tour" className="mt-6 rounded-2xl border-2 border-emerald-600 bg-white p-5 sm:p-7">
      <p className="text-sm font-semibold text-emerald-800" data-testid="tour-progress">
        {finished ? "Tour finished ✓" : `${done.length} of ${total} steps done · about 5 minutes`}
      </p>
      <ol className="mt-4 space-y-3">
        {DEMO_STEPS.map((s, i) => {
          const isDone = done.includes(s.id);
          return (
            <li key={s.id} className="flex gap-3">
              <span
                aria-hidden="true"
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isDone ? "bg-emerald-600 text-white" : "border-2 border-gray-300 text-gray-600"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </span>
              <div>
                <p className="font-semibold text-gray-900">
                  {s.title}
                  {isDone ? <span className="sr-only"> (done)</span> : null}
                </p>
                <p className="text-sm text-gray-600">{s.doThis[0]}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {finished ? (
          <a href="#tester-form" className="rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-800">
            Tell us how it went ↓
          </a>
        ) : (
          <a
            href={tourHref(started ? nextIndex : 0)}
            className="rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-800"
            data-testid="tour-start"
          >
            {started ? `Continue with step ${nextIndex + 1} →` : "Start the tour →"}
          </a>
        )}
        <p className="text-sm text-gray-600">
          Each page shows a green box at the top telling you exactly what to do, with a <strong>Next step</strong> button.
        </p>
      </div>
    </section>
  );
}
