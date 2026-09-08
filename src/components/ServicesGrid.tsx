import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ServicesGrid() {
  const services = await prisma.service.findMany({
    select: { slug: true, name: true, description: true },
    orderBy: { name: "asc" },
  });

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900">Services</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Compare booth builders across every stage of your exhibit project.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/trade-show-booth-rentals/${service.slug}`}
              className="rounded-lg border border-slate-200 p-5 transition hover:border-slate-400 hover:shadow-sm"
            >
              <h3 className="text-sm font-semibold text-slate-900">
                {service.name}
              </h3>
              <p className="mt-2 text-xs text-slate-600">
                {service.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
