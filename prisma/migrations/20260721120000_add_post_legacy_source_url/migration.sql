-- 이전 사이트 이관 글을 원본 상세 페이지까지 추적할 수 있게 한다.
ALTER TABLE "Post" ADD COLUMN "legacySourceUrl" TEXT;

-- 기존 자료실 이관 글은 slug에 보존된 wr_id로 원본 URL을 복원한다.
UPDATE "Post"
SET "legacySourceUrl" = 'https://guro3cc.com/bbs/board.php?bo_table=pds&wr_id=' ||
  SUBSTRING("slug" FROM LENGTH('legacy-pds-') + 1)
WHERE "slug" LIKE 'legacy-pds-%';

-- 기존 공지사항 이관 글도 같은 규칙으로 원본 URL을 복원한다.
UPDATE "Post"
SET "legacySourceUrl" = 'https://guro3cc.com/bbs/board.php?bo_table=notice&wr_id=' ||
  SUBSTRING("slug" FROM LENGTH('legacy-notice-') + 1)
WHERE "slug" LIKE 'legacy-notice-%';

CREATE INDEX "Post_legacySourceUrl_idx" ON "Post"("legacySourceUrl");
