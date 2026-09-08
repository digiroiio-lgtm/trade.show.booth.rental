import type { Metadata } from "next";
import { Suspense } from "react";
import QuoteForm from "@/components/QuoteForm";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Get 3 Trade Show Booth Quotes",
  description:
    "Tell us about your trade show booth project and compare up to 3 quotes from US booth builders. Free, no obligation.",
  alternates: { canonical: "/get-quotes" },
};

export default function GetQuotesPage() {
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
          <QuoteForm />
        </Suspense>
      </div>
    </div>
  );
}
