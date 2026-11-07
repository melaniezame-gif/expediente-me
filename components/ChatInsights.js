"use client";

import { useEffect, useState } from "react";
import { supabase, supabaseConfigOk } from "@/lib/supabaseClient";
import { REVIEW_REASON_LABELS } from "@/lib/chatbot";

const STATUS_PILL = {
  Stable: "bg-emerald-100 text-emerald-800",
  Review: "bg-amber-100 text-amber-800",
  Attention: "bg-red-100 text-red-800",
};

function when(iso) {
  try {
    return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return iso;
  }
}

// Founder view: dashboard widget, human review queue and recent test summaries.
// Everything is read live from Supabase; nothing is hard-coded.
export default function ChatInsights({ refreshKey }) {
  const [sessions, setSessions] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [s, f] = await Promise.all([
          supabase.from("chat_sessions").select("*").order("created_at", { ascending: false }).limit(100),
          supabase.from("chat_feedback").select("id, rating, intent, created_at").order("created_at", { ascending: false }).limit(1000),
        ]);
        if (s.error) throw s.error;
        if (f.error) throw f.error;
        if (!cancelled) {
          setSessions(s.data || []);
          setFeedback(f.data || []);
        }
      } catch (err) {
        console.error("Load chat insights failed:", err);
        if (!cancelled) setError(err?.message || String(err));
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const flagged = sessions.filter((s) => s.needs_review);
  const avg = sessions.length ? sessions.reduce((a, s) => a + s.overall_rating, 0) / sessions.length : null;
  const ups = feedback.filter((f) => f.rating === 1).length;
  const upPct = feedback.length ? Math.round((ups / feedback.length) * 100) : null;

  const tiles = [
    ["Test summaries saved", sessions.length],
    ["Average rating", avg === null ? "—" : `${avg.toFixed(1)} ★`],
    ["Answers rated 👍", upPct === null ? "—" : `${upPct}% of ${feedback.length}`],
    ["Needs human review", flagged.length],
  ];

  return (
    <aside className="space-y-5">
      <section className="rounded-2xl border border-gray-200 bg-white p-4" data-testid="chat-widget">
        <h2 className="text-sm font-semibold text-gray-900">Chat dashboard</h2>
        <p className="text-xs text-gray-500">Live from Supabase · chat_sessions + chat_feedback</p>
        {!supabaseConfigOk && <p className="mt-2 text-xs text-red-700">Database configuration error.</p>}
        {error && <p className="mt-2 break-all text-xs text-red-700">Could not load: {error}</p>}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {tiles.map(([label, value]) => (
            <div key={label} className="rounded-lg bg-gray-50 p-3">
              <p className="text-lg font-bold text-gray-900">{loading ? "…" : value}</p>
              <p className="text-[11px] text-gray-600">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4" data-testid="review-queue">
        <h2 className="text-sm font-semibold text-gray-900">Human review queue</h2>
        <p className="text-xs text-gray-500">
          Conversations flagged for a person to read: emergency or self-harm mentioned, Attention result, an answer rated 👎,
          “Talk to a person”, or a possible minor.
        </p>
        {!loading && flagged.length === 0 && !error && <p className="mt-3 text-xs text-gray-500">Nothing to review yet.</p>}
        <ul className="mt-3 space-y-2">
          {flagged.slice(0, 8).map((s) => (
            <li key={s.id} className="rounded-lg border border-gray-200 p-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-gray-900">{s.tester_label || "Anonymous"}</span>
                <span className="text-gray-500">{when(s.created_at)}</span>
                {s.triage_status && (
                  <span className={`rounded-full px-2 py-0.5 font-semibold ${STATUS_PILL[s.triage_status]}`}>{s.triage_status}</span>
                )}
              </div>
              <ul className="mt-1 list-disc pl-4 text-red-800">
                {(s.review_reasons || []).map((r) => (
                  <li key={r}>{REVIEW_REASON_LABELS[r] || r}</li>
                ))}
              </ul>
              {s.tester_comment && <p className="mt-1 italic text-gray-700">“{s.tester_comment}”</p>}
              <Transcript transcript={s.transcript} />
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4" data-testid="recent-tests">
        <h2 className="text-sm font-semibold text-gray-900">Recent test summaries</h2>
        {!loading && sessions.length === 0 && !error && (
          <p className="mt-3 text-xs text-gray-500">No tests saved yet — finish a conversation and press “Save test summary”.</p>
        )}
        <ul className="mt-3 divide-y divide-gray-100">
          {sessions.slice(0, 10).map((s) => (
            <li key={s.id} className="py-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-gray-900">{s.tester_label || "Anonymous"}</span>
                <span className="text-amber-500">{"★".repeat(s.overall_rating)}</span>
                <span className="text-gray-300">{"★".repeat(5 - s.overall_rating)}</span>
                {s.triage_status ? (
                  <span className={`rounded-full px-2 py-0.5 font-semibold ${STATUS_PILL[s.triage_status]}`}>
                    {s.triage_status} {s.triage_score}/8
                  </span>
                ) : (
                  <span className="text-gray-500">no result</span>
                )}
                <span className="text-gray-400">{when(s.created_at)}</span>
              </div>
              {s.guardrails?.length > 0 && <p className="mt-1 text-slate-600">Guardrails: {s.guardrails.join(", ")}</p>}
              {s.tester_comment && <p className="mt-1 text-gray-700">“{s.tester_comment}”</p>}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

function Transcript({ transcript }) {
  if (!Array.isArray(transcript) || transcript.length === 0) return null;
  return (
    <details className="mt-2">
      <summary className="cursor-pointer text-gray-600">Read transcript ({transcript.length} messages)</summary>
      <ol className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded bg-gray-50 p-2">
        {transcript.map((m, i) => (
          <li key={i} className={m.role === "user" ? "text-emerald-800" : "text-gray-700"}>
            <span className="font-semibold">{m.role === "user" ? "User" : "Guide"}:</span>{" "}
            <span className="whitespace-pre-line">{m.text}</span>
          </li>
        ))}
      </ol>
    </details>
  );
}
