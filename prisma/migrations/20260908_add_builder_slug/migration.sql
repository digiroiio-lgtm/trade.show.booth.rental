-- AlterTable
ALTER TABLE "Builder" ADD COLUMN "slug" TEXT;

-- Backfill (no existing rows expected in dev, but keep this safe)
UPDATE "Builder" SET "slug" = "id" WHERE "slug" IS NULL;

ALTER TABLE "Builder" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Builder_slug_key" ON "Builder"("slug");
