-- CreateEnum
CREATE TYPE "PostAssetRole" AS ENUM ('CONTENT', 'COVER', 'ATTACHMENT');

-- CreateTable
CREATE TABLE "FileAsset" (
    "id" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostAsset" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "role" "PostAssetRole" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FileAsset_url_key" ON "FileAsset"("url");

-- CreateIndex
CREATE UNIQUE INDEX "FileAsset_bucket_objectKey_key" ON "FileAsset"("bucket", "objectKey");

-- CreateIndex
CREATE UNIQUE INDEX "PostAsset_postId_assetId_role_key" ON "PostAsset"("postId", "assetId", "role");

-- Backfill physical image assets already tracked by the upload lifecycle.
INSERT INTO "FileAsset" (
    "id",
    "bucket",
    "objectKey",
    "url",
    "originalName",
    "mimeType",
    "sizeBytes",
    "uploadedById",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    split_part(regexp_replace("url", '^https?://[^/]+/', ''), '/', 1),
    "objectKey",
    "url",
    "originalName",
    "mimeType",
    "sizeBytes",
    "uploadedById",
    "createdAt",
    "updatedAt"
FROM "ContentImageAsset";

-- Backfill bulletin files that were not part of content image tracking.
INSERT INTO "FileAsset" (
    "id",
    "bucket",
    "objectKey",
    "url",
    "originalName",
    "mimeType",
    "sizeBytes",
    "uploadedById",
    "createdAt",
    "updatedAt"
)
SELECT
    'fa_attachment_' || attachment."id",
    split_part(regexp_replace(attachment."url", '^https?://[^/]+/', ''), '/', 1),
    regexp_replace(attachment."url", '^https?://[^/]+/[^/]+/', ''),
    attachment."url",
    attachment."originalName",
    attachment."mimeType",
    attachment."sizeBytes",
    post."authorId",
    attachment."createdAt",
    attachment."createdAt"
FROM "Attachment" AS attachment
JOIN "Post" AS post ON post."id" = attachment."postId"
ON CONFLICT DO NOTHING;

-- Backfill any legacy post image that was not present in ContentImageAsset.
INSERT INTO "FileAsset" (
    "id",
    "bucket",
    "objectKey",
    "url",
    "originalName",
    "mimeType",
    "sizeBytes",
    "uploadedById",
    "createdAt",
    "updatedAt"
)
SELECT
    'fa_post_image_' || image."id",
    split_part(regexp_replace(image."url", '^https?://[^/]+/', ''), '/', 1),
    regexp_replace(image."url", '^https?://[^/]+/[^/]+/', ''),
    image."url",
    image."originalName",
    image."mimeType",
    image."sizeBytes",
    post."authorId",
    image."createdAt",
    image."createdAt"
FROM "PostImage" AS image
JOIN "Post" AS post ON post."id" = image."postId"
ON CONFLICT DO NOTHING;

-- Restore content usage recorded by the lifecycle tracker.
INSERT INTO "PostAsset" (
    "id",
    "postId",
    "assetId",
    "role",
    "sortOrder",
    "createdAt"
)
SELECT
    'pa_content_' || tracked."id",
    tracked."postId",
    tracked."id",
    'CONTENT'::"PostAssetRole",
    0,
    COALESCE(tracked."attachedAt", tracked."createdAt")
FROM "ContentImageAsset" AS tracked
WHERE tracked."postId" IS NOT NULL
ON CONFLICT DO NOTHING;

-- Restore cover and legacy content roles from PostImage.
INSERT INTO "PostAsset" (
    "id",
    "postId",
    "assetId",
    "role",
    "sortOrder",
    "createdAt"
)
SELECT
    'pa_image_' || image."id",
    image."postId",
    asset."id",
    CASE
        WHEN image."isCover" THEN 'COVER'::"PostAssetRole"
        ELSE 'CONTENT'::"PostAssetRole"
    END,
    image."sortOrder",
    image."createdAt"
FROM "PostImage" AS image
JOIN "FileAsset" AS asset ON asset."url" = image."url"
ON CONFLICT DO NOTHING;

-- Restore bulletin attachment roles.
INSERT INTO "PostAsset" (
    "id",
    "postId",
    "assetId",
    "role",
    "sortOrder",
    "createdAt"
)
SELECT
    'pa_attachment_' || attachment."id",
    attachment."postId",
    asset."id",
    'ATTACHMENT'::"PostAssetRole",
    0,
    attachment."createdAt"
FROM "Attachment" AS attachment
JOIN "FileAsset" AS asset ON asset."url" = attachment."url"
ON CONFLICT DO NOTHING;

-- CreateIndex
CREATE INDEX "FileAsset_uploadedById_createdAt_idx" ON "FileAsset"("uploadedById", "createdAt");

-- CreateIndex
CREATE INDEX "FileAsset_createdAt_idx" ON "FileAsset"("createdAt");

-- CreateIndex
CREATE INDEX "PostAsset_postId_role_sortOrder_idx" ON "PostAsset"("postId", "role", "sortOrder");

-- CreateIndex
CREATE INDEX "PostAsset_assetId_idx" ON "PostAsset"("assetId");

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostAsset" ADD CONSTRAINT "PostAsset_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostAsset" ADD CONSTRAINT "PostAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "FileAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
