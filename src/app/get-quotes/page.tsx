import type { Metadata } from "next";
import { Suspense } from "react";
import QuoteForm from "@/components/QuoteForm";
import Breadcrumbs from "@/components/Breadcrumbs";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Get 3 Trade Show Booth Quotes",
  description:
    "Tell us about your trade show booth project and compare up to 3 quotes from US booth builders. Free, no obligation.",
  alternates: { canonical: "/get-quotes" },
};

export const dynamic = "force-dynamic";

export default async function GetQuotesPage() {
  const [cities, events, services, boothSizes] = await Promise.all([
    prisma.city.findMany({
      select: { slug: true, name: true, state: true },
      orderBy: { name: "asc" },
    }),
    prisma.event.findMany({
      select: { id: true, slug: true, name: true, citySlug: true },
      orderBy: { name: "asc" },
    }),
    prisma.service.findMany({
      select: { id: true, slug: true, name: true, type: true },
      orderBy: { name: "asc" },
    }),
    prisma.boothSize.findMany({
      select: { id: true, code: true, label: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Get 3 Quotes" }]} />
      <div className="pt-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          Get My 3 Quotes
        </h1>
        <p className="mt-3 text-slate-600">
          One brief. Up to 3 quotes. No obligation.
        </p>
      </div>
      <div className="mt-10">
        <Suspense fallback={null}>
          <QuoteForm referenceData={{ cities, events, services, boothSizes }} />
        </Suspense>
      </div>
    </div>
  );
}
