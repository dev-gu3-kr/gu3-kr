import { PastoralCouncilPageView } from "./PastoralCouncilPageView"

type CouncilLeader = {
  readonly role: string
  readonly name: string
  readonly note?: string
}

type CouncilBranch = {
  readonly role: string
  readonly name: string
}

const executiveLeaders = {
  parishPriest: {
    role: "주임신부",
    name: "백승준 시몬",
    note: "사목 전반 지도",
  },
  leftWing: {
    role: "보좌신부",
    name: "사목 보좌",
    note: "전례와 교우 돌봄",
  },
  rightWing: {
    role: "수도자",
    name: "수도회 협력",
    note: "교육과 봉사 협조",
  },
  chair: {
    role: "총 회장",
    name: "최석준 마르코",
    note: "평신도 사목협의회 총괄",
  },
  viceChair: {
    role: "남성 부회장",
    name: "이운영 요한",
    note: "남성 구역 협의",
  },
  secretary: {
    role: "총무",
    name: "최용조 보나벤뚜라",
    note: "실무와 운영 관리",
  },
  districtChief: {
    role: "남성 총구역장",
    name: "최승일 다니엘",
    note: "구역 운영 및 전달 체계 총괄",
  },
} satisfies Record<string, CouncilLeader>

const departmentBranches = [
  { role: "전례 분과", name: "최경희 안젤라" },
  { role: "교육/청년 분과", name: "최용조 보나벤뚜라" },
  { role: "사회사목 분과", name: "황원선 호주아네스" },
  { role: "재정 분과", name: "권태희 안나" },
  { role: "선교 분과", name: "이화봉 안토니오" },
  { role: "시설관리 분과", name: "박홍식 모이세" },
  { role: "노인 분과", name: "이현지 카타리나" },
  { role: "가정/생명/환경 분과", name: "백희자 스텔라" },
  { role: "중고등 분과", name: "이상종 안드레아" },
  { role: "유초등/홍보 분과", name: "정상범 야고보" },
] satisfies readonly CouncilBranch[]

const districtBranches = [
  { role: "남성 1지역장", name: "김영균 안셀모" },
  { role: "여성 1지역장", name: "공석" },
  { role: "남성 2지역장", name: "공석" },
  { role: "여성 2지역장", name: "이영민 수산나" },
  { role: "남성 3지역장", name: "임종윤 마르티노" },
  { role: "여성 3지역장", name: "김미향 다니엘라" },
  { role: "남성 4지역장", name: "김진수 벤자민" },
  { role: "여성 4지역장", name: "정연희 로사" },
  { role: "남성 5지역장", name: "김용진 시몬" },
  { role: "여성 5지역장", name: "최순란 데레사" },
] satisfies readonly CouncilBranch[]

export function PastoralCouncilPageContainer() {
  return (
    <PastoralCouncilPageView
      executiveLeaders={executiveLeaders}
      departmentBranches={departmentBranches}
      districtBranches={districtBranches}
    />
  )
}
