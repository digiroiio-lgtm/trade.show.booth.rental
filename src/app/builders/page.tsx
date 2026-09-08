import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import QuoteCta from "@/components/QuoteCta";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Trade Show Booth Builders Directory",
  description:
    "Browse vetted trade show booth builders on BoothQuotes. Compare capabilities and get up to 3 quotes for your next exhibit.",
  alternates: { canonical: "/builders" },
};

export const dynamic = "force-dynamic";

export default async function BuildersIndexPage() {
  const builders = await prisma.builder.findMany({
    where: { verified: true },
    orderBy: { companyName: "asc" },
    include: { locations: true },
  });

  const citySlugs = Array.from(
    new Set(builders.flatMap((b) => b.locations.map((l) => l.citySlug)))
  );
  const cities = await prisma.city.findMany({
    where: { slug: { in: citySlugs } },
    select: { slug: true, name: true },
  });
  const cityNameBySlug = Object.fromEntries(cities.map((c) => [c.slug, c.name]));

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Builders" }]} />
      <div className="pt-8">
        <h1 className="text-4xl font-bold text-slate-900">Trade Show Booth Builders</h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          BoothQuotes is an independent comparison marketplace. Rather than browsing a
          long directory, most exhibitors get better results by submitting one project
          brief and letting us identify up to 3 suitable builders.
        </p>
        <div className="mt-6">
          <QuoteCta href="/get-quotes" label="GET 3 QUOTES" location="builders-index" />
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {builders.map((builder) => (
          <Link
            key={builder.id}
            href={`/builders/${builder.slug}`}
            className="rounded-lg border border-slate-200 p-6 transition hover:border-slate-400 hover:shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">{builder.companyName}</h2>
            <p className="mt-2 text-sm text-slate-600 line-clamp-3">
              {builder.description ?? "Trade show booth builder."}
            </p>
            {builder.locations.length > 0 && (
              <p className="mt-3 text-xs text-slate-500">
                {builder.locations.map((l) => cityNameBySlug[l.citySlug] ?? l.citySlug).join(", ")}
              </p>
            )}
          </Link>
        ))}
        {builders.length === 0 && (
          <p className="text-sm text-slate-500">
            No verified builders published yet. Submit an RFQ and we&apos;ll match you
            directly with suitable partners.
          </p>
        )}
      </div>
    </div>
  );
}
