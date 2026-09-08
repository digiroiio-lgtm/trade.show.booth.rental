"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { ServiceType } from "@/generated/prisma/enums";

const SERVICE_TYPE_VALUES = Object.values(ServiceType);

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const baseSlug = slugify(base) || "builder";
  let slug = baseSlug;
  let suffix = 1;
  for (;;) {
    const existing = await prisma.builder.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

function parseFormBase(formData: FormData) {
  const companyName = String(formData.get("companyName") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const verified = formData.get("verified") === "on";
  const citySlugs = formData.getAll("citySlugs").map(String);
  const serviceTypes = formData
    .getAll("serviceTypes")
    .map(String)
    .filter((t): t is ServiceType => SERVICE_TYPE_VALUES.includes(t as ServiceType));

  return { companyName, website, description, verified, citySlugs, serviceTypes };
}

export async function createBuilder(formData: FormData) {
  const { companyName, website, description, verified, citySlugs, serviceTypes } =
    parseFormBase(formData);
  if (!companyName) return;

  const slug = await uniqueSlug(companyName);

  const builder = await prisma.builder.create({
    data: {
      slug,
      companyName,
      website: website || null,
      description: description || null,
      verified,
      locations: { create: citySlugs.map((citySlug) => ({ citySlug })) },
      capabilities: { create: serviceTypes.map((serviceType) => ({ serviceType })) },
    },
  });

  revalidatePath("/admin/builders");
  redirect(`/admin/builders/${builder.id}`);
}

export async function updateBuilder(formData: FormData) {
  const id = String(formData.get("builderId") ?? "");
  if (!id) return;
  const { companyName, website, description, verified, citySlugs, serviceTypes } =
    parseFormBase(formData);
  if (!companyName) return;

  const current = await prisma.builder.findUnique({ where: { id } });
  if (!current) return;

  const slug =
    slugify(companyName) === current.slug.replace(/-\d+$/, "")
      ? current.slug
      : await uniqueSlug(companyName, id);

  await prisma.$transaction([
    prisma.builder.update({
      where: { id },
      data: {
        slug,
        companyName,
        website: website || null,
        description: description || null,
        verified,
      },
    }),
    prisma.builderLocation.deleteMany({ where: { builderId: id } }),
    prisma.builderCapability.deleteMany({ where: { builderId: id } }),
    ...(citySlugs.length > 0
      ? [
          prisma.builderLocation.createMany({
            data: citySlugs.map((citySlug) => ({ builderId: id, citySlug })),
          }),
        ]
      : []),
    ...(serviceTypes.length > 0
      ? [
          prisma.builderCapability.createMany({
            data: serviceTypes.map((serviceType) => ({ builderId: id, serviceType })),
          }),
        ]
      : []),
  ]);

  revalidatePath("/admin/builders");
  revalidatePath(`/admin/builders/${id}`);
}

export async function deleteBuilder(formData: FormData) {
  const id = String(formData.get("builderId") ?? "");
  if (!id) return;
  await prisma.builder.delete({ where: { id } });
  revalidatePath("/admin/builders");
  redirect("/admin/builders");
}
