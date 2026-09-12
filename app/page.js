export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <section className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Expediente Médico
          </p>
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Entiende tus signos vitales y sabe cuándo buscar atención
          </h1>
          <p className="mt-4 text-gray-600">
            Una revisión rápida para pacientes y cuidadores: captura 4 datos
            básicos y obtén de inmediato un semáforo de urgencia con una
            recomendación clara.
          </p>
          <a
            id="how-it-works"
            href="/core"
            className="mt-6 inline-block rounded-md bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Comenzar diagnóstico
          </a>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">
            Tu semáforo de urgencia
          </p>
          <div className="mt-4 flex gap-3">
            <div className="flex-1 rounded-lg bg-green-50 p-3 text-center text-xs font-semibold text-green-700">
              Estable
            </div>
            <div className="flex-1 rounded-lg bg-amber-50 p-3 text-center text-xs font-semibold text-amber-700">
              Revisión
            </div>
            <div className="flex-1 rounded-lg bg-red-50 p-3 text-center text-xs font-semibold text-red-700">
              Atención
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Basado en temperatura, frecuencia cardiaca, saturación de oxígeno
            y nivel de dolor.
          </p>
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm font-semibold text-gray-900">1. Cuéntanos tus signos</p>
          <p className="mt-1 text-sm text-gray-600">
            Captura 4 datos básicos del paciente.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm font-semibold text-gray-900">2. Ve tu resultado</p>
          <p className="mt-1 text-sm text-gray-600">
            Obtén el nivel de urgencia y una recomendación.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm font-semibold text-gray-900">3. Guarda tu historial</p>
          <p className="mt-1 text-sm text-gray-600">
            Consulta resultados guardados en tu panel.
          </p>
        </div>
      </section>
    </div>
  );
}
