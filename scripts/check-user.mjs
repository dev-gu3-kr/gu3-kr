import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const user = await prisma.user.findUnique({
  where: { email: "master@sample.com" },
})
console.log(user)
await prisma.$disconnect()
