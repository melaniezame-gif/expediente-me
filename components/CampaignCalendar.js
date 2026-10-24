"use client";

import { downloadFile } from "@/lib/browserUtils";
import { CALENDAR_COLUMNS, calendarMarkdown, calendarRows, toCSV } from "@/lib/marketingData";

export default function CampaignCalendar() {
  const rows = calendarRows();

  return (
    <section id="calendar" className="scroll-mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">14-day campaign calendar</h2>
          <p className="text-sm text-gray-600">
            {rows[0].weekday} {rows[0].date} → {rows[13].weekday} {rows[13].date}. One post per day; day 14 announces the
            A/B winner.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => downloadFile("vitalis-campaign-calendar.csv", toCSV(rows, CALENDAR_COLUMNS), "text/csv")}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => downloadFile("vitalis-campaign-calendar.md", calendarMarkdown(), "text/markdown")}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50"
          >
            Export .md
          </button>
        </div>
      </div>
      <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7" data-testid="calendar">
        {rows.map((r) => (
          <li key={r.day} className="flex flex-col rounded-lg border border-gray-200 bg-white p-3">
            <p className="text-[11px] font-semibold uppercase text-gray-400">
              Day {r.day} · {r.weekday} {r.date.slice(5)}
            </p>
            <p className="mt-1 text-xs font-bold text-emerald-700">{r.channel}</p>
            <p className="mt-1 text-sm font-medium leading-snug text-gray-900">
              <span className="font-mono text-xs text-gray-500">{r.assetId}</span> {r.assetTitle}
            </p>
            <p className="mt-2 text-[11px] text-gray-500">🎯 {r.metric}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
