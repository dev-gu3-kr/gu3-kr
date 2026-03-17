import { createHash } from "node:crypto"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

function hashPassword(plainPassword: string) {
  return createHash("sha256").update(plainPassword).digest("hex")
}

function createPrismaClient() {
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

type PastoralCouncilRoleSeed =
  | "PARISH_PRIEST"
  | "ASSISTANT_PRIEST"
  | "RELIGIOUS"
  | "CHAIRPERSON"
  | "VICE_CHAIRMAN_MALE"
  | "SECRETARY"
  | "DISTRICT_CHIEF_MALE"
  | "LITURGY_DEPARTMENT"
  | "EDUCATION_YOUTH_DEPARTMENT"
  | "SOCIAL_PASTORAL_DEPARTMENT"
  | "FINANCE_DEPARTMENT"
  | "MISSION_DEPARTMENT"
  | "FACILITY_MANAGEMENT_DEPARTMENT"
  | "SENIOR_DEPARTMENT"
  | "FAMILY_LIFE_ENVIRONMENT_DEPARTMENT"
  | "MIDDLE_HIGH_DEPARTMENT"
  | "ELEMENTARY_PR_DEPARTMENT"
  | "MALE_DISTRICT_1"
  | "FEMALE_DISTRICT_1"
  | "MALE_DISTRICT_2"
  | "FEMALE_DISTRICT_2"
  | "MALE_DISTRICT_3"
  | "FEMALE_DISTRICT_3"
  | "MALE_DISTRICT_4"
  | "FEMALE_DISTRICT_4"
  | "MALE_DISTRICT_5"
  | "FEMALE_DISTRICT_5"

const pastoralCouncilRoleSortOrder: Record<PastoralCouncilRoleSeed, number> = {
  PARISH_PRIEST: 10,
  ASSISTANT_PRIEST: 20,
  RELIGIOUS: 30,
  CHAIRPERSON: 40,
  VICE_CHAIRMAN_MALE: 50,
  SECRETARY: 60,
  LITURGY_DEPARTMENT: 100,
  EDUCATION_YOUTH_DEPARTMENT: 110,
  SOCIAL_PASTORAL_DEPARTMENT: 120,
  FINANCE_DEPARTMENT: 130,
  MISSION_DEPARTMENT: 140,
  FACILITY_MANAGEMENT_DEPARTMENT: 150,
  SENIOR_DEPARTMENT: 160,
  FAMILY_LIFE_ENVIRONMENT_DEPARTMENT: 170,
  MIDDLE_HIGH_DEPARTMENT: 180,
  ELEMENTARY_PR_DEPARTMENT: 190,
  DISTRICT_CHIEF_MALE: 200,
  MALE_DISTRICT_1: 210,
  FEMALE_DISTRICT_1: 220,
  MALE_DISTRICT_2: 230,
  FEMALE_DISTRICT_2: 240,
  MALE_DISTRICT_3: 250,
  FEMALE_DISTRICT_3: 260,
  MALE_DISTRICT_4: 270,
  FEMALE_DISTRICT_4: 280,
  MALE_DISTRICT_5: 290,
  FEMALE_DISTRICT_5: 300,
}

const pastoralCouncilSeed: Array<{
  role: PastoralCouncilRoleSeed
  name: string
  baptismalName?: string
}> = [
  { role: "PARISH_PRIEST", name: "백승준", baptismalName: "시몬" },
  { role: "ASSISTANT_PRIEST", name: "사목 보좌" },
  { role: "RELIGIOUS", name: "수도회 협력" },
  { role: "CHAIRPERSON", name: "최석준", baptismalName: "마르코" },
  { role: "VICE_CHAIRMAN_MALE", name: "이운영", baptismalName: "요한" },
  { role: "SECRETARY", name: "최용조", baptismalName: "보나벤뚜라" },
  { role: "DISTRICT_CHIEF_MALE", name: "최승일", baptismalName: "다니엘" },
  { role: "LITURGY_DEPARTMENT", name: "최경희", baptismalName: "안젤라" },
  {
    role: "EDUCATION_YOUTH_DEPARTMENT",
    name: "최용조",
    baptismalName: "보나벤뚜라",
  },
  {
    role: "SOCIAL_PASTORAL_DEPARTMENT",
    name: "황원선",
    baptismalName: "호주아네스",
  },
  { role: "FINANCE_DEPARTMENT", name: "권태희", baptismalName: "안나" },
  { role: "MISSION_DEPARTMENT", name: "이화봉", baptismalName: "안토니오" },
  {
    role: "FACILITY_MANAGEMENT_DEPARTMENT",
    name: "박홍식",
    baptismalName: "모이세",
  },
  { role: "SENIOR_DEPARTMENT", name: "이현지", baptismalName: "카타리나" },
  {
    role: "FAMILY_LIFE_ENVIRONMENT_DEPARTMENT",
    name: "백희자",
    baptismalName: "스텔라",
  },
  { role: "MIDDLE_HIGH_DEPARTMENT", name: "이상종", baptismalName: "안드레아" },
  {
    role: "ELEMENTARY_PR_DEPARTMENT",
    name: "정상범",
    baptismalName: "야고보",
  },
  { role: "MALE_DISTRICT_1", name: "김영균", baptismalName: "안셀모" },
  { role: "FEMALE_DISTRICT_1", name: "공석" },
  { role: "MALE_DISTRICT_2", name: "공석" },
  { role: "FEMALE_DISTRICT_2", name: "이영민", baptismalName: "수산나" },
  { role: "MALE_DISTRICT_3", name: "임종윤", baptismalName: "마르티노" },
  { role: "FEMALE_DISTRICT_3", name: "김미향", baptismalName: "다니엘라" },
  { role: "MALE_DISTRICT_4", name: "김진수", baptismalName: "벤자민" },
  { role: "FEMALE_DISTRICT_4", name: "정연희", baptismalName: "로사" },
  { role: "MALE_DISTRICT_5", name: "김용진", baptismalName: "시몬" },
  { role: "FEMALE_DISTRICT_5", name: "최순란", baptismalName: "데레사" },
]

async function main() {
  const prisma = createPrismaClient()

  try {
    await prisma.user.upsert({
      where: { email: "master@sample.com" },
      update: {
        username: "master",
        passwordHash: hashPassword("cathedral12312!"),
        displayName: "Master Admin",
        role: "SUPER_ADMIN",
        isActive: true,
      },
      create: {
        email: "master@sample.com",
        username: "master",
        passwordHash: hashPassword("cathedral12312!"),
        displayName: "Master Admin",
        role: "SUPER_ADMIN",
        isActive: true,
      },
    })

    for (const item of pastoralCouncilSeed) {
      await prisma.pastoralCouncilMember.upsert({
        where: { role: item.role },
        update: {
          name: item.name,
          baptismalName: item.baptismalName ?? null,
          phone: null,
          imageUrl: null,
          placeholderImageType: "PRIEST",
          sortOrder: pastoralCouncilRoleSortOrder[item.role],
          isActive: true,
        },
        create: {
          role: item.role,
          name: item.name,
          baptismalName: item.baptismalName ?? null,
          phone: null,
          imageUrl: null,
          placeholderImageType: "PRIEST",
          sortOrder: pastoralCouncilRoleSortOrder[item.role],
          isActive: true,
        },
      })
    }

    console.log("Seed complete: master admin and pastoral council members")
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
