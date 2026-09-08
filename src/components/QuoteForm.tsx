"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import EventSelect from "@/components/EventSelect";
import { trackEvent } from "@/lib/analytics";
import {
  BUDGET_OPTIONS,
  FILE_CATEGORIES,
  PREFERRED_CONTACT_OPTIONS,
  type ReferenceData,
  type UploadedRfqFile,
} from "@/lib/rfqTypes";

interface FormState {
  eventId: string | null;
  eventUnknown: boolean;
  eventNameFreeText: string;
  citySlug: string;
  venueFreeText: string;
  eventDate: string;
  boothSizeCode: string;
  serviceTypes: string[];
  budgetRange: string;
  projectDescription: string;
  files: UploadedRfqFile[];
  companyName: string;
  companyWebsite: string;
  companyIndustry: string;
  companyCountry: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredContact: string;
}

const TOTAL_STEPS = 7;

const STEP_TITLES = [
  "Your Event",
  "Booth Size",
  "What Do You Need?",
  "Budget",
  "Project Details",
  "Your Company",
  "Contact Details",
];

export default function QuoteForm({
  referenceData,
  uploadsEnabled = true,
}: {
  referenceData: ReferenceData;
  uploadsEnabled?: boolean;
}) {
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(() => {
    const sizeParam = searchParams.get("size");
    const citySlugParam = searchParams.get("citySlug") ?? "";
    const matchedSize = referenceData.boothSizes.find(
      (b) => b.label.toLowerCase() === sizeParam?.toLowerCase()
    );
    const matchedCity = referenceData.cities.find((c) => c.slug === citySlugParam);

    return {
      eventId: null,
      eventUnknown: false,
      eventNameFreeText: "",
      citySlug: matchedCity?.slug ?? "",
      venueFreeText: "",
      eventDate: "",
      boothSizeCode: matchedSize?.code ?? "",
      serviceTypes: [],
      budgetRange: "",
      projectDescription: "",
      files: [],
      companyName: "",
      companyWebsite: "",
      companyIndustry: "",
      companyCountry: "United States",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      preferredContact: "EMAIL",
    };
  });

  const utm = useMemo(
    () => ({
      utmSource: searchParams.get("utm_source") ?? undefined,
      utmMedium: searchParams.get("utm_medium") ?? undefined,
      utmCampaign: searchParams.get("utm_campaign") ?? undefined,
      utmTerm: searchParams.get("utm_term") ?? undefined,
      utmContent: searchParams.get("utm_content") ?? undefined,
    }),
    [searchParams]
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleService(type: string) {
    setForm((prev) => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(type)
        ? prev.serviceTypes.filter((s) => s !== type)
        : [...prev.serviceTypes, type],
    }));
  }

  async function handleFileUpload(
    category: UploadedRfqFile["category"],
    fileList: FileList | null
  ) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(fileList)) {
        const body = new FormData();
        body.append("file", file);
        body.append("category", category);
        const res = await fetch("/api/rfq/upload", { method: "POST", body });
        if (!res.ok) throw new Error("Upload failed");
        const uploaded: UploadedRfqFile = await res.json();
        setForm((prev) => ({ ...prev, files: [...prev.files, uploaded] }));
      }
    } catch {
      setError("A file failed to upload. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeFile(tempPath: string) {
    setForm((prev) => ({
      ...prev,
      files: prev.files.filter((f) => f.tempPath !== tempPath),
    }));
  }

  function goNext() {
    if (step === 1) {
      trackEvent("hero_rfq_started", {
        eventId: form.eventId,
        citySlug: form.citySlug,
      });
    }
    const nextStep = Math.min(step + 1, TOTAL_STEPS);
    trackEvent("rfq_step_completed", { step: nextStep, stepName: STEP_TITLES[nextStep - 1] });
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
      const res = await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: form.eventId,
          eventUnknown: form.eventUnknown,
          eventNameFreeText: form.eventNameFreeText || undefined,
          citySlug: form.citySlug || undefined,
          venueFreeText: form.venueFreeText || undefined,
          eventDate: form.eventDate || undefined,
          boothSizeCode: form.boothSizeCode || undefined,
          serviceTypes: form.serviceTypes,
          budgetRange: form.budgetRange || undefined,
          projectDescription: form.projectDescription || undefined,
          files: form.files,
          company: {
            name: form.companyName,
            website: form.companyWebsite || undefined,
            industry: form.companyIndustry || undefined,
            country: form.companyCountry || undefined,
          },
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone || undefined,
          preferredContact: form.preferredContact,
          landingPage:
            typeof window !== "undefined" ? window.location.pathname : "",
          ...utm,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Something went wrong submitting your request. Please try again."
        );
      }
      trackEvent("rfq_form_completed", {
        citySlug: form.citySlug,
        boothSizeCode: form.boothSizeCode,
        budgetRange: form.budgetRange,
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong submitting your request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="card text-center">
        <h2 className="text-2xl font-bold text-slate-900">
          Your request has been received.
        </h2>
        <p className="mt-3 text-slate-600">
          We&apos;re identifying suitable exhibit partners for your project.
        </p>
      </div>
    );
  }

  const canProceedStep1 =
    form.eventUnknown ||
    Boolean(form.eventId) ||
    (form.eventNameFreeText.trim().length > 0 && form.citySlug.trim().length > 0);
  const canProceedStep2 = form.boothSizeCode.trim().length > 0;
  const canProceedStep3 = form.serviceTypes.length > 0;
  const canProceedStep4 = form.budgetRange.trim().length > 0;
  const canProceedStep5 = true;
  const canProceedStep6 = form.companyName.trim().length > 0;
  const canSubmit =
    form.firstName.trim().length > 0 &&
    form.lastName.trim().length > 0 &&
    form.email.trim().length > 0;

  const canProceed = [
    canProceedStep1,
    canProceedStep2,
    canProceedStep3,
    canProceedStep4,
    canProceedStep5,
    canProceedStep6,
  ][step - 1];

  return (
    <div className="card">
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
              What trade show are you exhibiting at?
            </legend>
            <EventSelect
              events={referenceData.events}
              cities={referenceData.cities}
              eventId={form.eventId}
              eventUnknown={form.eventUnknown}
              eventNameFreeText={form.eventNameFreeText}
              citySlug={form.citySlug}
              onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
            />
            {(form.eventId || form.eventUnknown) && (
              <Field label="City" optional>
                <select
                  className="input"
                  value={form.citySlug}
                  onChange={(e) => update("citySlug", e.target.value)}
                >
                  <option value="">Select a city</option>
                  {referenceData.cities.map((city) => (
                    <option key={city.slug} value={city.slug}>
                      {city.name}, {city.state}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Venue" optional>
              <input
                type="text"
                value={form.venueFreeText}
                onChange={(e) => update("venueFreeText", e.target.value)}
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
              {referenceData.boothSizes.map((size) => (
                <button
                  type="button"
                  key={size.code}
                  onClick={() => update("boothSizeCode", size.code)}
                  className={form.boothSizeCode === size.code ? "pill-selected" : "pill"}
                >
                  {size.label}
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
              {referenceData.services.map((service) => (
                <button
                  type="button"
                  key={service.type}
                  onClick={() => toggleService(service.type)}
                  className={
                    form.serviceTypes.includes(service.type) ? "pill-selected" : "pill"
                  }
                >
                  {service.name}
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
              {BUDGET_OPTIONS.map((range) => (
                <button
                  type="button"
                  key={range.value}
                  onClick={() => update("budgetRange", range.value)}
                  className={form.budgetRange === range.value ? "pill-selected" : "pill"}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 5 && (
          <fieldset className="space-y-5">
            <legend className="text-lg font-semibold text-slate-900">
              Tell us about your project
            </legend>
            <Field label="Project Description" optional>
              <textarea
                value={form.projectDescription}
                onChange={(e) => update("projectDescription", e.target.value)}
                rows={4}
                className="input"
                placeholder="Design goals, brand requirements, past booths, anything relevant."
              />
            </Field>
            {uploadsEnabled ? (
              FILE_CATEGORIES.map((category) => (
                <div key={category.value}>
                  <Field label={category.label} optional>
                    <input
                      type="file"
                      multiple
                      className="input"
                      disabled={uploading}
                      onChange={(e) => handleFileUpload(category.value, e.target.files)}
                    />
                  </Field>
                  <ul className="mt-2 space-y-1">
                    {form.files
                      .filter((f) => f.category === category.value)
                      .map((f) => (
                        <li
                          key={f.tempPath}
                          className="flex items-center justify-between text-xs text-slate-600"
                        >
                          <span>{f.fileName}</span>
                          <button
                            type="button"
                            className="text-slate-400 hover:text-slate-700"
                            onClick={() => removeFile(f.tempPath)}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                File uploads (floor plans, inspiration images, brand guidelines) are
                temporarily unavailable — you can share them with us after we&apos;re in
                touch.
              </p>
            )}
          </fieldset>
        )}

        {step === 6 && (
          <fieldset className="space-y-5">
            <legend className="text-lg font-semibold text-slate-900">
              Your company
            </legend>
            <Field label="Company Name" required>
              <input
                type="text"
                required
                value={form.companyName}
                onChange={(e) => update("companyName", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Website" optional>
              <input
                type="text"
                value={form.companyWebsite}
                onChange={(e) => update("companyWebsite", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Industry" optional>
              <input
                type="text"
                value={form.companyIndustry}
                onChange={(e) => update("companyIndustry", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Country" optional>
              <input
                type="text"
                value={form.companyCountry}
                onChange={(e) => update("companyCountry", e.target.value)}
                className="input"
              />
            </Field>
          </fieldset>
        )}

        {step === 7 && (
          <fieldset className="space-y-5">
            <legend className="text-lg font-semibold text-slate-900">
              Contact details
            </legend>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="First Name" required>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Last Name" required>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  className="input"
                />
              </Field>
            </div>
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
            <Field label="Preferred Contact Method" optional>
              <div className="flex gap-3">
                {PREFERRED_CONTACT_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => update("preferredContact", option.value)}
                    className={
                      form.preferredContact === option.value ? "pill-selected" : "pill"
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </Field>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </fieldset>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 1 ? (
            <Button type="button" variant="secondary" onClick={goBack}>
              Back
            </Button>
          ) : (
            <span />
          )}

          {step < TOTAL_STEPS ? (
            <Button type="button" onClick={goNext} disabled={!canProceed}>
              Continue →
            </Button>
          ) : (
            <Button type="submit" disabled={!canSubmit || submitting}>
              {submitting ? "Submitting…" : "GET MY 3 QUOTES"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
