"use client";

import { useEffect, useRef, useState } from "react";
import { supabase, supabaseConfigOk } from "@/lib/supabaseClient";
import {
  VITAL_RANGES,
  buildFeedbackRow,
  buildSessionSummary,
  initialChatState,
  reduceChat,
} from "@/lib/chatbot";

function newSessionId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

const STATUS_STYLE = {
  Stable: "border-emerald-600 bg-emerald-50",
  Review: "border-amber-500 bg-amber-50",
  Attention: "border-red-600 bg-red-50",
};
const STATUS_LABEL = {
  Stable: "text-emerald-800",
  Review: "text-amber-800",
  Attention: "text-red-800",
};

export default function ChatAssistant({ onSaved }) {
  const [sessionId, setSessionId] = useState(null);
  const [chat, setChat] = useState(() => ({ state: initialChatState(), messages: [] }));
  const [input, setInput] = useState("");
  const [ratings, setRatings] = useState({}); // messageId → { rating, status: 'saving'|'saved'|'error', text }
  const [finishOpen, setFinishOpen] = useState(false);
  const listRef = useRef(null);
  const started = useRef(false);

  function dispatch(event) {
    setChat((prev) => {
      const r = reduceChat(prev.state, event);
      return { state: r.state, messages: [...prev.messages, ...r.messages] };
    });
  }

  // Start the conversation once, on the client (session ids must not be created during SSR).
  useEffect(() => {
    if (started.current) return; // React dev mode runs effects twice
    started.current = true;
    setSessionId(newSessionId());
    dispatch({ type: "start" });
  }, []);

  // Keep the newest message in view without scrolling the whole page.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat.messages.length]);

  const { state, messages } = chat;
  const lastUserIndex = messages.map((m) => m.role).lastIndexOf("user");
  const userTurns = messages.filter((m) => m.role === "user").length;

  function send(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    dispatch({ type: "text", text });
  }

  function restart() {
    if (userTurns > 0 && !finishOpen && !window.confirm("Start a new conversation? This one has not been saved.")) return;
    setChat({ state: initialChatState(), messages: [] });
    setRatings({});
    setFinishOpen(false);
    setSessionId(newSessionId());
    dispatch({ type: "start" });
  }

  async function rate(message, rating) {
    setRatings((r) => ({ ...r, [message.id]: { rating, status: "saving" } }));
    try {
      const row = buildFeedbackRow({ sessionId, message, rating });
      const { data, error } = await supabase.from("chat_feedback").insert(row).select().single();
      if (error) throw error;
      setRatings((r) => ({ ...r, [message.id]: { rating, status: "saved", text: `Saved (row ${data.id.slice(0, 8)}…)` } }));
      if (rating === -1) dispatch({ type: "rate", rating: -1 });
      onSaved?.();
    } catch (err) {
      console.error("Save feedback failed:", err);
      setRatings((r) => ({ ...r, [message.id]: { rating: null, status: "error", text: `Not saved: ${err?.message || String(err)}` } }));
    }
  }

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-gray-300 bg-white" aria-label="Vitalis Guide chat">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900">Vitalis Guide</p>
          <p className="text-xs text-gray-500">Automated guide · not a doctor · emergencies: 911</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => dispatch({ type: "human" })}
            className="rounded-full border border-gray-900 bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-gray-100"
          >
            Talk to a person
          </button>
          <button
            type="button"
            onClick={restart}
            className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            Restart
          </button>
        </div>
      </div>

      {!supabaseConfigOk && (
        <p className="bg-red-50 px-4 py-2 text-xs text-red-800">
          Database configuration error: ratings and test summaries can't be saved. Check the Supabase environment variables in Vercel and redeploy.
        </p>
      )}

      {/* Messages */}
      <div ref={listRef} className="h-[560px] space-y-3 overflow-y-auto px-3 py-4 sm:px-4" data-testid="chat-messages" aria-live="polite">
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <p className="max-w-[85%] whitespace-pre-line break-words rounded-2xl rounded-br-sm bg-emerald-700 px-3 py-2 text-sm text-white">
                {m.text}
              </p>
            </div>
          ) : (
            <BotMessage
              key={m.id}
              message={m}
              active={i > lastUserIndex}
              rating={ratings[m.id]}
              onRate={(r) => rate(m, r)}
              onChoice={(c) => dispatch({ type: "choice", value: c.value, label: c.label })}
              onVitals={(values) => dispatch({ type: "vitals", values })}
            />
          )
        )}
      </div>

      {/* Input */}
      <form onSubmit={send} className="flex gap-2 border-t border-gray-200 bg-gray-50 px-3 py-3 sm:px-4">
        <label htmlFor="chat-input" className="sr-only">
          Message
        </label>
        <input
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
          autoComplete="off"
          placeholder="Type an answer or a question…"
          className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
        />
        <button type="submit" className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700">
          Send
        </button>
      </form>

      <FinishPanel
        open={finishOpen}
        setOpen={setFinishOpen}
        disabled={userTurns === 0}
        build={(fields) => buildSessionSummary({ sessionId, state, messages, ...fields })}
        onSaved={onSaved}
        onNewTest={restart}
      />
    </section>
  );
}

