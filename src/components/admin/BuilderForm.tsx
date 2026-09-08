import { prisma } from "@/lib/prisma";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";

interface BuilderFormProps {
  action: (formData: FormData) => void;
  submitLabel: string;
  builder?: {
    id: string;
    companyName: string;
    website: string | null;
    description: string | null;
    verified: boolean;
    locations: { citySlug: string }[];
    capabilities: { serviceType: string }[];
  };
}

// Callers (admin/builders/new and admin/builders/[id]) both check
// hasDatabase before rendering this component.
export default async function BuilderForm({ action, submitLabel, builder }: BuilderFormProps) {
  const [cities, services] = await Promise.all([
    prisma!.city.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
    prisma!.service.findMany({ select: { type: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const selectedCities = new Set(builder?.locations.map((l) => l.citySlug) ?? []);
  const selectedServices = new Set(builder?.capabilities.map((c) => c.serviceType) ?? []);

  return (
    <form action={action} className="card space-y-6">
      {builder && <input type="hidden" name="builderId" value={builder.id} />}

      <Field label="Company Name" required>
        <input
          type="text"
          name="companyName"
          required
          defaultValue={builder?.companyName}
          className="input"
        />
      </Field>

      <Field label="Website" optional>
        <input type="text" name="website" defaultValue={builder?.website ?? ""} className="input" />
      </Field>

      <Field label="Description" optional>
        <textarea
          name="description"
          rows={4}
          defaultValue={builder?.description ?? ""}
          className="input"
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="verified" defaultChecked={builder?.verified} />
        Verified
      </label>

      <div>
        <span className="mb-2 block text-sm font-medium text-slate-700">Cities Served</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {cities.map((city) => (
            <label key={city.slug} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="citySlugs"
                value={city.slug}
                defaultChecked={selectedCities.has(city.slug)}
              />
              {city.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-slate-700">Capabilities</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {services.map((service) => (
            <label key={service.type} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="serviceTypes"
                value={service.type}
                defaultChecked={selectedServices.has(service.type)}
              />
              {service.name}
            </label>
          ))}
        </div>
      </div>

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
