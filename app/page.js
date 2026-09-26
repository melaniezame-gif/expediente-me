export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <section className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Vitalis · Medical Record
          </p>
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Understand your vital signs and know when to seek care
          </h1>
          <p className="mt-4 text-gray-600">
            A quick check for patients and caregivers: enter 4 basic readings
            and instantly get an urgency light with a clear recommendation.
          </p>
          <a
            id="how-it-works"
            href="/core"
            className="mt-6 inline-block rounded-md bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Start the check
          </a>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">
            Your urgency light
          </p>
          <div className="mt-4 flex gap-3">
            <div className="flex-1 rounded-lg bg-green-50 p-3 text-center text-xs font-semibold text-green-700">
              Stable
            </div>
            <div className="flex-1 rounded-lg bg-amber-50 p-3 text-center text-xs font-semibold text-amber-700">
              Review
            </div>
            <div className="flex-1 rounded-lg bg-red-50 p-3 text-center text-xs font-semibold text-red-700">
              Attention
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Based on temperature, heart rate, oxygen saturation and pain
            level.
          </p>
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm font-semibold text-gray-900">1. Enter your readings</p>
          <p className="mt-1 text-sm text-gray-600">
            Type in 4 basic readings from the patient.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm font-semibold text-gray-900">2. See your result</p>
          <p className="mt-1 text-sm text-gray-600">
            Get the urgency level and a recommendation.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm font-semibold text-gray-900">3. Save your history</p>
          <p className="mt-1 text-sm text-gray-600">
            Review saved results on your dashboard.
          </p>
        </div>
      </section>
    </div>
  );
}
