import { prisma } from "@/lib/prisma";
import type { BudgetRange } from "@/generated/prisma/enums";

const MAX_MATCHES = 3;

// Approximate midpoint dollar value per budget range, used only to compare
// against a builder's minProjectBudget for a rough fit signal.
const BUDGET_MIDPOINT: Record<BudgetRange, number> = {
  UNDER_10K: 5_000,
  RANGE_10K_20K: 15_000,
  RANGE_20K_40K: 30_000,
  RANGE_40K_75K: 57_500,
  RANGE_75K_150K: 112_500,
  OVER_150K: 200_000,
  NOT_SURE: 30_000,
};

export interface MatchBreakdown {
  locationMatch: number;
  budgetFit: number;
  capabilityFit: number;
  boothSizeExperience: number;
  eventVenueExperience: number;
  responsePerformance: number;
  historicalConversion: number;
}

export interface ScoredBuilder {
  builderId: string;
  score: number;
  breakdown: MatchBreakdown;
}

// Weights sum to 100 per the spec's scoring model (RFQ matching section).
// boothSizeExperience, eventVenueExperience, responsePerformance and
// historicalConversion are scaffolded at 0 for now: they depend on data
// (per-booth-size portfolio history, response-time tracking, win-rate
// tracking) that isn't captured by the builder profile yet. Wiring real
// values in only requires filling these functions in — the weights and
// call sites don't change.
function scoreBuilder(
  builder: { minProjectBudget: number | null; locations: { citySlug: string }[]; capabilities: { serviceType: string }[] },
  rfq: { citySlug: string | null; budgetRange: string | null; serviceTypes: string[] }
): MatchBreakdown {
  const locationMatch =
    rfq.citySlug && builder.locations.some((l) => l.citySlug === rfq.citySlug) ? 20 : 0;

  let budgetFit = 0;
  if (rfq.budgetRange && rfq.budgetRange in BUDGET_MIDPOINT) {
    const rfqMidpoint = BUDGET_MIDPOINT[rfq.budgetRange as BudgetRange];
    if (builder.minProjectBudget == null) {
      budgetFit = 10; // unknown minimum: neutral, not disqualifying
    } else if (builder.minProjectBudget <= rfqMidpoint) {
      budgetFit = 20;
    } else if (builder.minProjectBudget <= rfqMidpoint * 1.5) {
      budgetFit = 8; // close but likely above budget
    }
  }

  let capabilityFit = 0;
  if (rfq.serviceTypes.length > 0) {
    const builderTypes = new Set(builder.capabilities.map((c) => c.serviceType));
    const matched = rfq.serviceTypes.filter((t) => builderTypes.has(t)).length;
    capabilityFit = Math.round((matched / rfq.serviceTypes.length) * 20);
  }

  return {
    locationMatch,
    budgetFit,
    capabilityFit,
    boothSizeExperience: 0,
    eventVenueExperience: 0,
    responsePerformance: 0,
    historicalConversion: 0,
  };
}

/**
 * Finds and scores eligible builders for an RFQ, persists up to
 * MAX_MATCHES BuilderMatch rows (highest score first), and returns them.
 * Eligibility: verified builders only. If the RFQ names a city, only
 * builders serving that city are considered.
 */
export async function matchBuildersForRfq(rfqId: string): Promise<ScoredBuilder[]> {
  const rfq = await prisma.rFQ.findUnique({
    where: { id: rfqId },
    include: { services: { include: { service: true } } },
  });
  if (!rfq) return [];

  const serviceTypes = rfq.services.map((s) => s.service.type);

  const candidates = await prisma.builder.findMany({
    where: {
      verified: true,
      ...(rfq.citySlug ? { locations: { some: { citySlug: rfq.citySlug } } } : {}),
    },
    include: { locations: true, capabilities: true },
  });

  const scored: ScoredBuilder[] = candidates
    .map((builder) => {
      const breakdown = scoreBuilder(builder, {
        citySlug: rfq.citySlug,
        budgetRange: rfq.budgetRange,
        serviceTypes,
      });
      const score = Object.values(breakdown).reduce((sum, v) => sum + v, 0);
      return { builderId: builder.id, score, breakdown };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_MATCHES);

  await prisma.$transaction([
    prisma.builderMatch.deleteMany({ where: { rfqId } }),
    ...scored.map((s) =>
      prisma.builderMatch.create({
        data: { rfqId, builderId: s.builderId, matchScore: s.score },
      })
    ),
  ]);

  return scored;
}
