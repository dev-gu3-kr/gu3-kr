import { execSync } from "node:child_process"
import { createHash } from "node:crypto"

function hashPassword(plainPassword: string) {
  // 로그인 검증 로직과 동일한 SHA-256 해시를 생성한다.
  return createHash("sha256").update(plainPassword).digest("hex")
}

const hash = hashPassword("cathedral12312!")

const sql = `
INSERT INTO "User" ("id","email","username","passwordHash","displayName","role","isActive","createdAt","updatedAt")
VALUES (gen_random_uuid()::text, 'master@sample.com', 'master', '${hash}', 'Master Admin', 'SUPER_ADMIN', true, NOW(), NOW())
ON CONFLICT ("email")
DO UPDATE SET
  "username" = EXCLUDED."username",
  "passwordHash" = EXCLUDED."passwordHash",
  "displayName" = EXCLUDED."displayName",
  "role" = EXCLUDED."role",
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();
`

// Prisma 7 환경에서 seed는 CLI execute를 통해 안전하게 수행한다.
execSync("npx prisma db execute --stdin", {
  input: sql,
  stdio: ["pipe", "inherit", "inherit"],
})

console.log("Seed complete: master@sample.com")
