-- Simplify inquiry processing notes into 1:1 memo fields on Inquiry
-- Pre-launch schema cleanup: drops InquiryNote and moves to single processing memo semantics

ALTER TABLE "Inquiry"
  ADD COLUMN "processingMemo" TEXT,
  ADD COLUMN "processedAt" TIMESTAMP(3),
  ADD COLUMN "processedById" TEXT;

-- Migrate representative existing data from latest note (if any) into 1:1 fields
WITH latest_note AS (
  SELECT DISTINCT ON ("inquiryId")
    "inquiryId",
    note,
    "authorId",
    "createdAt"
  FROM "InquiryNote"
  ORDER BY "inquiryId", "createdAt" DESC
)
UPDATE "Inquiry" i
SET
  "processingMemo" = ln.note,
  "processedAt" = COALESCE(i."handledAt", ln."createdAt"),
  "processedById" = ln."authorId"
FROM latest_note ln
WHERE i.id = ln."inquiryId";

-- Preserve handledAt intent as processedAt when memo not present
UPDATE "Inquiry"
SET "processedAt" = "handledAt"
WHERE "processedAt" IS NULL
  AND "handledAt" IS NOT NULL;

ALTER TABLE "Inquiry"
  DROP COLUMN "handledAt";

DROP TABLE "InquiryNote";

ALTER TABLE "Inquiry"
  ADD CONSTRAINT "Inquiry_processedById_fkey"
  FOREIGN KEY ("processedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Inquiry_processedById_idx" ON "Inquiry"("processedById");
