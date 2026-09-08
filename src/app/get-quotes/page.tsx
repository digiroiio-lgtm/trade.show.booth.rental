import type { Metadata } from "next";
import { Suspense } from "react";
import QuoteForm from "@/components/QuoteForm";
import Breadcrumbs from "@/components/Breadcrumbs";
import { prisma } from "@/lib/prisma";
import { UPLOADS_ENABLED } from "@/lib/uploads";
import { hasDatabase } from "@/lib/hasDatabase";
import { STATIC_REFERENCE_DATA } from "@/lib/staticReferenceData";

export const metadata: Metadata = {
  title: "Get 3 Trade Show Booth Quotes",
  description:
    "Tell us about your trade show booth project and compare up to 3 quotes from US booth builders. Free, no obligation.",
  alternates: { canonical: "/get-quotes" },
};

export const dynamic = "force-dynamic";

export default async function GetQuotesPage() {
  const referenceData = hasDatabase
    ? await (async () => {
        const [cities, events, services, boothSizes] = await Promise.all([
          prisma!.city.findMany({
            select: { slug: true, name: true, state: true },
            orderBy: { name: "asc" },
          }),
          prisma!.event.findMany({
            select: { id: true, slug: true, name: true, citySlug: true },
            orderBy: { name: "asc" },
          }),
          prisma!.service.findMany({
            select: { id: true, slug: true, name: true, type: true },
            orderBy: { name: "asc" },
          }),
          prisma!.boothSize.findMany({
            select: { id: true, code: true, label: true },
            orderBy: { sortOrder: "asc" },
          }),
        ]);
        return { cities, events, services, boothSizes };
      })()
    : STATIC_REFERENCE_DATA;

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
      {!hasDatabase && (
        <div className="mx-auto mt-6 max-w-xl rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          RFQ submission is temporarily unavailable while we finish setting up.
          You&apos;re welcome to browse the form — nothing will be saved yet.
        </div>
      )}
      <div className="mt-10">
        <Suspense fallback={null}>
          <QuoteForm referenceData={referenceData} uploadsEnabled={UPLOADS_ENABLED} />
        </Suspense>
      </div>
    </div>
  );
}
