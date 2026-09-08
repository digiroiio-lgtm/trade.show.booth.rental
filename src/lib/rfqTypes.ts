export interface ReferenceCity {
  slug: string;
  name: string;
  state: string;
}

export interface ReferenceEvent {
  id: string;
  slug: string;
  name: string;
  citySlug: string | null;
}

export interface ReferenceService {
  id: string;
  slug: string;
  name: string;
  type: string;
}

export interface ReferenceBoothSize {
  id: string;
  code: string;
  label: string;
}

export interface ReferenceData {
  cities: ReferenceCity[];
  events: ReferenceEvent[];
  services: ReferenceService[];
  boothSizes: ReferenceBoothSize[];
}

export interface UploadedRfqFile {
  tempPath: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  category: "FLOOR_PLAN" | "INSPIRATION" | "BRAND_GUIDELINES";
}

export const BUDGET_OPTIONS = [
  { value: "UNDER_10K", label: "Under $10,000" },
  { value: "RANGE_10K_20K", label: "$10K–$20K" },
  { value: "RANGE_20K_40K", label: "$20K–$40K" },
  { value: "RANGE_40K_75K", label: "$40K–$75K" },
  { value: "RANGE_75K_150K", label: "$75K–$150K" },
  { value: "OVER_150K", label: "$150K+" },
  { value: "NOT_SURE", label: "Not sure" },
] as const;

export const PREFERRED_CONTACT_OPTIONS = [
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Phone" },
  { value: "EITHER", label: "Either" },
] as const;

export const FILE_CATEGORIES = [
  { value: "FLOOR_PLAN", label: "Floor Plan" },
  { value: "INSPIRATION", label: "Inspiration Images" },
  { value: "BRAND_GUIDELINES", label: "Brand Guidelines" },
] as const;
