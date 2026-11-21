import "./globals.css";
import { ALL_PAGES, DEMO_LINK, NAV_GROUPS } from "@/lib/siteMap";

export const metadata = {
  title: "Vitalis — Medical Record",
  description:
    "A quick vital-signs check for patients and caregivers: enter 4 readings and get a clear urgency light.",
};

// Week 6: the header and the footer are both generated from lib/siteMap.js,
// so every page is linked from every page and a test catches dead links.
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <header className="border-b border-gray-200 bg-white">
          <nav
            aria-label="Main"
            className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6"
          >
            <a href="/" className="text-lg font-bold text-gray-900">
              Vitalis
            </a>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              {NAV_GROUPS.map((group) => (
                <div key={group.label} className="flex items-center gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{group.label}</span>
                  <ul className="flex gap-3 font-medium text-gray-700">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <a href={link.href} className="hover:text-gray-900">
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <a
                href={DEMO_LINK.href}
                className="rounded-full bg-emerald-700 px-4 py-1.5 font-semibold text-white hover:bg-emerald-800"
              >
                {DEMO_LINK.label}
              </a>
            </div>
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="mt-16 border-t border-gray-200 bg-gray-50">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:px-6 md:grid-cols-[1fr_2fr]">
            <div>
              <p className="font-bold text-gray-900">Vitalis</p>
              <p className="mt-2 text-gray-600">Know when to act, in time.</p>
              <p className="mt-3 text-xs text-gray-500">
                Educational project — not a medical device and not a diagnosis. In an emergency call <strong>911</strong>.
              </p>
            </div>
            <nav aria-label="Site map">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Site map</p>
              <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                {ALL_PAGES.map((p) => (
                  <li key={p.href}>
                    <a href={p.href} className="text-gray-700 hover:text-gray-900">
                      {p.label}
                    </a>
                    <span className="ml-2 text-xs text-gray-400">Week {p.week}</span>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
