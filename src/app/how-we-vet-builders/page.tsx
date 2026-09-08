import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "How We Vet Builders",
  description:
    "How BoothQuotes reviews and verifies trade show booth builders before matching them with exhibitor projects.",
  alternates: { canonical: "/how-we-vet-builders" },
};

export default function HowWeVetBuildersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "How We Vet Builders" }]} />
      <div className="pt-8">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          How We Vet Builders
        </h1>
        <div className="mt-6 space-y-4 text-slate-700">
          <p>
            {SITE_NAME} is an independent comparison marketplace, not a booth
            fabrication company. Before a builder appears as &quot;Verified&quot; on the
            site, our team confirms their business identity, the service locations and
            capabilities they claim, and reviews their portfolio for relevance to trade
            show exhibits.
          </p>
          <p>
            We do not publish fabricated reviews, project counts, or client lists.
            Ratings only appear on a builder profile when they are based on genuine,
            attributable reviews.
          </p>
          <p>
            Builders may pay {SITE_NAME} a referral fee, lead fee, or commission when we
            match them with a qualified exhibitor request. This does not affect whether
            a builder is verified, and it does not guarantee placement in every match —
            see{" "}
            <a href="/how-we-make-money" className="underline underline-offset-2">
              how we make money
            </a>{" "}
            for details.
          </p>
        </div>
      </div>
    </div>
  );
}