function BotMessage({ message: m, active, rating, onRate, onChoice, onVitals }) {
  let box = "bg-gray-100";
  let label = null;
  if (m.kind === "guardrail") {
    box = "border-2 border-slate-500 bg-slate-50";
    label = <span className="text-slate-600">Safety</span>;
  } else if (m.kind === "emergency") {
    box = "border-2 border-red-600 bg-red-50";
    label = <span className="text-red-700">{m.intent === "guardrail_self_harm" ? "You're not alone" : "Emergency"}</span>;
  } else if (m.kind === "checkpoint") {
    box = "border-2 border-gray-900 bg-white";
    label = <span className="text-gray-900">Human checkpoint</span>;
  } else if (m.kind === "result") {
    box = `border-2 ${STATUS_STYLE[m.result.status]}`;
    label = <span className={STATUS_LABEL[m.result.status]}>Result · {m.result.status}</span>;
  }

  return (
    <div className="flex justify-start" data-kind={m.kind} data-intent={m.intent || ""}>
      <div className={`w-full max-w-[92%] rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-gray-900 sm:max-w-[85%] ${box}`}>
        {label && <p className="mb-1 text-[11px] font-bold uppercase tracking-wide">{label}</p>}
        <p className="whitespace-pre-line break-words">{m.text}</p>

        {m.summary && (
          <ul className="mt-2 space-y-1 rounded-lg bg-gray-50 p-2 text-xs text-gray-800">
            {m.summary.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}

        {m.kind === "emergency" && (
          <div className="mt-3 flex flex-wrap gap-2">
            <a href="tel:911" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
              Call 911
            </a>
            {m.intent === "guardrail_self_harm" && (
              <a href="tel:8009112000" className="rounded-lg border-2 border-red-600 bg-white px-4 py-2 text-sm font-bold text-red-700">
                Call Línea de la Vida
              </a>
            )}
          </div>
        )}

        {m.form === "vitals" && active && <VitalsForm onSubmit={onVitals} />}

        {m.choices && active && (
          <div className="mt-2 flex flex-wrap gap-2">
            {m.choices.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => onChoice(c)}
                className={`min-h-[36px] rounded-full border px-3 py-1.5 text-left text-xs font-semibold ${
                  c.value === "confirm"
                    ? "border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800"
                    : "border-emerald-700 bg-white text-emerald-800 hover:bg-emerald-50"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {m.rateable && <RateButtons rating={rating} onRate={onRate} />}
      </div>
    </div>
  );
}

function RateButtons({ rating, onRate }) {
  const locked = rating && (rating.status === "saving" || rating.status === "saved");
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
      <span>Helpful?</span>
      {[
        [1, "👍", "Helpful"],
        [-1, "👎", "Not helpful"],
      ].map(([value, icon, aria]) => (
        <button
          key={value}
          type="button"
          aria-label={aria}
          disabled={locked}
          onClick={() => onRate(value)}
          className={`rounded-md border px-2 py-0.5 text-sm ${
            rating?.rating === value ? "border-gray-900 bg-white" : "border-gray-300 bg-white/60 hover:bg-white"
          } disabled:cursor-default`}
        >
          {icon}
        </button>
      ))}
      {rating?.status === "saving" && <span>Saving…</span>}
      {rating?.status === "saved" && <span className="text-emerald-700">{rating.text}</span>}
      {rating?.status === "error" && <span className="break-all text-red-700">{rating.text}</span>}
    </div>
  );
}

const FIELDS = [
  ["temperature", "Temp (°C)", "37.0", "0.1"],
  ["heartRate", "Heart rate (bpm)", "80", "1"],
  ["oxygenSaturation", "Oxygen (%)", "98", "1"],
  ["painLevel", "Pain (0–10)", "2", "1"],
];

function VitalsForm({ onSubmit }) {
  const [values, setValues] = useState({ temperature: "", heartRate: "", oxygenSaturation: "", painLevel: "" });
  return (
    <form
      className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      data-testid="vitals-form"
    >
      {FIELDS.map(([key, label, placeholder, step]) => (
        <label key={key} className="text-[11px] font-semibold text-gray-600">
          {label}
          <input
            name={key}
            type="number"
            inputMode="decimal"
            step={step}
            min={VITAL_RANGES[key].min}
            max={VITAL_RANGES[key].max}
            placeholder={placeholder}
            value={values[key]}
            onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm font-normal text-gray-900"
          />
        </label>
      ))}
      <button type="submit" className="col-span-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 sm:col-span-1">
        Continue
      </button>
    </form>
  );
}

function FinishPanel({ open, setOpen, disabled, build, onSaved, onNewTest }) {
  const [tester, setTester] = useState("");
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Reset the form when a new conversation starts.
  useEffect(() => {
    if (!open) {
      setStars(0);
      setComment("");
      setMessage(null);
    }
  }, [open]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const row = build({ testerLabel: tester, rating: stars, comment });
      const { data, error } = await supabase.from("chat_sessions").insert(row).select().single();
      if (error) throw error;
      setMessage({ ok: true, text: `Test summary saved. Row id: ${data.id}` });
      onSaved?.();
    } catch (err) {
      console.error("Save chat session failed:", err);
      setMessage({ ok: false, text: `Save failed: ${err?.message || String(err)}` });
    }
    setSaving(false);
  }

  if (!open) {
    return (
      <div className="border-t border-gray-200 px-4 py-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(true)}
          className="text-sm font-semibold text-emerald-800 hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
        >
          Finish &amp; save test summary →
        </button>
      </div>
    );
  }

  const saved = message?.ok;
  return (
    <form onSubmit={save} className="space-y-3 border-t border-gray-200 bg-emerald-50/50 px-4 py-4" data-testid="finish-panel">
      <p className="text-sm font-semibold text-gray-900">Finish &amp; save test summary</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-gray-700">
          Tester code (optional — no full names)
          <input
            value={tester}
            onChange={(e) => setTester(e.target.value)}
            maxLength={40}
            placeholder="e.g. U1"
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm font-normal"
          />
        </label>
        <fieldset className="text-xs font-semibold text-gray-700">
          <legend>Overall rating</legend>
          <div className="mt-1 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                aria-pressed={stars === n}
                onClick={() => setStars(n)}
                className={`text-2xl leading-none ${n <= stars ? "text-amber-500" : "text-gray-300"} hover:text-amber-400`}
              >
                ★
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <label className="block text-xs font-semibold text-gray-700">
        What worked or what was confusing?
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={2}
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm font-normal"
        />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        {!saved && (
          <button
            type="submit"
            disabled={saving || stars === 0}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {saving ? "Saving…" : stars === 0 ? "Choose a rating to save" : "Save test summary"}
          </button>
        )}
        {saved ? (
          <button type="button" onClick={onNewTest} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800">
            Start a new test
          </button>
        ) : (
          <button type="button" onClick={() => setOpen(false)} className="text-sm text-gray-600 hover:underline">
            Cancel
          </button>
        )}
      </div>
      {message && (
        <p role="status" className={`break-all text-xs ${message.ok ? "text-emerald-700" : "text-red-700"}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
