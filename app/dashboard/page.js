import VentureDashboard from "@/components/VentureDashboard";

export const metadata = {
  title: "Dashboard — Vitalis",
  description: "Every record the Vitalis venture has saved, from every module, in one place.",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Week 6 · Integrated venture</p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900">Venture dashboard</h1>
      <p className="mt-2 max-w-3xl text-sm text-gray-600">
        Every record Vitalis has saved — triage checks, chat sessions and ratings, research notes, pricing scenarios,
        marketing assets, A/B events and external site tests — read live from Supabase. Records marked{" "}
        <strong>Needs review</strong> are the ones a human (the founder) should look at first. All data is anonymous test
        data: no names, no accounts.
      </p>
      <VentureDashboard />
    </div>
  );
}
