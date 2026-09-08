"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export default function QuoteCta({
  label,
  href,
  location,
  className,
}: {
  label: string;
  href: string;
  location: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={() => trackEvent("cta_clicked", { location, href })}
      className={
        className ??
        "inline-block rounded-md bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700"
      }
    >
      {label}
    </Link>
  );
}
