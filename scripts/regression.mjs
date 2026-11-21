// Week 6 — full-site route regression.
// Usage: node scripts/regression.mjs https://expediente-me-wine.vercel.app
// Requests every page in lib/siteMap.js ALL_PAGES and checks:
//   1. HTTP 200   2. the expected heading text is in the HTML
//   3. the shared header links to /demo and /dashboard (integration)
// Exits with code 1 if anything fails, so it can run in CI later (V2 roadmap).
import { ALL_PAGES } from "../lib/siteMap.js";

const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");

function decode(html) {
  return html
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
}

const results = [];
for (const page of ALL_PAGES) {
  const url = `${base}${page.href}`;
  const started = Date.now();
  const r = { route: page.href, ok: false, status: null, ms: 0, problem: "" };
  try {
    const res = await fetch(url, { redirect: "manual", headers: { "cache-control": "no-cache" } });
    r.status = res.status;
    const html = decode(await res.text());
    r.ms = Date.now() - started;
    if (res.status !== 200) r.problem = `status ${res.status}`;
    else if (!html.includes(page.heading)) r.problem = `heading "${page.heading}" not found`;
    else if (!html.includes('href="/demo"') || !html.includes('href="/dashboard"')) r.problem = "nav missing /demo or /dashboard";
    else r.ok = true;
  } catch (err) {
    r.problem = err.message;
  }
  results.push(r);
}

const passed = results.filter((r) => r.ok).length;
console.log(`Full-site regression — ${base} — ${new Date().toISOString()}`);
console.table(results.map((r) => ({ route: r.route, status: r.status, ms: r.ms, result: r.ok ? "PASS" : `FAIL: ${r.problem}` })));
console.log(`${passed}/${results.length} routes passed`);
process.exit(passed === results.length ? 0 : 1);
