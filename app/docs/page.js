export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900">
        Docs — Prompt del módulo Core
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Documentación del prompt usado con el agente de código (Claude) para
        generar la página <code>/core</code> del expediente médico.
      </p>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">Prompt usado</h2>
        <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
          {`Necesito una página /core para mi proyecto de expediente médico.
Debe tener un formulario de 4 campos (temperatura, frecuencia cardiaca,
saturación de oxígeno, nivel de dolor), calcular un puntaje de riesgo con
reglas simples (sin IA ni APIs externas), mostrar un semáforo Estable /
Revisión / Atención con una recomendación, permitir guardar el resultado
en Supabase (tabla core_outputs) y mostrar un panel con los resultados
guardados anteriormente.`}
        </p>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">
          Qué generó el agente
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>La página app/core/page.js</li>
          <li>El componente components/CoreCalculator.js con la lógica de cálculo</li>
          <li>El cliente de Supabase en lib/supabaseClient.js</li>
          <li>El SQL para crear la tabla core_outputs con políticas públicas</li>
        </ul>
      </div>
    </div>
  );
}
