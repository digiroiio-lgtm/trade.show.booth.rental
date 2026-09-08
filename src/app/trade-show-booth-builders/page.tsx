import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import QuoteCta from "@/components/QuoteCta";
import { CITIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Find Trade Show Booth Builders Across the USA",
  description:
    "Compare trade show booth builders in major US exhibition cities. Get up to 3 quotes for your next trade show booth project.",
  alternates: { canonical: "/trade-show-booth-builders" },
};

export default function BuildersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Find Builders" }]}
      />
      <div className="pt-8">
        <h1 className="text-4xl font-bold text-slate-900">
          Find Trade Show Booth Builders Across the USA
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          Tell us about your project and compare up to 3 quotes from trade
          show booth builders serving your city.
        </p>
        <div className="mt-6">
          <QuoteCta href="/get-quotes" label="GET 3 QUOTES" location="builders-overview" />
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CITIES.map((city) => (
          <Link
            key={city.slug}
            href={`/trade-show-booth-builders/${city.slug}`}
            className="rounded-lg border border-slate-200 p-6 transition hover:border-slate-400 hover:shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              {city.name}, {city.state}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{city.intro}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
