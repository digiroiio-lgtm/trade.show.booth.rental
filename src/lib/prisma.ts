import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { hasDatabase } from "@/lib/hasDatabase";

declare global {
  var __boothQuotesPrisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

// `prisma` is null whenever DATABASE_URL isn't configured (temporary
// database-free deploy mode). Every call site must check `hasDatabase`
// (or a null-check) before using it — see src/lib/hasDatabase.ts.
export const prisma: PrismaClient | null = hasDatabase
  ? (global.__boothQuotesPrisma ?? createPrismaClient())
  : null;

if (hasDatabase && process.env.NODE_ENV !== "production") {
  global.__boothQuotesPrisma = prisma!;
}
