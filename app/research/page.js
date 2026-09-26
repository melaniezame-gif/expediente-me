import ResearchDashboard from "@/components/ResearchDashboard";

export const metadata = {
  title: "Research — Vitalis",
};

export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        Week 2 · Research + Benchmarking
      </p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900">
        Is the problem real? Who else solves it?
      </h1>
      <p className="mt-2 max-w-3xl text-sm text-gray-600">
        Evidence that patients and caregivers in Mexico need a fast, clear way
        to decide whether home vital signs are urgent — plus the competitors,
        substitutes, benchmarks, risks and gaps we found.
      </p>
      <ResearchDashboard />
    </div>
  );
}
