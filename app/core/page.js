import CoreCalculator from "@/components/CoreCalculator";

export default function CorePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        Quick triage
      </p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900">
        Check the patient&apos;s vital signs
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-600">
        Enter 4 readings and we tell you whether the patient is stable, should
        see a doctor soon, or needs immediate care. This is a quick guide — it
        does not replace a diagnosis from a health professional.
      </p>
      <CoreCalculator />
    </div>
  );
}
