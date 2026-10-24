"use client";

import { useEffect, useState } from "react";
import { supabase, supabaseConfigOk } from "@/lib/supabaseClient";
import { analyzeABTest, summarizeEvents } from "@/lib/abTest";
import { downloadFile } from "@/lib/browserUtils";
import { AB_TESTS, BRAND, PERSONA, toCSV } from "@/lib/marketingData";
import ABTester from "@/components/ABTester";
import CampaignCalendar from "@/components/CampaignCalendar";
import ContentLibrary from "@/components/ContentLibrary";

const SAVED_LIMIT = 12;

const SAVED_COLUMNS = [
  { key: "created_at", label: "Saved at" },
  { key: "asset_id", label: "Asset" },
  { key: "asset_type", label: "Type" },
  { key: "channel", label: "Channel" },
  { key: "title", label: "Title" },
  { key: "body", label: "Text" },
  { key: "id", label: "Row id" },
];

function Stat({ label, value, hint }) {
  return (
    <div className="rounded-lg bg-white/70 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 font-mono text-xl font-bold text-gray-900">{value}</p>
      {hint && <p className="text-[11px] text-gray-500">{hint}</p>}
    </div>
  );
}

export default function MarketingEngine() {
  const [assets, setAssets] = useState([]);
  const [assetsTotal, setAssetsTotal] = useState(0);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [assetsError, setAssetsError] = useState("");

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");

  async function loadAssets() {
    setAssetsLoading(true);
    setAssetsError("");
    try {
      const { data, error, count } = await supabase
        .from("marketing_assets")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(SAVED_LIMIT);
      if (error) throw error;
      setAssets(data || []);
      setAssetsTotal(count ?? (data || []).length);
    } catch (err) {
      console.error("Load marketing assets failed:", err);
      setAssetsError(err?.message || String(err));
    }
    setAssetsLoading(false);
  }

  async function loadEvents() {
    setEventsLoading(true);
    setEventsError("");
    try {
      const { data, error } = await supabase
        .from("ab_events")
        .select("test_id, variant, event, visitor_id")
        .limit(10000);
      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error("Load A/B events failed:", err);
      setEventsError(err?.message || String(err));
    }
    setEventsLoading(false);
  }

  useEffect(() => {
    loadAssets();
    loadEvents();
  }, []);

  async function exportSaved() {
    const { data, error } = await supabase
      .from("marketing_assets")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setAssetsError(error.message);
      return;
    }
    downloadFile("vitalis-saved-assets.csv", toCSV(data || [], SAVED_COLUMNS), "text/csv");
  }

  const visitors = new Set(events.filter((e) => e.event === "view").map((e) => e.visitor_id)).size;
  const leaders = AB_TESTS.map((t) => {
    const r = analyzeABTest(summarizeEvents(events, t.id));
    if (r.verdict === "winner") return `${r.winner} (winner)`;
    return r.leader ? `${r.leader} (leading)` : "—";
  });

  return (
    <div className="mt-8 space-y-12">
      {!supabaseConfigOk && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          Database configuration error: check the Supabase environment variables in Vercel and redeploy.
        </p>
      )}

      {/* Dashboard widget */}
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4" data-testid="marketing-widget">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Marketing dashboard · live</p>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Assets saved" value={assetsLoading ? "…" : assetsError ? "!" : assetsTotal} hint="marketing_assets" />
          <Stat label="A/B visitors" value={eventsLoading ? "…" : eventsError ? "!" : visitors} hint="unique homepage viewers" />
          <Stat label="Test 1 · headline" value={eventsLoading ? "…" : leaders[0]} />
          <Stat label="Test 2 · CTA" value={eventsLoading ? "…" : leaders[1]} />
        </div>
      </section>

      {/* Brand system + persona */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5" data-testid="brand-system">
          <h2 className="text-lg font-semibold text-gray-900">Brand system</h2>
          <p className="mt-1 text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{BRAND.name}</span> — “{BRAND.tagline}” {BRAND.promise}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {BRAND.colors.map((c) => (
              <div key={c.hex} title={c.use}>
                <div className="h-12 rounded-md ring-1 ring-black/10" style={{ backgroundColor: c.hex }} />
                <p className="mt-1 text-[11px] font-semibold leading-tight text-gray-800">{c.name}</p>
                <p className="font-mono text-[10px] text-gray-500">{c.hex}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 rounded-md bg-gray-50 p-2 text-xs text-gray-600">{BRAND.colorRule}</p>
          <ul className="mt-3 space-y-1 text-xs text-gray-600">
            {BRAND.type.map((t) => (
              <li key={t.level}>
                <span className="font-semibold text-gray-800">{t.level}:</span> {t.spec}
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase text-emerald-700">Voice — do</p>
              <ul className="mt-1 space-y-1 text-xs text-gray-700">
                {BRAND.voiceDo.map((v) => <li key={v}>✓ {v}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-gray-500">Voice — don&apos;t</p>
              <ul className="mt-1 space-y-1 text-xs text-gray-700">
                {BRAND.voiceDont.map((v) => <li key={v}>✕ {v}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5" data-testid="persona">
          <h2 className="text-lg font-semibold text-gray-900">Target persona</h2>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-lg font-bold text-white">
              {PERSONA.name.split(" ").map((w) => w[0]).join("")}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{PERSONA.name}, {PERSONA.age} · {PERSONA.city}</p>
              <p className="text-sm text-gray-600">{PERSONA.role}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-700">{PERSONA.situation}</p>
          <blockquote className="mt-3 border-l-4 border-emerald-600 pl-3 text-sm italic text-gray-800">
            “{PERSONA.quote}”
          </blockquote>
          <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
            <div>
              <p className="font-bold uppercase text-gray-500">Goals</p>
              <ul className="mt-1 space-y-1 text-gray-700">{PERSONA.goals.map((g) => <li key={g}>• {g}</li>)}</ul>
            </div>
            <div>
              <p className="font-bold uppercase text-gray-500">Frustrations</p>
              <ul className="mt-1 space-y-1 text-gray-700">{PERSONA.frustrations.map((g) => <li key={g}>• {g}</li>)}</ul>
            </div>
            <div>
              <p className="font-bold uppercase text-gray-500">Channels</p>
              <ul className="mt-1 space-y-1 text-gray-700">{PERSONA.channels.map((g) => <li key={g}>• {g}</li>)}</ul>
            </div>
          </div>
        </section>
      </div>

      <ABTester events={events} loading={eventsLoading} error={eventsError} onRefresh={loadEvents} />

      <ContentLibrary onSaved={loadAssets} />

      <CampaignCalendar />

      {/* Saved marketing assets */}
      <section id="saved" className="scroll-mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Saved marketing assets</h2>
          <div className="flex items-center gap-2">
            {!assetsLoading && !assetsError && (
              <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600" data-testid="saved-count">
                {assetsTotal > assets.length ? `Showing ${assets.length} of ${assetsTotal} saved` : `${assetsTotal} saved`}
              </span>
            )}
            <button
              type="button"
              onClick={exportSaved}
              disabled={assetsTotal === 0}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50"
            >
              Export saved (CSV)
            </button>
          </div>
        </div>
        {assetsLoading && <p className="mt-3 text-sm text-gray-500">Loading saved assets…</p>}
        {assetsError && (
          <p className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">Could not load saved assets: {assetsError}</p>
        )}
        {!assetsLoading && !assetsError && assets.length === 0 && (
          <p className="mt-3 rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            Nothing saved yet. Click Save on any card in the content library.
          </p>
        )}
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="saved-assets">
          {assets.map((a) => (
            <div key={a.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                {a.asset_id} · {a.channel}
              </p>
              <p className="mt-1 font-semibold text-gray-900">{a.title}</p>
              <p className="mt-1 line-clamp-3 whitespace-pre-line text-xs text-gray-600">{a.body}</p>
              <p className="mt-2 text-[11px] text-gray-400">{new Date(a.created_at).toLocaleString("en-US")}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
