import Link from "next/link";
import { CITIES, SERVICES, SITE_NAME } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {SITE_NAME}
            </h3>
            <p className="mt-3 text-sm text-slate-600">
              Compare trade show booth builders. Get up to 3 quotes for your
              next US exhibition.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Services</h3>
            <ul className="mt-3 space-y-2">
              {SERVICES.slice(0, 5).map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/trade-show-booth-rentals/${service.slug}`}
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Locations
            </h3>
            <ul className="mt-3 space-y-2">
              {CITIES.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/trade-show-booth-builders/${city.slug}`}
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Company</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/get-quotes"
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  Get 3 Quotes
                </Link>
              </li>
              <li>
                <Link
                  href="/guides"
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/trade-show-booth-builders"
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  Find Builders
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="max-w-3xl text-xs leading-relaxed text-slate-500">
            We review your project requirements and connect suitable requests
            with independent trade show booth providers. Providers may pay us
            referral or marketing fees.
          </p>
          <p className="mt-3 text-xs text-slate-400">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
