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

  await seedSampleBuilders();
}

// Fictional builders for local dev/testing of the admin panel and matching
// engine only. Names are clearly marked as sample data. Gated out of any
// seed run against a production database so no placeholder companies are
// ever shown to real exhibitors.
async function seedSampleBuilders() {
  if (process.env.NODE_ENV === "production") return;

  const samples: {
    slug: string;
    companyName: string;
    description: string;
    minProjectBudget: number;
    citySlugs: string[];
    serviceTypes: ServiceType[];
  }[] = [
    {
      slug: "sample-vegas-exhibits-demo",
      companyName: "Sample Vegas Exhibits (Demo)",
      description:
        "Sample dev/demo builder for local testing only. Full-service rental and custom design serving Las Vegas.",
      minProjectBudget: 15_000,
      citySlugs: ["las-vegas"],
      serviceTypes: ["BOOTH_RENTAL", "CUSTOM_DESIGN", "INSTALLATION_DISMANTLING"],
    },
    {
      slug: "sample-premier-island-builds-demo",
      companyName: "Sample Premier Island Builds (Demo)",
      description:
        "Sample dev/demo builder for local testing only. Large-format island exhibits for major Las Vegas trade shows.",
      minProjectBudget: 100_000,
      citySlugs: ["las-vegas"],
      serviceTypes: ["BOOTH_RENTAL", "ISLAND_BOOTHS", "AV_LED"],
    },
    {
      slug: "sample-orlando-booth-co-demo",
      companyName: "Sample Orlando Booth Co (Demo)",
      description:
        "Sample dev/demo builder for local testing only. Booth rental and graphics for Orlando-area exhibitors.",
      minProjectBudget: 5_000,
      citySlugs: ["orlando"],
      serviceTypes: ["BOOTH_RENTAL", "GRAPHICS_SIGNAGE", "FURNITURE"],
    },
  ];

  for (const sample of samples) {
    const builder = await prisma.builder.upsert({
      where: { slug: sample.slug },
      update: {
        companyName: sample.companyName,
        description: sample.description,
        minProjectBudget: sample.minProjectBudget,
        verified: true,
      },
      create: {
        slug: sample.slug,
        companyName: sample.companyName,
        description: sample.description,
        minProjectBudget: sample.minProjectBudget,
        verified: true,
      },
    });

    await prisma.builderLocation.deleteMany({ where: { builderId: builder.id } });
    await prisma.builderLocation.createMany({
      data: sample.citySlugs.map((citySlug) => ({ builderId: builder.id, citySlug })),
    });

    await prisma.builderCapability.deleteMany({ where: { builderId: builder.id } });
    await prisma.builderCapability.createMany({
      data: sample.serviceTypes.map((serviceType) => ({ builderId: builder.id, serviceType })),
    });
  }

  console.log(`Seeded ${samples.length} sample builders (dev/demo only).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
