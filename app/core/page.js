import CoreCalculator from "@/components/CoreCalculator";

export default function CorePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        Triage rápido
      </p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900">
        Revisa los signos vitales del paciente
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-600">
        Captura los 4 datos y te decimos si el paciente está estable, si
        conviene una revisión médica, o si necesita atención inmediata. Este
        resultado es una guía rápida, no reemplaza el diagnóstico de un
        profesional de la salud.
      </p>
      <CoreCalculator />
    </div>
  );
}
