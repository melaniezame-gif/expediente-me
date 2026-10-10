import PricingSimulator from "@/components/PricingSimulator";

export const metadata = {
  title: "Pricing — Vitalis",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        Week 3 · Pricing Simulator
      </p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900">Revenue simulator</h1>
      <p className="mt-2 max-w-3xl text-sm text-gray-600">
        Pick a scenario or change any input to see monthly and annual revenue in MXN. Monthly revenue =
        paying Plus users × Plus price + clinics × Clinic price.
      </p>
      <PricingSimulator />
    </div>
  );
}
