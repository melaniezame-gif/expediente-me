"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, supabaseConfigOk } from "@/lib/supabaseClient";
import { downloadFile } from "@/lib/browserUtils";
import {
  SITE_TEST_TARGET,
  SOURCES,
  filterRecords,
  normalizeRecords,
  recordsToCSV,
  summarizeRecords,
} from "@/lib/dashboard";

const STATUS_PILL = {
  Stable: "bg-emerald-100 text-emerald-800",
  Review: "bg-amber-100 text-amber-800",
  Attention: "bg-red-100 text-red-800",
};
const LABEL = Object.fromEntries(SOURCES.map((s) => [s.id, s.label]));
const PAGE = Object.fromEntries(SOURCES.map((s) => [s.id, s.page]));
const MAX_ROWS = 300;
const AB_MAX_ROWS = 5000;

function when(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function Tile({ label, value, note, href }) {
  return (
    <a href={href} className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-gray-400">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {note ? <p className="mt-1 text-xs text-gray-500">{note}</p> : null}
    </a>
  );
}

// Founder view of everything the venture has saved: reads every Supabase table
// in parallel. One failing table shows its own error and never hides the others.
export default function VentureDashboard() {
  const [rowsBySource, setRowsBySource] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadedAt, setLoadedAt] = useState(null);
  const [source, setSource] = useState("all");
  const [query, setQuery] = useState("");
  const [reviewOnly, setReviewOnly] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabaseConfigOk) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const results = await Promise.all(
        SOURCES.map(async (s) => {
          try {
            const { data, error } = await supabase
              .from(s.table)
              .select("*")
              .order("created_at", { ascending: false })
              .limit(s.id === "ab" ? AB_MAX_ROWS : MAX_ROWS);
            if (error) throw error;
            return [s.id, data || [], null];
          } catch (err) {
            console.error(`Load ${s.table} failed:`, err);
            return [s.id, [], err?.message || String(err)];
          }
        })
      );
      if (cancelled) return;
      setRowsBySource(Object.fromEntries(results.map(([id, rows]) => [id, rows])));
      setErrors(Object.fromEntries(results.filter(([, , e]) => e).map(([id, , e]) => [id, e])));
      setLoadedAt(new Date());
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const records = useMemo(() => normalizeRecords(rowsBySource), [rowsBySource]);
  const summary = useMemo(() => summarizeRecords(records), [records]);
  const visible = useMemo(() => filterRecords(records, { source, query, reviewOnly }), [records, source, query, reviewOnly]);

  if (!supabaseConfigOk) {
    return (
      <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). The dashboard can&apos;t read
        any records.
      </p>
    );
  }

  const st = summary.status;
  const pct = (n) => (summary.statusTotal ? (n / summary.statusTotal) * 100 : 0);
  const listSources = SOURCES.filter((s) => s.list);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
        <p data-testid="dash-loaded">
          {loading ? "Loading records from Supabase…" : `Live from Supabase · loaded ${when(loadedAt?.toISOString())}`}
        </p>
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="rounded-full border border-gray-300 bg-white px-3 py-1 font-medium text-gray-700 hover:border-gray-500"
        >
          Refresh
        </button>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
          <p className="font-semibold">Some tables could not be read — the rest of the dashboard still works:</p>
          <ul className="mt-1 list-disc pl-5">
            {Object.entries(errors).map(([id, msg]) => (
              <li key={id}>
                <code>{SOURCES.find((s) => s.id === id)?.table}</code>: {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* KPI tiles */}
      <section aria-label="Key numbers" className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label="Total records" value={summary.total} note={`${summary.needsReview} need human review`} href="#records" />
        <Tile
          label="Triage checks"
          value={summary.bySource.triage}
          note={`${summary.attentionPct}% of results are Attention`}
          href="/core"
        />
        <Tile label="Chat sessions" value={summary.bySource.chat} note={`${summary.bySource.feedback} answer rating${summary.bySource.feedback === 1 ? "" : "s"} (👍/👎)`} href="/chat" />
        <Tile
          label="External site tests"
          value={`${summary.bySource.site_test} / ${SITE_TEST_TARGET}`}
          note={summary.bySource.site_test >= SITE_TEST_TARGET ? "Target met" : "Target: 5 testers"}
          href="/demo#testing"
        />
        <Tile label="Research records" value={summary.bySource.research} href="/research" />
        <Tile label="Pricing scenarios" value={summary.bySource.pricing} href="/pricing" />
        <Tile label="Marketing assets saved" value={summary.bySource.marketing} href="/marketing" />
        <Tile label="A/B unique visitors" value={summary.abVisitors} note={`${summary.bySource.ab} view/click events`} href="/marketing" />
      </section>

      {/* Status bar */}
      <section aria-label="Triage status" className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-900">Triage results (from /core and /chat)</h2>
          <p className="text-xs text-gray-500">{summary.statusTotal} results</p>
        </div>
        <div className="mt-3 flex h-4 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="bg-emerald-500" style={{ width: `${pct(st.Stable)}%` }} />
          <div className="bg-amber-400" style={{ width: `${pct(st.Review)}%` }} />
          <div className="bg-red-500" style={{ width: `${pct(st.Attention)}%` }} />
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />Stable {st.Stable}</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" aria-hidden="true" />Review {st.Review}</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden="true" />Attention {st.Attention}</span>
        </div>
      </section>

      {/* Unified records list */}
      <section id="records" aria-label="All records" className="mt-6 scroll-mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSource("all")}
            aria-pressed={source === "all"}
            className={`rounded-full px-3 py-1 text-xs font-medium ${source === "all" ? "bg-gray-900 text-white" : "border border-gray-300 bg-white text-gray-700"}`}
          >
            All ({summary.total})
          </button>
          {listSources.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSource(s.id)}
              aria-pressed={source === s.id}
              className={`rounded-full px-3 py-1 text-xs font-medium ${source === s.id ? "bg-gray-900 text-white" : "border border-gray-300 bg-white text-gray-700"}`}
            >
              {s.label} ({summary.bySource[s.id]})
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search records… (e.g. Attention, U3, WhatsApp)"
            aria-label="Search records"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:max-w-sm"
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={reviewOnly} onChange={(e) => setReviewOnly(e.target.checked)} />
            Needs human review only
          </label>
          <button
            type="button"
            onClick={() => downloadFile(`vitalis-records-${source}.csv`, recordsToCSV(visible), "text/csv")}
            disabled={!visible.length}
            className="rounded-full border border-gray-900 bg-white px-4 py-2 text-sm font-semibold text-gray-900 disabled:opacity-40 sm:ml-auto"
          >
            Export CSV ({visible.length})
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-500" data-testid="dash-count">
          Showing {visible.length} of {summary.total} records · newest first · up to {MAX_ROWS} per table
        </p>

        {!loading && visible.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            No records match. Try “All”, clear the search, or save something on one of the pages.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white" data-testid="dash-list">
            {visible.map((r) => (
              <li key={r.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex shrink-0 items-center gap-2 sm:w-52">
                  <a href={PAGE[r.source]} className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700 hover:bg-gray-200">
                    {LABEL[r.source]}
                  </a>
                  <span className="text-xs text-gray-500">{when(r.created_at)}</span>
                </div>
                <p className="min-w-0 flex-1 break-words text-sm text-gray-800">{r.summary}</p>
                <div className="flex shrink-0 gap-2">
                  {r.status ? (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_PILL[r.status]}`}>{r.status}</span>
                  ) : null}
                  {r.needs_review ? (
                    <span className="rounded-full border border-amber-400 px-2 py-0.5 text-xs font-semibold text-amber-800">Needs review</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
