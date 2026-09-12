import "./globals.css";

export const metadata = {
  title: "Expediente Médico",
  description:
    "Un diagnóstico rápido para pacientes: captura signos vitales y obtén un semáforo de urgencia claro.",
};

const navLinks = [
  { label: "Cómo funciona", href: "/#how-it-works" },
  { label: "Triage", href: "/core" },
  { label: "Docs", href: "/docs" },
];

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <header className="border-b border-gray-200 bg-white">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <a href="/" className="text-lg font-bold text-gray-900">
              Expediente Médico
            </a>
            <ul className="flex gap-6 text-sm font-medium text-gray-700">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-gray-900">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
