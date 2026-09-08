import type { BoothSizeCode, BudgetRange } from "@/generated/prisma/enums";

export interface LeadScoreInput {
  budgetRange: BudgetRange | null;
  boothSizeCode: BoothSizeCode | null;
  serviceCount: number;
  eventKnown: boolean;
  eventDate: Date | null;
  hasProjectDescription: boolean;
  hasCompanyWebsite: boolean;
  hasCompanyIndustry: boolean;
  email: string;
}

export interface LeadScoreResult {
  score: number;
  tier: "A" | "B" | "C";
  breakdown: Record<string, number>;
}

const FREE_MAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "live.com",
  "protonmail.com",
]);

const BUDGET_WEIGHTS: Record<BudgetRange, number> = {
  UNDER_10K: 2,
  RANGE_10K_20K: 6,
  RANGE_20K_40K: 12,
  RANGE_40K_75K: 18,
  RANGE_75K_150K: 22,
  OVER_150K: 25,
  NOT_SURE: 5,
};

const BOOTH_SIZE_WEIGHTS: Record<BoothSizeCode, number> = {
  SIZE_10X10: 3,
  SIZE_10X20: 6,
  SIZE_20X20: 10,
  SIZE_20X30: 12,
  SIZE_20X40: 14,
  SIZE_30X30: 14,
  SIZE_40X40_PLUS: 15,
  NOT_SURE: 3,
};

const WEIGHTS = {
  serviceCountPerItem: 2,
  serviceCountMax: 10,
  eventKnown: 10,
  eventDateNearTerm: 8,
  eventDateHasDate: 4,
  projectDescription: 8,
  companyWebsite: 8,
  companyIndustry: 4,
  businessEmail: 8,
};

function isFreeMailDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  return !domain || FREE_MAIL_DOMAINS.has(domain);
}

function scoreEventDate(eventDate: Date | null): number {
  if (!eventDate) return 0;
  const daysUntil = (eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (daysUntil < 0) return WEIGHTS.eventDateHasDate;
  if (daysUntil <= 270) return WEIGHTS.eventDateHasDate + WEIGHTS.eventDateNearTerm;
  return WEIGHTS.eventDateHasDate;
}

export function computeLeadScore(input: LeadScoreInput): LeadScoreResult {
  const breakdown: Record<string, number> = {
    budget: input.budgetRange ? BUDGET_WEIGHTS[input.budgetRange] : 0,
    boothSize: input.boothSizeCode ? BOOTH_SIZE_WEIGHTS[input.boothSizeCode] : 0,
    services: Math.min(
      input.serviceCount * WEIGHTS.serviceCountPerItem,
      WEIGHTS.serviceCountMax
    ),
    eventKnown: input.eventKnown ? WEIGHTS.eventKnown : 0,
    eventDate: scoreEventDate(input.eventDate),
    projectDescription: input.hasProjectDescription ? WEIGHTS.projectDescription : 0,
    companyWebsite: input.hasCompanyWebsite ? WEIGHTS.companyWebsite : 0,
    companyIndustry: input.hasCompanyIndustry ? WEIGHTS.companyIndustry : 0,
    businessEmail: isFreeMailDomain(input.email) ? 0 : WEIGHTS.businessEmail,
  };

  const rawScore = Object.values(breakdown).reduce((sum, v) => sum + v, 0);
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  const tier: LeadScoreResult["tier"] =
    score >= 70 ? "A" : score >= 50 ? "B" : "C";

  return { score, tier, breakdown };
}
