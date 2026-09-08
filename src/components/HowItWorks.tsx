import Link from "next/link";
import { PRIMARY_CTA } from "@/lib/constants";

const STEPS = [
  {
    number: "1",
    title: "Tell Us About Your Booth",
    description:
      "Tell us the event, location, booth size and requirements.",
  },
  {
    number: "2",
    title: "We Find Suitable Builders",
    description:
      "We review your project and match it with relevant booth builders.",
  },
  {
    number: "3",
    title: "Compare Up to 3 Quotes",
    description: "Receive and compare proposals for your project.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-slate-900">
          How It Works
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {step.number}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/get-quotes"
            className="inline-block rounded-md bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            {PRIMARY_CTA}
          </Link>
        </div>
      </div>
    </section>
  );
}
