"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BOOTH_SIZES,
  BUDGET_RANGES,
  SERVICES_NEEDED,
} from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";

interface FormState {
  event: string;
  city: string;
  venue: string;
  eventDate: string;
  boothSize: string;
  services: string[];
  budget: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  notes: string;
}

const TOTAL_STEPS = 5;

const STEP_TITLES = [
  "Your Event",
  "Booth Size",
  "What Do You Need?",
  "Budget",
  "Contact Details",
];

export default function QuoteForm() {
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(() => ({
    event: searchParams.get("event") ?? "",
    city: searchParams.get("city") ?? "",
    venue: "",
    eventDate: "",
    boothSize: searchParams.get("size") ?? "",
    services: [],
    budget: "",
    name: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    notes: "",
  }));

  const utm = useMemo(
    () => ({
      utmSource: searchParams.get("utm_source") ?? undefined,
      utmMedium: searchParams.get("utm_medium") ?? undefined,
      utmCampaign: searchParams.get("utm_campaign") ?? undefined,
    }),
    [searchParams]
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleService(service: string) {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  }

  function goNext() {
    if (step === 1) {
      trackEvent("quote_form_started", { event: form.event, city: form.city });
    }
    const nextStep = Math.min(step + 1, TOTAL_STEPS);
    trackEvent("quote_form_step", { step: nextStep });
    setStep(nextStep);
  }

  function goBack() {
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          landingPage:
            typeof window !== "undefined" ? window.location.pathname : "",
          ...utm,
        }),
      });
      if (!res.ok) {
        throw new Error("Submission failed");
      }
      trackEvent("quote_form_completed", {
        event: form.event,
        city: form.city,
        boothSize: form.boothSize,
        budget: form.budget,
      });
      setSubmitted(true);
    } catch {
      setError(
        "Something went wrong submitting your request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">
          Thanks — we&apos;ve received your booth request.
        </h2>
        <p className="mt-3 text-slate-600">
          We&apos;ll review your project and identify suitable exhibit
          partners.
        </p>
      </div>
    );
  }

  const canProceedStep1 = form.event.trim().length > 0 && form.city.trim().length > 0;
  const canProceedStep2 = form.boothSize.trim().length > 0;
  const canProceedStep3 = form.services.length > 0;
  const canProceedStep4 = form.budget.trim().length > 0;
  const canSubmit =
    form.name.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.company.trim().length > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>
            Step {step} of {TOTAL_STEPS}
          </span>
          <span>{STEP_TITLES[step - 1]}</span>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
          <div
            className="h-1.5 rounded-full bg-slate-900 transition-all"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <fieldset className="space-y-5">
            <legend className="text-lg font-semibold text-slate-900">
              Tell us about your event
            </legend>
            <Field label="Trade Show / Event Name" required>
              <input
                type="text"
                required
                value={form.event}
                onChange={(e) => update("event", e.target.value)}
                className="input"
                placeholder="e.g. CES"
              />
            </Field>
            <Field label="City" required>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className="input"
                placeholder="e.g. Las Vegas"
              />
            </Field>
            <Field label="Venue" optional>
              <input
                type="text"
                value={form.venue}
                onChange={(e) => update("venue", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Event Date" optional>
              <input
                type="date"
                value={form.eventDate}
                onChange={(e) => update("eventDate", e.target.value)}
                className="input"
              />
            </Field>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-slate-900">
              What booth size do you need?
            </legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {BOOTH_SIZES.map((size) => (
                <button
                  type="button"
                  key={size}
                  onClick={() => update("boothSize", size)}
                  className={`rounded-lg border px-4 py-4 text-sm font-medium transition ${
                    form.boothSize === size
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-700 hover:border-slate-400"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 3 && (
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-slate-900">
              What do you need? (select all that apply)
            </legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {SERVICES_NEEDED.map((service) => (
                <button
                  type="button"
                  key={service}
                  onClick={() => toggleService(service)}
                  className={`rounded-lg border px-4 py-4 text-sm font-medium transition ${
                    form.services.includes(service)
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-700 hover:border-slate-400"
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 4 && (
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-slate-900">
              What is your estimated budget?
            </legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {BUDGET_RANGES.map((range) => (
                <button
                  type="button"
                  key={range}
                  onClick={() => update("budget", range)}
                  className={`rounded-lg border px-4 py-4 text-sm font-medium transition ${
                    form.budget === range
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-700 hover:border-slate-400"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 5 && (
          <fieldset className="space-y-5">
            <legend className="text-lg font-semibold text-slate-900">
              Contact details
            </legend>
            <Field label="Name" required>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Company" required>
              <input
                type="text"
                required
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Business Email" required>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Phone" optional>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Website" optional>
              <input
                type="text"
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Project Notes" optional>
              <textarea
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                rows={4}
                className="input"
              />
            </Field>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </fieldset>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={goBack}
              className="rounded-md border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
          ) : (
            <span />
          )}

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={goNext}
              disabled={
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2) ||
                (step === 3 && !canProceedStep3) ||
                (step === 4 && !canProceedStep4)
              }
              className="rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue →
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? "Submitting…" : "GET MY 3 QUOTES"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
        {optional && (
          <span className="ml-1 font-normal text-slate-400">(optional)</span>
        )}
        {required && <span className="ml-1 text-slate-400">*</span>}
      </span>
      {children}
    </label>
  );
}
