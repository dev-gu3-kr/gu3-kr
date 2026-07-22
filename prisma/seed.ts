import { hashPassword } from "../src/lib/auth/password"
import { createSeedPrismaClient } from "./seed-client"

async function main() {
  const prisma = createSeedPrismaClient()
  const adminSeedPassword = process.env.ADMIN_SEED_PASSWORD

  if (!adminSeedPassword || adminSeedPassword.length < 8) {
    throw new Error("ADMIN_SEED_PASSWORD must be at least 8 characters.")
  }

  try {
    const adminPasswordHash = await hashPassword(adminSeedPassword)

    await prisma.user.upsert({
      where: { username: "master" },
      update: {
        email: "master@gu3.kr",
        username: "master",
        passwordHash: adminPasswordHash,
        displayName: "관리자",
        role: "SUPER_ADMIN",
        isActive: true,
      },
      create: {
        email: "master@gu3.kr",
        username: "master",
        passwordHash: adminPasswordHash,
        displayName: "Master Admin",
        role: "SUPER_ADMIN",
        isActive: true,
      },
    })

    console.log("Seed complete: master admin")
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
