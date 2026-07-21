-- Access JWT를 갱신할 때 원문 토큰을 저장하지 않고 회전·폐기 이력을 검증한다.
CREATE TABLE "AdminRefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "rotatedToHash" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminRefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminRefreshToken_tokenHash_key" ON "AdminRefreshToken"("tokenHash");
CREATE INDEX "AdminRefreshToken_familyId_idx" ON "AdminRefreshToken"("familyId");
CREATE INDEX "AdminRefreshToken_userId_idx" ON "AdminRefreshToken"("userId");
CREATE INDEX "AdminRefreshToken_expiresAt_idx" ON "AdminRefreshToken"("expiresAt");
CREATE INDEX "AdminRefreshToken_revokedAt_idx" ON "AdminRefreshToken"("revokedAt");

ALTER TABLE "AdminRefreshToken"
ADD CONSTRAINT "AdminRefreshToken_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
