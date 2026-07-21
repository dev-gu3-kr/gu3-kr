-- The legacy application can keep writing old tables between the additive
-- normalization migration and the new application deployment. Rebuild only
-- usage rows immediately before cutover, then leave stale unused FileAsset
-- rows to the protected cleanup job.
DELETE FROM "PostAsset";

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
FROM "ContentImageAsset"
ON CONFLICT DO NOTHING;

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
    asset."id",
    'CONTENT'::"PostAssetRole",
    0,
    COALESCE(tracked."attachedAt", tracked."createdAt")
FROM "ContentImageAsset" AS tracked
JOIN "FileAsset" AS asset ON asset."url" = tracked."url"
WHERE tracked."postId" IS NOT NULL
ON CONFLICT DO NOTHING;

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
