-- 기존 로그인 이메일의 로컬 파트를 관리자 아이디로 보존한다.
UPDATE "User"
SET "username" = lower(split_part("email", '@', 1))
WHERE "email" IS NOT NULL
  AND position('@' in "email") > 1;

-- 로그인 계약에서 이메일을 제거했으므로 사용하지 않는 관리자 이메일도 삭제한다.
ALTER TABLE "User" DROP COLUMN "email";
