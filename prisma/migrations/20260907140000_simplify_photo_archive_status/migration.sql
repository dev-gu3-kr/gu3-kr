UPDATE "ArchivePhoto"
SET "status" = 'HIDDEN'
WHERE "status" = 'DRAFT' OR "deletedAt" IS NOT NULL;

ALTER TABLE "ArchivePhoto" ALTER COLUMN "status" DROP DEFAULT;
ALTER TYPE "ArchivePhotoStatus" RENAME TO "ArchivePhotoStatus_old";
CREATE TYPE "ArchivePhotoStatus" AS ENUM ('PUBLISHED', 'HIDDEN');
ALTER TABLE "ArchivePhoto"
ALTER COLUMN "status" TYPE "ArchivePhotoStatus"
USING ("status"::text::"ArchivePhotoStatus");
ALTER TABLE "ArchivePhoto" ALTER COLUMN "status" SET DEFAULT 'HIDDEN';
DROP TYPE "ArchivePhotoStatus_old";

DROP INDEX "ArchivePhoto_deletedAt_idx";
ALTER TABLE "ArchivePhoto" DROP COLUMN "deletedAt";
