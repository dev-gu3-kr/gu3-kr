ALTER TABLE "Post"
DROP COLUMN IF EXISTS "thumbnailUrl";

ALTER TABLE "GalleryImage" RENAME TO "PostImage";

ALTER TABLE "PostImage"
RENAME CONSTRAINT "GalleryImage_pkey" TO "PostImage_pkey";

ALTER TABLE "PostImage"
RENAME CONSTRAINT "GalleryImage_postId_fkey" TO "PostImage_postId_fkey";

ALTER INDEX "GalleryImage_postId_sortOrder_idx"
RENAME TO "PostImage_postId_sortOrder_idx";
