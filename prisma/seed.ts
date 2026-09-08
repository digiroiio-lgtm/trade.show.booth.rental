import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  BOOTH_SIZES,
  CITIES,
  SERVICES,
  TRADE_SHOWS,
} from "../src/lib/constants";
import type { BoothSizeCode, ServiceType } from "../src/generated/prisma/enums";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Explicit slug -> ServiceType mapping. Not inferred, kept in sync by hand
// with src/lib/constants.ts#SERVICES.
const SERVICE_TYPE_BY_SLUG: Record<string, ServiceType> = {
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

// Explicit label -> BoothSizeCode mapping. Order matches BOOTH_SIZES for
// sortOrder.
const BOOTH_SIZE_CODE_BY_LABEL: Record<string, BoothSizeCode> = {
  "10x10": "SIZE_10X10",
  "10x20": "SIZE_10X20",
  "20x20": "SIZE_20X20",
  "20x30": "SIZE_20X30",
  "20x40": "SIZE_20X40",
  "30x30": "SIZE_30X30",
  "40x40+": "SIZE_40X40_PLUS",
  "Not sure": "NOT_SURE",
};

async function main() {
  for (const city of CITIES) {
    await prisma.city.upsert({
      where: { slug: city.slug },
      update: { name: city.name, state: city.state, intro: city.intro },
      create: {
        slug: city.slug,
        name: city.name,
        state: city.state,
        intro: city.intro,
      },
    });

    for (const venueName of city.venues) {
      await prisma.venue.upsert({
        where: { citySlug_name: { citySlug: city.slug, name: venueName } },
        update: {},
        create: { citySlug: city.slug, name: venueName },
      });
    }
  }

  for (const show of TRADE_SHOWS) {
    await prisma.event.upsert({
      where: { slug: show.slug },
      update: {
        name: show.name,
        overview: show.overview,
        citySlug: show.citySlug ?? null,
      },
      create: {
        slug: show.slug,
        name: show.name,
        overview: show.overview,
        citySlug: show.citySlug ?? null,
      },
    });
  }

  for (const service of SERVICES) {
    const type = SERVICE_TYPE_BY_SLUG[service.slug];
    if (!type) {
      throw new Error(`No ServiceType mapping for service slug "${service.slug}"`);
    }
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        name: service.name,
        description: service.description,
        type,
      },
      create: {
        slug: service.slug,
        name: service.name,
        description: service.description,
        type,
      },
    });
  }

  for (const [index, label] of BOOTH_SIZES.entries()) {
    const code = BOOTH_SIZE_CODE_BY_LABEL[label];
    if (!code) {
      throw new Error(`No BoothSizeCode mapping for booth size label "${label}"`);
    }
    await prisma.boothSize.upsert({
      where: { code },
      update: { label, sortOrder: index },
      create: { code, label, sortOrder: index },
    });
  }

  const [cityCount, venueCount, eventCount, serviceCount, boothSizeCount] =
    await Promise.all([
      prisma.city.count(),
      prisma.venue.count(),
      prisma.event.count(),
      prisma.service.count(),
      prisma.boothSize.count(),
    ]);

  console.log(
    `Seeded: ${cityCount} cities, ${venueCount} venues, ${eventCount} events, ${serviceCount} services, ${boothSizeCount} booth sizes.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
