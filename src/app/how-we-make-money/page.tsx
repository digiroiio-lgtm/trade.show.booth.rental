import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "How We Make Money",
  description:
    "How BoothQuotes is funded: builders may pay referral fees, lead fees, or commissions. Comparing builders and requesting quotes is always free for exhibitors.",
  alternates: { canonical: "/how-we-make-money" },
};

export default function HowWeMakeMoneyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "How We Make Money" }]} />
      <div className="pt-8">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          How We Make Money
        </h1>
        <div className="mt-6 space-y-4 text-slate-700">
          <p>
            {SITE_NAME} is free for exhibitors. Comparing builders and submitting a
            request for quotes never costs you anything, and we never sell your project
            details to unrelated third parties.
          </p>
          <p>
            We earn revenue from the builders in our network — through a referral or
            lead fee when we send them a qualified project, and in some cases a
            commission tied to project value once a match becomes a signed project.
            Builders may also pay for featured placement on city, venue, or event pages;
            any sponsored placement is always clearly labeled as such.
          </p>
          <p>
            This does not change which builders we consider a good fit for your
            project. Matching is based on location, capability, and budget fit — see{" "}
            <a href="/how-we-vet-builders" className="underline underline-offset-2">
              how we vet builders
            </a>{" "}
            for how we decide who is eligible to be matched at all.
          </p>
        </div>
      </div>
    </div>
  );
}
