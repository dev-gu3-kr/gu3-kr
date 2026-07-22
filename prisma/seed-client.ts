import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

// 모든 seed가 같은 DB 스키마 선택 규칙을 사용하도록 연결 생성을 한곳에서 관리한다.
export function createSeedPrismaClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL is required for Prisma seed.")
  }

  const adapter = new PrismaPg(
    { connectionString },
    {
      schema: process.env.DATABASE_SCHEMA || "cathedral",
    },
  )

  return new PrismaClient({ adapter })
}
