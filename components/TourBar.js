"use client";

import { useEffect, useState } from "react";
import { DEMO_STEPS, tourHref } from "@/lib/siteMap";

const KEY = "vitalis-tour-done";

// Progress lives in sessionStorage (one browser tab, one visit). Wrapped in
// try/catch: some browsers block storage — the tour must still work.
export function readTourDone() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function markDone(id) {
  try {
    const done = new Set(readTourDone());
    done.add(id);
    sessionStorage.setItem(KEY, JSON.stringify([...done]));
  } catch {
    // ignore — progress is a convenience, not required
  }
}

// Week 6 iteration (external tester U4): the tour used to open every page in
// a new tab with the instructions left behind on /demo. Now the instructions
// travel with you: any page opened with ?tour=N shows them at the TOP of the
// page, and a second "Next step" at the END. Nothing is fixed/floating — a
// fixed bottom bar was tried first and covered the chat buttons on phones.
export default function TourBar({ position = "top" }) {
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    const n = Number(new URLSearchParams(window.location.search).get("tour"));
    const i = Number.isInteger(n) ? n - 1 : -1;
    if (i >= 0 && i < DEMO_STEPS.length && window.location.pathname === DEMO_STEPS[i].href) setIndex(i);
  }, []);

  if (index < 0) return null;
  const step = DEMO_STEPS[index];
  const total = DEMO_STEPS.length;
  const last = index === total - 1;
  const nextHref = last ? "/demo?tour=done#tester-form" : tourHref(index + 1);
  const nextLabel = last ? "Finish — give feedback" : "Next step →";

  if (position === "bottom") {
    return (
      <div className="mx-auto mt-10 max-w-4xl px-4 sm:px-6" data-testid="tour-bar-bottom">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-emerald-600 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-gray-900">
            Done with step {index + 1} of {total}?
          </p>
          <a
            href={nextHref}
            onClick={() => markDone(step.id)}
            className="rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-700"
          >
            {nextLabel}
          </a>
        </div>
      </div>
    );
  }

  return (
    <aside aria-label="Guided tour" data-testid="tour-bar" className="border-b-2 border-emerald-600 bg-emerald-50">
      <div className="mx-auto grid max-w-6xl gap-3 px-4 py-4 sm:px-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-sm font-bold text-gray-900">
            <span className="mr-2 rounded-full bg-emerald-700 px-2 py-0.5 text-xs text-white">
              Tour · step {index + 1} of {total}
            </span>
            {step.title}
          </p>
          <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-sm text-gray-800">
            {step.doThis.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
          <p className="mt-1 text-xs text-gray-600">
            <span className="font-semibold">You should see: </span>
            {step.expected}
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/demo" className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700">
            Exit tour
          </a>
          <a
            href={nextHref}
            onClick={() => markDone(step.id)}
            className="rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-700"
            data-testid="tour-next"
          >
            {nextLabel}
          </a>
        </div>
      </div>
    </aside>
  );
}
