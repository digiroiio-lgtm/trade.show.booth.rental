// Static fallback for the RFQ wizard's reference data, used only when
// hasDatabase is false (temporary database-free deploy mode). Derived from
// the same constants.ts content the Prisma seed script uses, with the same
// slug/label -> enum mappings, so the wizard stays browsable without a
// database. RFQ submission itself is still disabled in this mode — see
// src/app/api/rfq/route.ts.
import { BOOTH_SIZES, CITIES, SERVICES, TRADE_SHOWS } from "@/lib/constants";
import type { ReferenceData } from "@/lib/rfqTypes";

const SERVICE_TYPE_BY_SLUG: Record<string, string> = {
  "trade-show-booth-rental": "BOOTH_RENTAL",
  "custom-booth-design": "CUSTOM_DESIGN",
  "booth-fabrication": "FABRICATION",
  "trade-show-displays": "DISPLAYS",
  "island-booths": "ISLAND_BOOTHS",
  "installation-dismantling": "INSTALLATION_DISMANTLING",
  "graphics-signage": "GRAPHICS_SIGNAGE",
  "av-led": "AV_LED",
  furniture: "FURNITURE",
  "turnkey-exhibit-services": "TURNKEY_SERVICE",
};

const BOOTH_SIZE_CODE_BY_LABEL: Record<string, string> = {
  "10x10": "SIZE_10X10",
  "10x20": "SIZE_10X20",
  "20x20": "SIZE_20X20",
  "20x30": "SIZE_20X30",
  "20x40": "SIZE_20X40",
  "30x30": "SIZE_30X30",
  "40x40+": "SIZE_40X40_PLUS",
  "Not sure": "NOT_SURE",
};

export const STATIC_REFERENCE_DATA: ReferenceData = {
  cities: CITIES.map((city) => ({ slug: city.slug, name: city.name, state: city.state })),
  events: TRADE_SHOWS.map((show) => ({
    id: show.slug,
    slug: show.slug,
    name: show.name,
    citySlug: show.citySlug ?? null,
  })),
  services: SERVICES.map((service) => ({
    id: service.slug,
    slug: service.slug,
    name: service.name,
    type: SERVICE_TYPE_BY_SLUG[service.slug],
  })),
  boothSizes: BOOTH_SIZES.map((label) => ({
    id: BOOTH_SIZE_CODE_BY_LABEL[label],
    code: BOOTH_SIZE_CODE_BY_LABEL[label],
    label,
  })),
};
