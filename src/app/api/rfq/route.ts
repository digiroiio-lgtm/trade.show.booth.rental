import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeLeadScore } from "@/lib/leadScoring";
import { matchBuildersForRfq } from "@/lib/matching";
import { UPLOADS_ENABLED } from "@/lib/uploads";
import {
  BoothSizeCode,
  BudgetRange,
  PreferredContactMethod,
  RFQFileCategory,
  ServiceType,
} from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const TMP_UPLOAD_DIR = path.join(DATA_DIR, "uploads", "tmp");

interface RFQFileInput {
  tempPath: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  category: string;
}

interface RFQSubmission {
  eventId?: string;
  eventUnknown?: boolean;
  eventNameFreeText?: string;
  citySlug?: string;
  venueFreeText?: string;
  eventDate?: string;
  boothSizeCode?: string;
  serviceTypes?: string[];
  budgetRange?: string;
  projectDescription?: string;
  files?: RFQFileInput[];
  company: { name?: string; website?: string; industry?: string; country?: string };
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  preferredContact?: string;
  landingPage?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isEnumValue<T extends Record<string, string>>(
  enumObj: T,
  value: string
): value is T[keyof T] {
  return Object.values(enumObj).includes(value);
}

export async function POST(request: NextRequest) {
  let body: RFQSubmission;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim();
  const email = body.email?.trim();
  const companyName = body.company?.name?.trim();

  if (!firstName || !lastName || !email || !companyName) {
    return NextResponse.json(
      { error: "First name, last name, business email and company are required." },
      { status: 400 }
    );
  }
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "A valid business email is required." },
      { status: 400 }
    );
  }

  if (body.boothSizeCode && !isEnumValue(BoothSizeCode, body.boothSizeCode)) {
    return NextResponse.json({ error: "Invalid booth size." }, { status: 400 });
  }
  if (body.budgetRange && !isEnumValue(BudgetRange, body.budgetRange)) {
    return NextResponse.json({ error: "Invalid budget range." }, { status: 400 });
  }
  if (
    body.preferredContact &&
    !isEnumValue(PreferredContactMethod, body.preferredContact)
  ) {
    return NextResponse.json(
      { error: "Invalid preferred contact method." },
      { status: 400 }
    );
  }
  const serviceTypes = body.serviceTypes ?? [];
  for (const type of serviceTypes) {
    if (!isEnumValue(ServiceType, type)) {
      return NextResponse.json({ error: `Invalid service: ${type}` }, { status: 400 });
    }
  }
  for (const file of body.files ?? []) {
    if (!isEnumValue(RFQFileCategory, file.category)) {
      return NextResponse.json(
        { error: `Invalid file category: ${file.category}` },
        { status: 400 }
      );
    }
  }

  const eventDate = body.eventDate ? new Date(body.eventDate) : null;

  const [boothSizeRow, services] = await Promise.all([
    body.boothSizeCode
      ? prisma.boothSize.findUnique({ where: { code: body.boothSizeCode as BoothSizeCode } })
      : Promise.resolve(null),
    serviceTypes.length > 0
      ? prisma.service.findMany({ where: { type: { in: serviceTypes as ServiceType[] } } })
      : Promise.resolve([]),
  ]);

  const leadScore = computeLeadScore({
    budgetRange: (body.budgetRange as BudgetRange | undefined) ?? null,
    boothSizeCode: (body.boothSizeCode as BoothSizeCode | undefined) ?? null,
    serviceCount: services.length,
    eventKnown: Boolean(body.eventId) && !body.eventUnknown,
    eventDate,
    hasProjectDescription: (body.projectDescription?.trim().length ?? 0) > 0,
    hasCompanyWebsite: (body.company?.website?.trim().length ?? 0) > 0,
    hasCompanyIndustry: (body.company?.industry?.trim().length ?? 0) > 0,
    email,
  });

  const rfq = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: companyName,
        website: body.company?.website?.trim() || null,
        industry: body.company?.industry?.trim() || null,
        country: body.company?.country?.trim() || null,
      },
    });

    const created = await tx.rFQ.create({
      data: {
        eventId: body.eventId || null,
        eventUnknown: Boolean(body.eventUnknown),
        eventNameFreeText: body.eventNameFreeText?.trim() || null,
        citySlug: body.citySlug || null,
        venueFreeText: body.venueFreeText?.trim() || null,
        eventDate,
        boothSizeId: boothSizeRow?.id ?? null,
        boothSizeCode: (body.boothSizeCode as BoothSizeCode | undefined) ?? null,
        budgetRange: (body.budgetRange as BudgetRange | undefined) ?? null,
        projectDescription: body.projectDescription?.trim() || null,
        companyId: company.id,
        firstName,
        lastName,
        email,
        phone: body.phone?.trim() || null,
        preferredContact:
          (body.preferredContact as PreferredContactMethod | undefined) ?? "EMAIL",
        landingPage: body.landingPage?.trim() || null,
        services: {
          create: services.map((service) => ({ serviceId: service.id })),
        },
        attribution: {
          create: {
            utmSource: body.utmSource?.trim() || null,
            utmMedium: body.utmMedium?.trim() || null,
            utmCampaign: body.utmCampaign?.trim() || null,
            utmTerm: body.utmTerm?.trim() || null,
            utmContent: body.utmContent?.trim() || null,
            referrer: body.referrer?.trim() || null,
            landingPage: body.landingPage?.trim() || null,
          },
        },
        leadScore: {
          create: {
            score: leadScore.score,
            tier: leadScore.tier,
            breakdown: leadScore.breakdown,
          },
        },
      },
    });

    const files = UPLOADS_ENABLED ? (body.files ?? []) : [];
    if (files.length > 0) {
      const uploadDir = path.join(DATA_DIR, "uploads", created.id);
      await fs.mkdir(uploadDir, { recursive: true });

      for (const file of files) {
        const src = path.join(TMP_UPLOAD_DIR, path.basename(file.tempPath));
        const destName = `${Date.now()}-${path.basename(file.fileName).replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const dest = path.join(uploadDir, destName);
        await fs.rename(src, dest);

        await tx.rFQFile.create({
          data: {
            rfqId: created.id,
            category: file.category as RFQFileCategory,
            fileName: file.fileName,
            fileUrl: path.join("uploads", created.id, destName),
            mimeType: file.mimeType,
            sizeBytes: file.sizeBytes,
          },
        });
      }
    }

    return created;
  });

  try {
    await matchBuildersForRfq(rfq.id);
  } catch (err) {
    // Matching is best-effort at submission time; an admin can re-run it
    // manually from the RFQ detail page if this fails.
    console.error("Auto-matching failed for RFQ", rfq.id, err);
  }

  return NextResponse.json({ id: rfq.id }, { status: 201 });
}
