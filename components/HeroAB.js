"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { INTERNAL_KEY, assignVariant, isInternalVisit } from "@/lib/abTest";
import { AB_TESTS } from "@/lib/marketingData";

const STORE_KEY = "vitalis_ab"; // { visitorId, hero_headline: "A", cta_text: "B", logged: { "hero_headline:view": true } }
const HEADLINE = AB_TESTS.find((t) => t.id === "hero_headline");
const CTA = AB_TESTS.find((t) => t.id === "cta_text");

function readStore() {
  try {
    return JSON.parse(window.localStorage.getItem(STORE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function writeStore(store) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // Private mode / blocked storage: the test still works for this page view.
  }
}

function readInternalFlag(param) {
  try {
    const internal = isInternalVisit({ storedFlag: window.localStorage.getItem(INTERNAL_KEY), param });
    if (internal) window.localStorage.setItem(INTERNAL_KEY, "1");
    else window.localStorage.removeItem(INTERNAL_KEY);
    return internal;
  } catch {
    return param === "1";
  }
}

function newVisitorId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Inserts one event per visitor per test (view or click). Returns when done or failed.
async function logOnce(store, testId, variant, event) {
  const key = `${testId}:${event}`;
  if (store.logged?.[key]) return;
  const { error } = await supabase
    .from("ab_events")
    .insert({ test_id: testId, variant, event, visitor_id: store.visitorId });
  if (error) {
    console.error(`A/B ${key} insert failed:`, error);
    return;
  }
  // Only mark as logged after Supabase confirms the insert.
  const fresh = readStore();
  fresh.logged = { ...(fresh.logged || {}), [key]: true };
  writeStore(fresh);
  store.logged = fresh.logged;
}

export default function HeroAB() {
  const [state, setState] = useState(null); // { headline, cta, preview, internal }
  const storeRef = useRef(null);
  const loggedViews = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const override = params.get("ab");
    const store = readStore();
    if (!store.visitorId) store.visitorId = newVisitorId();
    const headline = assignVariant({ override, stored: store.hero_headline });
    const cta = assignVariant({ override, stored: store.cta_text });
    const preview = Boolean(override && /^[ab]$/i.test(override));
    // Fix (Week 4 live test): the founder's own test visits were mixed with
    // real visitors. A preview also marks this browser as a team browser.
    const internal = readInternalFlag(preview ? "1" : params.get("internal"));

    // A forced preview (?ab=B) must not overwrite the visitor's real assignment
    // or pollute the results, so nothing is saved or logged in preview mode.
    if (!preview) {
      store.hero_headline = headline;
      store.cta_text = cta;
      writeStore(store);
    }
    storeRef.current = store;
    setState({ headline, cta, preview, internal });

    if (!preview && !internal && !loggedViews.current) {
      loggedViews.current = true; // React dev mode runs effects twice
      logOnce(store, "hero_headline", headline, "view").then(() => logOnce(store, "cta_text", cta, "view"));
    }
  }, []);

  async function handleClick(e) {
    e.preventDefault();
    const href = e.currentTarget.getAttribute("href");
    if (state && !state.preview && !state.internal && storeRef.current) {
      const store = storeRef.current;
      // Don't make the user wait more than ~1 s for the tracking call.
      await Promise.race([
        Promise.all([
          logOnce(store, "hero_headline", state.headline, "click"),
          logOnce(store, "cta_text", state.cta, "click"),
        ]),
        new Promise((r) => setTimeout(r, 1000)),
      ]);
    }
    window.location.href = href;
  }

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-emerald-700">
        For patients and caregivers in Mexico
      </p>
      <h1
        className="min-h-[5.5rem] text-3xl font-bold leading-tight text-gray-900 md:min-h-[7.5rem] md:text-[2.6rem]"
        data-testid="hero-headline"
        data-variant={state?.headline || ""}
      >
        {state ? HEADLINE.variants[state.headline] : ""}
      </h1>
      <p className="mt-4 max-w-xl text-gray-600">
        Enter temperature, heart rate, oxygen and pain. Vitalis turns them into one clear light — Stable, Review or
        Attention — with what to do next. Free, no account needed.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <a
          href="/core"
          onClick={handleClick}
          data-testid="hero-cta"
          data-variant={state?.cta || ""}
          className="inline-block min-w-[11rem] rounded-md bg-emerald-700 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
        >
          {state ? CTA.variants[state.cta] : "Start the check"}
        </a>
        <span className="text-xs text-gray-500">≈ 30 seconds · not a diagnosis</span>
      </div>
      {state?.internal && !state.preview && (
        <p className="mt-3 inline-block rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
          Team browser: your visits are not counted in the A/B results.{" "}
          <a href="/?internal=0" className="underline">Count me again</a>
        </p>
      )}
      {state?.preview && (
        <p className="mt-3 inline-block rounded bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
          Preview mode: showing variant {state.headline}. Not counted in the A/B results.
        </p>
      )}
    </div>
  );
}
