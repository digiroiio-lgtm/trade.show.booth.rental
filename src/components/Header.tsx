"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { PRIMARY_CTA, SITE_NAME } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";

const NAV_LINKS = [
  { href: "/trade-show-booth-rentals", label: "Booth Rentals" },
  { href: "/trade-show-booth-builders", label: "Find Builders" },
  { href: "/trade-show-booth-builders", label: "Locations" },
  { href: "/trade-shows", label: "Trade Shows" },
  { href: "/#how-it-works", label: "How It Works" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-slate-900"
        >
          {SITE_NAME}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/get-quotes"
            onClick={() =>
              trackEvent("cta_clicked", { location: "header", pathname })
            }
            className="hidden rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 sm:inline-block"
          >
            {PRIMARY_CTA}
          </Link>
          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            className="inline-flex items-center justify-center rounded-md border border-slate-300 p-2 lg:hidden"
            onClick={() => setOpen((prev) => !prev)}
          >
            <span className="sr-only">Menu</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 5h16M2 10h16M2 15h16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/get-quotes"
              onClick={() => {
                trackEvent("cta_clicked", {
                  location: "mobile-header",
                  pathname,
                });
                setOpen(false);
              }}
              className="mt-2 rounded-md bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white"
            >
              {PRIMARY_CTA}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
