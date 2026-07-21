BEGIN;

SET LOCAL lock_timeout = '5s';

LOCK TABLE "Attachment", "ContentImageAsset", "PostImage"
IN ACCESS EXCLUSIVE MODE;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "Attachment" AS attachment
        LEFT JOIN "FileAsset" AS asset ON asset."url" = attachment."url"
        LEFT JOIN "PostAsset" AS usage
            ON usage."assetId" = asset."id"
            AND usage."postId" = attachment."postId"
            AND usage."role" = 'ATTACHMENT'::"PostAssetRole"
        WHERE usage."id" IS NULL
    ) THEN
        RAISE EXCEPTION 'Attachment rows are not fully represented in PostAsset';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM "PostImage" AS image
        LEFT JOIN "FileAsset" AS asset ON asset."url" = image."url"
        LEFT JOIN "PostAsset" AS usage
            ON usage."assetId" = asset."id"
            AND usage."postId" = image."postId"
            AND usage."role" = CASE
                WHEN image."isCover" THEN 'COVER'::"PostAssetRole"
                ELSE 'CONTENT'::"PostAssetRole"
            END
        WHERE usage."id" IS NULL
    ) THEN
        RAISE EXCEPTION 'PostImage rows are not fully represented in PostAsset';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM "ContentImageAsset" AS tracked
        JOIN "Post" AS post ON post."id" = tracked."postId"
        LEFT JOIN "FileAsset" AS asset ON asset."url" = tracked."url"
        LEFT JOIN "PostAsset" AS usage
            ON usage."assetId" = asset."id"
            AND usage."postId" = tracked."postId"
            AND usage."role" = 'CONTENT'::"PostAssetRole"
        WHERE post."content" LIKE '%' || tracked."url" || '%'
            AND (asset."id" IS NULL OR usage."id" IS NULL)
    ) THEN
        RAISE EXCEPTION 'Referenced ContentImageAsset rows are not fully represented in the normalized tables';
    END IF;
END $$;

DROP TABLE "Attachment";
DROP TABLE "ContentImageAsset";
DROP TABLE "PostImage";
DROP TYPE "ContentImageStatus";

COMMIT;
