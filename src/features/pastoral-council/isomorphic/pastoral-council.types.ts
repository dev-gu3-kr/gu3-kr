export const pastoralCouncilRoleValues = [
  "PARISH_PRIEST",
  "ASSISTANT_PRIEST",
  "RELIGIOUS",
  "CHAIRPERSON",
  "VICE_CHAIRMAN_MALE",
  "SECRETARY",
  "DISTRICT_CHIEF_MALE",
  "LITURGY_DEPARTMENT",
  "EDUCATION_YOUTH_DEPARTMENT",
  "SOCIAL_PASTORAL_DEPARTMENT",
  "FINANCE_DEPARTMENT",
  "MISSION_DEPARTMENT",
  "FACILITY_MANAGEMENT_DEPARTMENT",
  "SENIOR_DEPARTMENT",
  "FAMILY_LIFE_ENVIRONMENT_DEPARTMENT",
  "MIDDLE_HIGH_DEPARTMENT",
  "ELEMENTARY_PR_DEPARTMENT",
  "MALE_DISTRICT_1",
  "FEMALE_DISTRICT_1",
  "MALE_DISTRICT_2",
  "FEMALE_DISTRICT_2",
  "MALE_DISTRICT_3",
  "FEMALE_DISTRICT_3",
  "MALE_DISTRICT_4",
  "FEMALE_DISTRICT_4",
  "MALE_DISTRICT_5",
  "FEMALE_DISTRICT_5",
] as const

export type PastoralCouncilRoleDto = (typeof pastoralCouncilRoleValues)[number]

export const pastoralCouncilRoleLabels: Record<PastoralCouncilRoleDto, string> =
  {
    PARISH_PRIEST: "주임신부",
    ASSISTANT_PRIEST: "보좌신부",
    RELIGIOUS: "수도자",
    CHAIRPERSON: "총 회장",
    VICE_CHAIRMAN_MALE: "남성 부회장",
    SECRETARY: "총무",
    DISTRICT_CHIEF_MALE: "남성 총구역장",
    LITURGY_DEPARTMENT: "전례 분과",
    EDUCATION_YOUTH_DEPARTMENT: "교육/청년 분과",
    SOCIAL_PASTORAL_DEPARTMENT: "사회사목 분과",
    FINANCE_DEPARTMENT: "재정 분과",
    MISSION_DEPARTMENT: "선교 분과",
    FACILITY_MANAGEMENT_DEPARTMENT: "시설관리 분과",
    SENIOR_DEPARTMENT: "노인 분과",
    FAMILY_LIFE_ENVIRONMENT_DEPARTMENT: "가정/생명/환경 분과",
    MIDDLE_HIGH_DEPARTMENT: "중고등 분과",
    ELEMENTARY_PR_DEPARTMENT: "유초등/홍보 분과",
    MALE_DISTRICT_1: "남성 1지역장",
    FEMALE_DISTRICT_1: "여성 1지역장",
    MALE_DISTRICT_2: "남성 2지역장",
    FEMALE_DISTRICT_2: "여성 2지역장",
    MALE_DISTRICT_3: "남성 3지역장",
    FEMALE_DISTRICT_3: "여성 3지역장",
    MALE_DISTRICT_4: "남성 4지역장",
    FEMALE_DISTRICT_4: "여성 4지역장",
    MALE_DISTRICT_5: "남성 5지역장",
    FEMALE_DISTRICT_5: "여성 5지역장",
  }

export const pastoralCouncilRoleSortOrder: Record<
  PastoralCouncilRoleDto,
  number
> = {
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

export const pastoralCouncilExecutiveRoleMap = {
  parishPriest: "PARISH_PRIEST",
  leftWing: "ASSISTANT_PRIEST",
  rightWing: "RELIGIOUS",
  chair: "CHAIRPERSON",
  viceChair: "VICE_CHAIRMAN_MALE",
  secretary: "SECRETARY",
  districtChief: "DISTRICT_CHIEF_MALE",
} as const satisfies Record<string, PastoralCouncilRoleDto>

export const pastoralCouncilDepartmentRoles = [
  "LITURGY_DEPARTMENT",
  "EDUCATION_YOUTH_DEPARTMENT",
  "SOCIAL_PASTORAL_DEPARTMENT",
  "FINANCE_DEPARTMENT",
  "MISSION_DEPARTMENT",
  "FACILITY_MANAGEMENT_DEPARTMENT",
  "SENIOR_DEPARTMENT",
  "FAMILY_LIFE_ENVIRONMENT_DEPARTMENT",
  "MIDDLE_HIGH_DEPARTMENT",
  "ELEMENTARY_PR_DEPARTMENT",
] as const satisfies readonly PastoralCouncilRoleDto[]

export const pastoralCouncilDistrictRoles = [
  "MALE_DISTRICT_1",
  "FEMALE_DISTRICT_1",
  "MALE_DISTRICT_2",
  "FEMALE_DISTRICT_2",
  "MALE_DISTRICT_3",
  "FEMALE_DISTRICT_3",
  "MALE_DISTRICT_4",
  "FEMALE_DISTRICT_4",
  "MALE_DISTRICT_5",
  "FEMALE_DISTRICT_5",
] as const satisfies readonly PastoralCouncilRoleDto[]

export function formatPastoralCouncilDisplayName(params: {
  name: string
  baptismalName?: string | null
}) {
  return params.baptismalName
    ? `${params.name} ${params.baptismalName}`
    : params.name
}

export type UpsertPastoralCouncilInputDto = {
  role: PastoralCouncilRoleDto // 직책 enum(필수, 중복 불가)
  name: string // 이름 또는 공석 표시명
  baptismalName?: string // 세례명(미입력 가능)
  phone?: string // 연락처(미입력 가능)
  imageUrl?: string // 프로필 이미지 URL(미입력 가능)
  sortOrder?: number // 노출 정렬 순서(미입력 시 역할 기본값 사용)
  isActive?: boolean // 공개 활성 상태(미입력 시 true)
}

export type PastoralCouncilListItemDto = {
  id: string // 식별자
  role: PastoralCouncilRoleDto // 직책 enum
  name: string // 이름 또는 공석 표시명
  baptismalName: string | null // 세례명(없으면 null)
  phone: string | null // 연락처(없으면 null)
  imageUrl: string | null // 이미지 URL(없으면 null)
  sortOrder: number // 노출 정렬 순서
  isActive: boolean // 공개 활성 상태
  createdAt: string // 생성 시각(ISO datetime)
}

export type PastoralCouncilDetailDto = PastoralCouncilListItemDto

export type PastoralCouncilPageDto = {
  items: PastoralCouncilListItemDto[] // 관리자 목록 아이템
  nextCursor: string | null // 다음 페이지 커서
}

export type PastoralCouncilPublicPageDto = {
  items: PastoralCouncilListItemDto[] // 공개 조직도 렌더링용 전체 아이템
}
