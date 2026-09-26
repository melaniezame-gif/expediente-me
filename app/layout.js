import "./globals.css";

export const metadata = {
  title: "Vitalis — Medical Record",
  description:
    "A quick vital-signs check for patients and caregivers: enter 4 readings and get a clear urgency light.",
};

const navLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Triage", href: "/core" },
  { label: "Research", href: "/research" },
  { label: "Docs", href: "/docs" },
];

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-gray-200 bg-white">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
            <a href="/" className="text-lg font-bold text-gray-900">
              Vitalis
            </a>
            <ul className="flex flex-wrap gap-5 text-sm font-medium text-gray-700">
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
