-- CreateEnum
CREATE TYPE "GalleryPhotoStatus" AS ENUM ('PUBLISHED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "GalleryUploadStatus" AS ENUM ('WAITING', 'UPLOADING', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "nextGalleryPhotoOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "FileAsset" ADD COLUMN     "galleryCleanupPending" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "GalleryPhoto" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "originalAssetId" TEXT NOT NULL,
    "displayAssetId" TEXT NOT NULL,
    "thumbnailAssetId" TEXT NOT NULL,
    "status" "GalleryPhotoStatus" NOT NULL DEFAULT 'HIDDEN',
    "sortOrder" INTEGER NOT NULL,
    "sourceChecksum" TEXT NOT NULL,
    "caption" TEXT,
    "altText" TEXT,
    "takenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryUploadBatch" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryUploadBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryUploadItem" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "status" "GalleryUploadStatus" NOT NULL DEFAULT 'WAITING',
    "originalAssetId" TEXT,
    "photoId" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "leaseToken" TEXT,
    "leaseUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryUploadItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GalleryPhoto_originalAssetId_key" ON "GalleryPhoto"("originalAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryPhoto_displayAssetId_key" ON "GalleryPhoto"("displayAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryPhoto_thumbnailAssetId_key" ON "GalleryPhoto"("thumbnailAssetId");

-- CreateIndex
CREATE INDEX "GalleryPhoto_postId_status_sortOrder_id_idx" ON "GalleryPhoto"("postId", "status", "sortOrder", "id");

-- CreateIndex
CREATE INDEX "GalleryPhoto_postId_sortOrder_id_idx" ON "GalleryPhoto"("postId", "sortOrder", "id");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryPhoto_postId_sourceChecksum_key" ON "GalleryPhoto"("postId", "sourceChecksum");

-- CreateIndex
CREATE INDEX "GalleryUploadBatch_postId_createdAt_idx" ON "GalleryUploadBatch"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "GalleryUploadBatch_uploadedById_createdAt_idx" ON "GalleryUploadBatch"("uploadedById", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryUploadItem_originalAssetId_key" ON "GalleryUploadItem"("originalAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryUploadItem_photoId_key" ON "GalleryUploadItem"("photoId");

-- CreateIndex
CREATE INDEX "GalleryUploadItem_batchId_sortOrder_idx" ON "GalleryUploadItem"("batchId", "sortOrder");

-- CreateIndex
CREATE INDEX "GalleryUploadItem_status_leaseUntil_createdAt_idx" ON "GalleryUploadItem"("status", "leaseUntil", "createdAt");

-- CreateIndex
CREATE INDEX "FileAsset_galleryCleanupPending_createdAt_idx" ON "FileAsset"("galleryCleanupPending", "createdAt");

-- AddForeignKey
ALTER TABLE "GalleryPhoto" ADD CONSTRAINT "GalleryPhoto_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryPhoto" ADD CONSTRAINT "GalleryPhoto_originalAssetId_fkey" FOREIGN KEY ("originalAssetId") REFERENCES "FileAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryPhoto" ADD CONSTRAINT "GalleryPhoto_displayAssetId_fkey" FOREIGN KEY ("displayAssetId") REFERENCES "FileAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryPhoto" ADD CONSTRAINT "GalleryPhoto_thumbnailAssetId_fkey" FOREIGN KEY ("thumbnailAssetId") REFERENCES "FileAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryUploadBatch" ADD CONSTRAINT "GalleryUploadBatch_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryUploadBatch" ADD CONSTRAINT "GalleryUploadBatch_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryUploadItem" ADD CONSTRAINT "GalleryUploadItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "GalleryUploadBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryUploadItem" ADD CONSTRAINT "GalleryUploadItem_originalAssetId_fkey" FOREIGN KEY ("originalAssetId") REFERENCES "FileAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryUploadItem" ADD CONSTRAINT "GalleryUploadItem_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "GalleryPhoto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
