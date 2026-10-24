import MarketingEngine from "@/components/MarketingEngine";

export const metadata = {
  title: "Marketing — Vitalis",
};

const JUMP = [
  ["A/B tests", "#ab"],
  ["Content", "#content"],
  ["Calendar", "#calendar"],
  ["Saved", "#saved"],
];

export default function MarketingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        Week 4 · Marketing Engine + Content System
      </p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900">Marketing engine</h1>
      <p className="mt-2 max-w-3xl text-sm text-gray-600">
        Who we talk to, how we sound, what we post for 14 days — and live A/B results from the homepage telling us
        which message gets caregivers to start the check.
      </p>
      <nav className="mt-4 flex flex-wrap gap-2 text-xs">
        {JUMP.map(([label, href]) => (
          <a key={href} href={href} className="rounded-full bg-white px-3 py-1 font-medium text-gray-700 ring-1 ring-gray-200 hover:ring-gray-400">
            {label}
          </a>
        ))}
      </nav>
      <MarketingEngine />
    </div>
  );
}
