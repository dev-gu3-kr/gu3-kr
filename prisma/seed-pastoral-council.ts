import { createSeedPrismaClient } from "./seed-client"

type PastoralCouncilSeedItem = {
  positionId: string
  name: string
  baptismalName?: string
  sortOrder: number
}

const pastoralCouncilSeed: PastoralCouncilSeedItem[] = [
  {
    positionId: "pc-pos-parish-priest",
    name: "백승준",
    baptismalName: "시몬",
    sortOrder: 10,
  },
  { positionId: "pc-pos-assistant-priest", name: "사목 보좌", sortOrder: 20 },
  { positionId: "pc-pos-religious", name: "수도회 협력", sortOrder: 30 },
  {
    positionId: "pc-pos-chairperson",
    name: "최석준",
    baptismalName: "마르코",
    sortOrder: 40,
  },
  {
    positionId: "pc-pos-vice-chairman-male",
    name: "이운영",
    baptismalName: "요한",
    sortOrder: 50,
  },
  {
    positionId: "pc-pos-secretary",
    name: "최용조",
    baptismalName: "보나벤뚜라",
    sortOrder: 60,
  },
  {
    positionId: "pc-pos-district-chief-male",
    name: "최승일",
    baptismalName: "다니엘",
    sortOrder: 200,
  },
  {
    positionId: "pc-pos-liturgy-department",
    name: "최경희",
    baptismalName: "안젤라",
    sortOrder: 100,
  },
  {
    positionId: "pc-pos-education-youth-department",
    name: "최용조",
    baptismalName: "보나벤뚜라",
    sortOrder: 110,
  },
  {
    positionId: "pc-pos-social-pastoral-department",
    name: "황원선",
    baptismalName: "호주아네스",
    sortOrder: 120,
  },
  {
    positionId: "pc-pos-finance-department",
    name: "권태희",
    baptismalName: "안나",
    sortOrder: 130,
  },
  {
    positionId: "pc-pos-mission-department",
    name: "이화봉",
    baptismalName: "안토니오",
    sortOrder: 140,
  },
  {
    positionId: "pc-pos-facility-management-department",
    name: "박홍식",
    baptismalName: "모이세",
    sortOrder: 150,
  },
  {
    positionId: "pc-pos-senior-department",
    name: "이현지",
    baptismalName: "카타리나",
    sortOrder: 160,
  },
  {
    positionId: "pc-pos-family-life-environment-department",
    name: "백희자",
    baptismalName: "스텔라",
    sortOrder: 170,
  },
  {
    positionId: "pc-pos-middle-high-department",
    name: "이상종",
    baptismalName: "안드레아",
    sortOrder: 180,
  },
  {
    positionId: "pc-pos-elementary-pr-department",
    name: "정상범",
    baptismalName: "야고보",
    sortOrder: 190,
  },
  {
    positionId: "pc-pos-male-district-1",
    name: "김영균",
    baptismalName: "안셀모",
    sortOrder: 210,
  },
  {
    positionId: "pc-pos-female-district-2",
    name: "이영민",
    baptismalName: "수산나",
    sortOrder: 240,
  },
  {
    positionId: "pc-pos-male-district-3",
    name: "임종윤",
    baptismalName: "마르티노",
    sortOrder: 250,
  },
  {
    positionId: "pc-pos-female-district-3",
    name: "김미향",
    baptismalName: "다니엘라",
    sortOrder: 260,
  },
  {
    positionId: "pc-pos-male-district-4",
    name: "김진수",
    baptismalName: "벤자민",
    sortOrder: 270,
  },
  {
    positionId: "pc-pos-female-district-4",
    name: "정연희",
    baptismalName: "로사",
    sortOrder: 280,
  },
  {
    positionId: "pc-pos-male-district-5",
    name: "김용진",
    baptismalName: "시몬",
    sortOrder: 290,
  },
  {
    positionId: "pc-pos-female-district-5",
    name: "최순란",
    baptismalName: "데레사",
    sortOrder: 300,
  },
]

async function main() {
  if (process.env.PASTORAL_COUNCIL_SEED_CONFIRM !== "INSERT_ONLY") {
    throw new Error(
      "PASTORAL_COUNCIL_SEED_CONFIRM=INSERT_ONLY is required for the pastoral council seed.",
    )
  }

  const prisma = createSeedPrismaClient()

  try {
    const existingMembers = await prisma.pastoralCouncilMember.findMany({
      select: { positionId: true },
    })
    const assignedPositionIds = new Set(
      existingMembers.map((member) => member.positionId),
    )
    const missingMembers = pastoralCouncilSeed.filter(
      (item) => !assignedPositionIds.has(item.positionId),
    )

    const result = await prisma.pastoralCouncilMember.createMany({
      data: missingMembers.map((item) => ({
        positionId: item.positionId,
        name: item.name,
        baptismalName: item.baptismalName ?? null,
        phone: null,
        imageUrl: null,
        placeholderImageType: "PRIEST" as const,
        sortOrder: item.sortOrder,
        isActive: true,
      })),
    })

    console.log(
      `Pastoral council seed complete: ${result.count} created; assigned positions unchanged`,
    )
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
