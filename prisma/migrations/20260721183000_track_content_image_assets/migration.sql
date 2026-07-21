-- CreateEnum
CREATE TYPE "ContentImageStatus" AS ENUM ('PENDING', 'ATTACHED');

-- CreateTable
CREATE TABLE "ContentImageAsset" (
    "id" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "status" "ContentImageStatus" NOT NULL DEFAULT 'PENDING',
    "uploadedById" TEXT NOT NULL,
    "postId" TEXT,
    "attachedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentImageAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentImageAsset_objectKey_key" ON "ContentImageAsset"("objectKey");

-- CreateIndex
CREATE UNIQUE INDEX "ContentImageAsset_url_key" ON "ContentImageAsset"("url");

-- CreateIndex
CREATE INDEX "ContentImageAsset_status_createdAt_idx" ON "ContentImageAsset"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ContentImageAsset_postId_idx" ON "ContentImageAsset"("postId");

-- CreateIndex
CREATE INDEX "ContentImageAsset_uploadedById_createdAt_idx" ON "ContentImageAsset"("uploadedById", "createdAt");

-- AddForeignKey
ALTER TABLE "ContentImageAsset" ADD CONSTRAINT "ContentImageAsset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentImageAsset" ADD CONSTRAINT "ContentImageAsset_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
