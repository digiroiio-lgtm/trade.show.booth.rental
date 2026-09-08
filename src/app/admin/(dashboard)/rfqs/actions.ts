"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { LeadStatus } from "@/generated/prisma/enums";

const STATUS_VALUES = Object.values(LeadStatus);

export async function updateRfqStatus(formData: FormData) {
  const rfqId = String(formData.get("rfqId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!rfqId || !STATUS_VALUES.includes(status as LeadStatus)) return;

  await prisma.rFQ.update({
    where: { id: rfqId },
    data: { status: status as LeadStatus },
  });

  revalidatePath(`/admin/rfqs/${rfqId}`);
  revalidatePath("/admin/rfqs");
  revalidatePath("/admin");
}

export async function addAdminNote(formData: FormData) {
  const rfqId = String(formData.get("rfqId") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!rfqId || !note) return;

  await prisma.adminNote.create({ data: { rfqId, note } });

  revalidatePath(`/admin/rfqs/${rfqId}`);
}
