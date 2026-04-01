ALTER TABLE "Post"
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "Post_category_isPublished_sortOrder_createdAt_idx"
ON "Post"("category", "isPublished", "sortOrder", "createdAt");
