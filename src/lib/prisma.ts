import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Prisma 7에서는 데이터소스 URL을 adapter로 주입한다.
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL is required for Prisma initialization.")
  }

  // ENV의 DATABASE_SCHEMA를 우선 사용하고, 없으면 기본값 cathedral을 사용한다.
  const databaseSchema = process.env.DATABASE_SCHEMA || "cathedral"

  // PostgreSQL adapter에 schema(search_path) 설정을 주입한다.
  const adapter = new PrismaPg(
    { connectionString },
    {
      schema: databaseSchema,
    },
  )

  // 공통 Prisma Client 인스턴스를 생성한다.
  return new PrismaClient({
    adapter,
    log: ["error", "warn"],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
