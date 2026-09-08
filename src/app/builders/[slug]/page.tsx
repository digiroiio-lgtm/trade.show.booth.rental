import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import QuoteCta from "@/components/QuoteCta";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getBuilder(slug: string) {
  const builder = await prisma.builder.findUnique({
    where: { slug },
    include: { locations: true, capabilities: true },
  });
  if (!builder || !builder.verified) return null;
  return builder;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const builder = await getBuilder(slug);
  if (!builder) return {};

  return {
    title: `${builder.companyName} | Trade Show Booth Builder`,
    description:
      builder.description ??
      `${builder.companyName} is a vetted trade show booth builder on BoothQuotes.`,
    alternates: { canonical: `/builders/${builder.slug}` },
  };
}

export default async function BuilderProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const builder = await getBuilder(slug);
  if (!builder) notFound();

  const cities = await prisma.city.findMany({
    where: { slug: { in: builder.locations.map((l) => l.citySlug) } },
    select: { slug: true, name: true, state: true },
  });
  const services = await prisma.service.findMany({
    where: { type: { in: builder.capabilities.map((c) => c.serviceType) } },
    select: { name: true, type: true },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Builders", href: "/builders" },
          { label: builder.companyName },
        ]}
      />

      <div className="pt-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            {builder.companyName}
          </h1>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Verified
          </span>
        </div>
        {builder.description && (
          <p className="mt-4 max-w-2xl text-slate-600">{builder.description}</p>
        )}
        {builder.website && (
          <a
            href={builder.website}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-2 inline-block text-sm font-medium text-slate-500 underline underline-offset-2"
          >
            {builder.website}
          </a>
        )}
        <div className="mt-6">
          <QuoteCta
            href={`/get-quotes`}
            label={`GET 3 QUOTES`}
            location={`builder-profile-${builder.slug}`}
          />
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Cities Served
          </h2>
          <ul className="mt-3 space-y-1 text-sm text-slate-700">
            {cities.map((city) => (
              <li key={city.slug}>
                {city.name}, {city.state}
              </li>
            ))}
            {cities.length === 0 && <li className="text-slate-400">Not specified</li>}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Capabilities
          </h2>
          <ul className="mt-3 space-y-1 text-sm text-slate-700">
            {services.map((service) => (
              <li key={service.type}>{service.name}</li>
            ))}
            {services.length === 0 && <li className="text-slate-400">Not specified</li>}
          </ul>
        </div>
      </div>

      <div className="mt-12 rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        BoothQuotes is an independent comparison marketplace. This profile reflects
        information {builder.companyName} has provided; we do not fabricate reviews or
        project counts.{" "}
        <a href="/how-we-vet-builders" className="underline underline-offset-2">
          Learn how we vet builders
        </a>
        .
      </div>
    </div>
  );
}
