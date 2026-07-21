import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const user = await prisma.user.findUnique({
  where: { email: "master@gu3.kr" },
})
console.log(user)
await prisma.$disconnect()
