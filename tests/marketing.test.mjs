// Week 4 marketing tests. Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeABTest, assignVariant, summarizeEvents } from "../lib/abTest.js";
import {
  AB_TESTS,
  CALENDAR,
  CHANNEL_LIMITS,
  SOCIAL_POSTS,
  VIDEO_SCRIPTS,
  calendarDate,
  calendarRows,
  findAsset,
  filterPosts,
  postText,
  toCSV,
} from "../lib/marketingData.js";

test("Marketing test M1 — A/B statistics: CTR, lift, minimum sample and winner", () => {
  const small = analyzeABTest({ A: { views: 12, clicks: 3 }, B: { views: 29, clicks: 10 } });
  assert.equal(small.verdict, "keep_running");
  assert.equal(small.ctrA, 0.25);
  assert.equal(small.winner, null);

  const clear = analyzeABTest({ A: { views: 200, clicks: 20 }, B: { views: 200, clicks: 45 } });
  assert.equal(clear.ctrA, 0.1);
  assert.equal(clear.ctrB, 0.225);
  assert.ok(Math.abs(clear.lift - 1.25) < 1e-9); // +125% relative lift
  assert.equal(clear.verdict, "winner");
  assert.equal(clear.winner, "B");
  assert.ok(clear.pValue < 0.01);

  const tie = analyzeABTest({ A: { views: 50, clicks: 10 }, B: { views: 50, clicks: 11 } });
  assert.equal(tie.verdict, "no_difference");
  assert.equal(tie.winner, null);
  assert.equal(tie.leader, "B");
});

test("Marketing test M2 — variant assignment and unique-visitor counting", () => {
  assert.equal(assignVariant({ random: () => 0.1 }), "A");
  assert.equal(assignVariant({ random: () => 0.9 }), "B");
  assert.equal(assignVariant({ stored: "B", random: () => 0.1 }), "B"); // sticky
  assert.equal(assignVariant({ override: "a", stored: "B" }), "A"); // ?ab=a forces A
  assert.equal(assignVariant({ override: "Z", stored: "B" }), "B"); // bad override ignored

  const events = [
    { test_id: "hero_headline", variant: "A", event: "view", visitor_id: "v1" },
    { test_id: "hero_headline", variant: "A", event: "view", visitor_id: "v1" }, // refresh
    { test_id: "hero_headline", variant: "A", event: "click", visitor_id: "v1" },
    { test_id: "hero_headline", variant: "A", event: "click", visitor_id: "v1" }, // double click
    { test_id: "hero_headline", variant: "B", event: "view", visitor_id: "v2" },
    { test_id: "hero_headline", variant: "B", event: "click", visitor_id: "v9" }, // click with no view
    { test_id: "cta_text", variant: "A", event: "view", visitor_id: "v3" }, // other test
  ];
  assert.deepEqual(summarizeEvents(events, "hero_headline"), {
    A: { views: 1, clicks: 1 },
    B: { views: 1, clicks: 0 },
  });
});

test("Marketing test M3 — content system integrity and CSV export", () => {
  assert.equal(SOCIAL_POSTS.length, 10);
  assert.equal(VIDEO_SCRIPTS.length, 3);
  assert.equal(CALENDAR.length, 14);
  assert.equal(AB_TESTS.length, 2);
  assert.deepEqual(CALENDAR.map((c) => c.day), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  for (const c of CALENDAR) assert.ok(findAsset(c.assetId), `calendar day ${c.day} points to a missing asset`);
  for (const p of SOCIAL_POSTS) {
    const limit = CHANNEL_LIMITS[p.channel];
    if (limit) assert.ok(postText(p).length <= limit, `${p.id} is ${postText(p).length} chars`);
  }
  assert.equal(new Set([...SOCIAL_POSTS, ...VIDEO_SCRIPTS].map((a) => a.id)).size, 13); // unique ids
  assert.equal(calendarDate(1), "2026-10-26");
  assert.equal(calendarDate(14), "2026-11-08");
  assert.equal(calendarRows()[0].weekday, "Mon");
  assert.equal(filterPosts(SOCIAL_POSTS, { channel: "X" }).length, 2);
  assert.ok(filterPosts(SOCIAL_POSTS, { query: "oximeter" }).some((p) => p.id === "P8"));

  const csv = toCSV(
    [{ a: 'Say "hi"', b: "one, two" }, { a: "line\nbreak", b: "plain" }],
    [{ key: "a", label: "A" }, { key: "b", label: "B" }]
  );
  assert.equal(csv, 'A,B\r\n"Say ""hi""","one, two"\r\n"line\nbreak",plain');
});
