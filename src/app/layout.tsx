import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "JICF Men's Fellowship — Obedience Accountability",
  description:
    "Weekly obedience commitments and accountability tracking for JICF Men's Fellowship small groups.",
};

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/submit", label: "Submit Commitment" },
  { href: "/my-assignments", label: "My Assignments" },
  { href: "/tracking", label: "Tracking" },
  { href: "/admin", label: "Admin" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/" className="font-semibold text-slate-900 dark:text-slate-100">
              JICF Men&apos;s Fellowship
            </Link>
            <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="text-center text-xs text-slate-400 py-6">
          Obedience Accountability &middot; JICF Men&apos;s Fellowship
        </footer>
      </body>
    </html>
  );
}
