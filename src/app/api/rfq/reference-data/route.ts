import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [cities, events, services, boothSizes] = await Promise.all([
    prisma.city.findMany({
      select: { slug: true, name: true, state: true },
      orderBy: { name: "asc" },
    }),
    prisma.event.findMany({
      select: { id: true, slug: true, name: true, citySlug: true },
      orderBy: { name: "asc" },
    }),
    prisma.service.findMany({
      select: { id: true, slug: true, name: true, type: true },
      orderBy: { name: "asc" },
    }),
    prisma.boothSize.findMany({
      select: { id: true, code: true, label: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return NextResponse.json({ cities, events, services, boothSizes });
}
