"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { copyText } from "@/lib/browserUtils";

// One copyable + saveable piece of content.
// asset = { id, type: "social_post" | "video_script" | "landing_copy", channel, title, text, meta? }
export default function ContentCard({ asset, children, onSaved }) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleCopy() {
    const ok = await copyText(asset.text);
    setCopied(ok ? "Copied ✓" : "Copy blocked — select the text manually");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const { data, error } = await supabase
        .from("marketing_assets")
        .insert({
          asset_id: asset.id,
          asset_type: asset.type,
          channel: asset.channel,
          title: asset.title,
          body: asset.text,
        })
        .select()
        .single();
      if (error) throw error;
      // Success is only shown with the row id Supabase returned.
      setMessage({ ok: true, text: `Saved. Row id: ${data.id}` });
      onSaved?.(data);
    } catch (err) {
      console.error("Save marketing asset failed:", err);
      setMessage({ ok: false, text: `Save failed: ${err?.message || String(err)}` });
    }
    setSaving(false);
  }

  return (
    <article className="flex flex-col rounded-xl border border-gray-200 bg-white p-4" data-testid={`card-${asset.id}`}>
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide">
        <span className="rounded bg-gray-900 px-1.5 py-0.5 text-white">{asset.id}</span>
        <span className="text-emerald-700">{asset.channel}</span>
        {asset.meta && <span className="text-gray-400">· {asset.meta}</span>}
      </div>
      <h3 className="mt-2 font-semibold text-gray-900">{asset.title}</h3>
      <div className="mt-2 flex-1 text-sm text-gray-700">{children}</div>
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50"
        >
          {copied || "Copy"}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      {message && (
        <p
          role="status"
          className={`mt-2 break-all text-xs ${message.ok ? "text-emerald-700" : "text-red-700"}`}
        >
          {message.text}
        </p>
      )}
    </article>
  );
}
