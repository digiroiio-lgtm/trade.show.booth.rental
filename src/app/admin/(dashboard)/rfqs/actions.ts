"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hasDatabase } from "@/lib/hasDatabase";
import { LeadStatus } from "@/generated/prisma/enums";
import { matchBuildersForRfq } from "@/lib/matching";

const STATUS_VALUES = Object.values(LeadStatus);

export async function updateRfqStatus(formData: FormData) {
  if (!hasDatabase) return;

  const rfqId = String(formData.get("rfqId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!rfqId || !STATUS_VALUES.includes(status as LeadStatus)) return;

  await prisma!.rFQ.update({
    where: { id: rfqId },
    data: { status: status as LeadStatus },
  });

  revalidatePath(`/admin/rfqs/${rfqId}`);
  revalidatePath("/admin/rfqs");
  revalidatePath("/admin");
}

export async function addAdminNote(formData: FormData) {
  if (!hasDatabase) return;

  const rfqId = String(formData.get("rfqId") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!rfqId || !note) return;

  await prisma!.adminNote.create({ data: { rfqId, note } });

  revalidatePath(`/admin/rfqs/${rfqId}`);
}

export async function rerunMatching(formData: FormData) {
  if (!hasDatabase) return;

  const rfqId = String(formData.get("rfqId") ?? "");
  if (!rfqId) return;

  await matchBuildersForRfq(rfqId);

  revalidatePath(`/admin/rfqs/${rfqId}`);
}

export async function assignBuilder(formData: FormData) {
  if (!hasDatabase) return;

  const rfqId = String(formData.get("rfqId") ?? "");
  const builderId = String(formData.get("builderId") ?? "");
  if (!rfqId || !builderId) return;

  await prisma!.builderMatch.upsert({
    where: { rfqId_builderId: { rfqId, builderId } },
    update: {},
    create: { rfqId, builderId, matchScore: null },
  });

  revalidatePath(`/admin/rfqs/${rfqId}`);
}

export async function createOpportunity(formData: FormData) {
  if (!hasDatabase) return;

  const rfqId = String(formData.get("rfqId") ?? "");
  const builderId = String(formData.get("builderId") ?? "");
  if (!rfqId || !builderId) return;

  const existing = await prisma!.opportunity.findFirst({ where: { rfqId, builderId } });
  if (!existing) {
    await prisma!.opportunity.create({ data: { rfqId, builderId } });
  }

  revalidatePath(`/admin/rfqs/${rfqId}`);
}
