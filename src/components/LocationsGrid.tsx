import Link from "next/link";
import { CITIES } from "@/lib/constants";

export default function LocationsGrid() {
  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900">
          Find Trade Show Booth Builders Across the USA
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Get matched with booth builders serving major US trade show
          destinations.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {CITIES.map((city) => (
            <Link
              key={city.slug}
              href={`/trade-show-booth-builders/${city.slug}`}
              className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-400 hover:shadow-sm"
            >
              <h3 className="text-sm font-semibold text-slate-900">
                {city.name}
              </h3>
              <p className="mt-1 text-xs text-slate-500">{city.state}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
