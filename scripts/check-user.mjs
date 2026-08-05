import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const user = await prisma.user.findUnique({
  where: { username: "master" },
})
console.log(user)
await prisma.$disconnect()
