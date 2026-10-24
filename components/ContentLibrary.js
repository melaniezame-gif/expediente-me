"use client";

import { useState } from "react";
import ContentCard from "@/components/ContentCard";
import { downloadFile } from "@/lib/browserUtils";
import {
  CHANNELS,
  LANDING_COPY,
  SOCIAL_POSTS,
  VIDEO_SCRIPTS,
  filterPosts,
  libraryMarkdown,
  postText,
  scriptText,
} from "@/lib/marketingData";

const TABS = [
  { id: "posts", label: `Social posts (${SOCIAL_POSTS.length})` },
  { id: "scripts", label: `Video scripts (${VIDEO_SCRIPTS.length})` },
  { id: "landing", label: `Landing copy (${LANDING_COPY.length})` },
];

export default function ContentLibrary({ onSaved }) {
  const [tab, setTab] = useState("posts");
  const [channel, setChannel] = useState("All");
  const [query, setQuery] = useState("");

  const posts = filterPosts(SOCIAL_POSTS, { channel, query });

  return (
    <section id="content" className="scroll-mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Content library</h2>
          <p className="text-sm text-gray-600">Ready to copy and post. Save the ones you publish so they appear below.</p>
        </div>
        <button
          type="button"
          onClick={() => downloadFile("vitalis-content-library.md", libraryMarkdown(), "text/markdown")}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50"
        >
          Export library (.md)
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-b border-gray-200" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
              tab === t.id ? "border-emerald-700 text-emerald-800" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "posts" && (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {["All", ...CHANNELS].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setChannel(c)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  channel === c ? "bg-gray-900 text-white" : "bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-gray-400"
                }`}
              >
                {c}
              </button>
            ))}
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts…"
              aria-label="Search posts"
              className="ml-auto w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm sm:w-56"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500" data-testid="post-count">
            Showing {posts.length} of {SOCIAL_POSTS.length} posts
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="posts">
            {posts.map((p) => {
              const text = postText(p);
              const limit = p.channel === "X" ? 280 : null;
              return (
                <ContentCard
                  key={p.id}
                  onSaved={onSaved}
                  asset={{ id: p.id, type: "social_post", channel: p.channel, title: p.title, text, meta: `${p.pillar} · ${p.format}` }}
                >
                  <p className="whitespace-pre-line">{p.body}</p>
                  {p.hashtags && <p className="mt-2 text-xs text-emerald-700">{p.hashtags}</p>}
                  {limit && (
                    <p className="mt-2 font-mono text-[11px] text-gray-400">
                      {text.length} / {limit} characters
                    </p>
                  )}
                </ContentCard>
              );
            })}
            {posts.length === 0 && (
              <p className="col-span-full rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                No posts match. Clear the search or pick another channel.
              </p>
            )}
          </div>
        </>
      )}

      {tab === "scripts" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-3" data-testid="scripts">
          {VIDEO_SCRIPTS.map((s) => (
            <ContentCard
              key={s.id}
              onSaved={onSaved}
              asset={{ id: s.id, type: "video_script", channel: s.channel, title: s.title, text: scriptText(s), meta: s.length }}
            >
              <p className="text-xs italic text-gray-500">Hook: “{s.hook}”</p>
              <ol className="mt-3 space-y-3">
                {s.scenes.map((sc) => (
                  <li key={sc.time} className="border-l-2 border-emerald-200 pl-3">
                    <p className="font-mono text-[11px] text-gray-400">{sc.time}</p>
                    <p className="text-xs text-gray-500">🎥 {sc.visual}</p>
                    <p className="text-sm">🎙️ {sc.voice}</p>
                    <p className="text-xs font-semibold text-gray-800">🅃 {sc.text}</p>
                  </li>
                ))}
              </ol>
            </ContentCard>
          ))}
        </div>
      )}

      {tab === "landing" && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2" data-testid="landing-copy">
          {LANDING_COPY.map((l) => (
            <ContentCard
              key={l.id}
              onSaved={onSaved}
              asset={{ id: l.id, type: "landing_copy", channel: l.channel, title: l.title, text: l.body }}
            >
              <p className="whitespace-pre-line">{l.body}</p>
            </ContentCard>
          ))}
        </div>
      )}
    </section>
  );
}
