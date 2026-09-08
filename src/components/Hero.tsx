"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BOOTH_SIZES,
  EXHIBIT_CITY_OPTIONS,
  HERO_HEADLINE,
  HERO_SUBHEADLINE,
  HERO_TAGLINE,
  PRIMARY_CTA,
} from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";

const TRUST_POINTS = [
  "Free to compare",
  "No obligation",
  "US-based booth builders",
  "One brief — up to 3 quotes",
];

export default function Hero() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [size, setSize] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    trackEvent("quote_form_started", { source: "hero", city, size });
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (size) params.set("size", size);
    params.set("utm_source", "homepage");
    router.push(`/get-quotes?${params.toString()}`);
  }

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {HERO_HEADLINE}
            <span className="mt-2 block text-slate-900">
              {HERO_SUBHEADLINE}
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-600">
            {HERO_TAGLINE}
          </p>

          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TRUST_POINTS.map((point) => (
              <li
                key={point}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                <span className="text-slate-900" aria-hidden="true">
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900">
            Where are you exhibiting?
          </h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-5">
            <div>
              <label
                htmlFor="hero-city"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Where are you exhibiting?
              </label>
              <select
                id="hero-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
              >
                <option value="">Select a city</option>
                {EXHIBIT_CITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="hero-size"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                What booth size do you need?
              </label>
              <select
                id="hero-size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
              >
                <option value="">Select a booth size</option>
                {BOOTH_SIZES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {PRIMARY_CTA} →
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
