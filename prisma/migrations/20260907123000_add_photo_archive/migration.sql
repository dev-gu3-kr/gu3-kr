ALTER TYPE "AdminMenuPermission" ADD VALUE 'PHOTO_ARCHIVE';

CREATE TYPE "ArchivePhotoStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN');
CREATE TYPE "FileAssetVariant" AS ENUM ('GENERAL', 'ORIGINAL', 'DISPLAY', 'THUMBNAIL');

ALTER TABLE "FileAsset"
ADD COLUMN "width" INTEGER,
ADD COLUMN "height" INTEGER,
ADD COLUMN "checksum" TEXT,
ADD COLUMN "variant" "FileAssetVariant" NOT NULL DEFAULT 'GENERAL';

CREATE TABLE "ArchivePhoto" (
  "id" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "status" "ArchivePhotoStatus" NOT NULL DEFAULT 'DRAFT',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "caption" TEXT,
  "altText" TEXT,
  "sourcePath" TEXT,
  "originalAssetId" TEXT NOT NULL,
  "displayAssetId" TEXT NOT NULL,
  "uploadedById" TEXT NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ArchivePhoto_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ArchivePhotoYearHistory" (
  "id" TEXT NOT NULL,
  "photoId" TEXT NOT NULL,
  "fromYear" INTEGER NOT NULL,
  "toYear" INTEGER NOT NULL,
  "changedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ArchivePhotoYearHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ArchivePhoto_sourcePath_key" ON "ArchivePhoto"("sourcePath");
CREATE UNIQUE INDEX "ArchivePhoto_originalAssetId_key" ON "ArchivePhoto"("originalAssetId");
CREATE UNIQUE INDEX "ArchivePhoto_displayAssetId_key" ON "ArchivePhoto"("displayAssetId");
CREATE INDEX "FileAsset_checksum_variant_idx" ON "FileAsset"("checksum", "variant");
CREATE INDEX "ArchivePhoto_status_year_sortOrder_id_idx" ON "ArchivePhoto"("status", "year", "sortOrder", "id");
CREATE INDEX "ArchivePhoto_year_sortOrder_id_idx" ON "ArchivePhoto"("year", "sortOrder", "id");
CREATE INDEX "ArchivePhoto_uploadedById_createdAt_idx" ON "ArchivePhoto"("uploadedById", "createdAt");
CREATE INDEX "ArchivePhoto_deletedAt_idx" ON "ArchivePhoto"("deletedAt");
CREATE INDEX "ArchivePhotoYearHistory_photoId_createdAt_idx" ON "ArchivePhotoYearHistory"("photoId", "createdAt");
CREATE INDEX "ArchivePhotoYearHistory_changedById_createdAt_idx" ON "ArchivePhotoYearHistory"("changedById", "createdAt");

ALTER TABLE "ArchivePhoto"
ADD CONSTRAINT "ArchivePhoto_originalAssetId_fkey"
FOREIGN KEY ("originalAssetId") REFERENCES "FileAsset"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ArchivePhoto"
ADD CONSTRAINT "ArchivePhoto_displayAssetId_fkey"
FOREIGN KEY ("displayAssetId") REFERENCES "FileAsset"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ArchivePhoto"
ADD CONSTRAINT "ArchivePhoto_uploadedById_fkey"
FOREIGN KEY ("uploadedById") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ArchivePhotoYearHistory"
ADD CONSTRAINT "ArchivePhotoYearHistory_photoId_fkey"
FOREIGN KEY ("photoId") REFERENCES "ArchivePhoto"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ArchivePhotoYearHistory"
ADD CONSTRAINT "ArchivePhotoYearHistory_changedById_fkey"
FOREIGN KEY ("changedById") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
