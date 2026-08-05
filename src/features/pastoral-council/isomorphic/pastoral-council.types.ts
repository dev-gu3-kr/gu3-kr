export const pastoralCouncilPlaceholderImageTypeValues = [
  "WOMAN",
  "MAN",
  "NUN",
  "PRIEST",
] as const

export type PastoralCouncilPlaceholderImageTypeDto =
  (typeof pastoralCouncilPlaceholderImageTypeValues)[number]

export const pastoralCouncilDefaultPlaceholderImageType =
  "MAN" as const satisfies PastoralCouncilPlaceholderImageTypeDto

export const pastoralCouncilPlaceholderImageTypeLabels: Record<
  PastoralCouncilPlaceholderImageTypeDto,
  string
> = {
  WOMAN: "여자 이미지",
  MAN: "남자 이미지",
  NUN: "수녀 이미지",
  PRIEST: "신부 이미지",
}

export const pastoralCouncilPlaceholderImageSrcByType: Record<
  PastoralCouncilPlaceholderImageTypeDto,
  string
> = {
  WOMAN: "/images/placeholders/profile-placeholder-woman.webp",
  MAN: "/images/placeholders/profile-placeholder-man.webp",
  NUN: "/images/placeholders/nun-profile-placeholder.webp",
  PRIEST: "/images/placeholders/priest-profile-placeholder.webp",
}

// 관리자가 편집하고 공개 조직도가 공통으로 사용하는 직책 노드이다.
export type PastoralCouncilPositionDto = {
  id: string // 직책 식별자
  title: string // 화면에 표시할 직책명
  parentId: string | null // 최상위 직책이면 null
  sortOrder: number // 같은 상위 직책 아래의 노출 순서
  isActive: boolean // 공개 조직도 노출 여부
  defaultPlaceholderImageType: PastoralCouncilPlaceholderImageTypeDto // 공석 카드 이미지 유형
  memberCount: number // 현재 배정된 활성 구성원 수
  createdAt: string // 생성 시각(ISO datetime)
}

// 직책 생성·수정 요청 계약이다.
export type UpsertPastoralCouncilPositionInputDto = {
  title: string // 직책명
  parentId?: string | null // 상위 직책, 최상위이면 null
  sortOrder?: number // 같은 상위 직책 아래의 노출 순서
  isActive?: boolean // 공개 조직도 노출 여부
  defaultPlaceholderImageType?: PastoralCouncilPlaceholderImageTypeDto // 공석 카드 이미지 유형
}

// 구성원 생성·수정 요청 계약이다.
export type UpsertPastoralCouncilInputDto = {
  positionId: string // 배정할 직책 식별자
  name: string // 이름
  baptismalName?: string // 세례명(미입력 가능)
  phone?: string // 연락처(미입력 가능)
  imageUrl?: string // 프로필 이미지 URL(미입력 가능)
  placeholderImageType?: PastoralCouncilPlaceholderImageTypeDto // 이미지 없을 때 쓸 대체 이미지 유형
  sortOrder?: number // 동일 직책 내 노출 순서
  isActive?: boolean // 공개 활성 상태
}

// 관리자 목록과 공개 조직도가 공통으로 사용하는 구성원 정보이다.
export type PastoralCouncilListItemDto = {
  id: string // 구성원 식별자
  positionId: string // 배정된 직책 식별자
  positionTitle: string // 직책명
  name: string // 이름
  baptismalName: string | null // 세례명(없으면 null)
  phone: string | null // 연락처(없으면 null)
  imageUrl: string | null // 이미지 URL(없으면 null)
  placeholderImageType: PastoralCouncilPlaceholderImageTypeDto // 이미지 없을 때 쓸 대체 이미지 유형
  sortOrder: number // 동일 직책 내 노출 순서
  isActive: boolean // 공개 활성 상태
  createdAt: string // 생성 시각(ISO datetime)
}

export type PastoralCouncilDetailDto = PastoralCouncilListItemDto

export type PastoralCouncilPageDto = {
  items: PastoralCouncilListItemDto[] // 관리자 구성원 목록
  nextCursor: string | null // 다음 페이지 커서
}

export type PastoralCouncilPublicPageDto = {
  positions: PastoralCouncilPositionDto[] // 공개 직책 노드 목록
  members: PastoralCouncilListItemDto[] // 공개 구성원 목록
}

export type PastoralCouncilPositionTreeNodeDto = PastoralCouncilPositionDto & {
  members: PastoralCouncilListItemDto[] // 이 직책에 배정된 구성원
  children: PastoralCouncilPositionTreeNodeDto[] // 하위 직책
}

export function formatPastoralCouncilDisplayName(params: {
  name: string
  baptismalName?: string | null
}) {
  return params.baptismalName
    ? `${params.name} ${params.baptismalName}`
    : params.name
}

export function getPastoralCouncilPlaceholderImageSrc(
  type?: PastoralCouncilPlaceholderImageTypeDto,
) {
  return pastoralCouncilPlaceholderImageSrcByType[
    type ?? pastoralCouncilDefaultPlaceholderImageType
  ]
}

// API의 평면 목록을 반응형 UI가 재귀 렌더링할 수 있는 트리로 변환한다.
export function buildPastoralCouncilPositionTree(params: {
  positions: readonly PastoralCouncilPositionDto[]
  members: readonly PastoralCouncilListItemDto[]
}) {
  const membersByPosition = new Map<string, PastoralCouncilListItemDto[]>()

  for (const member of params.members) {
    const members = membersByPosition.get(member.positionId) ?? []
    members.push(member)
    membersByPosition.set(member.positionId, members)
  }

  const nodeById = new Map<string, PastoralCouncilPositionTreeNodeDto>()
  const sortedPositions = [...params.positions].sort(
    (left, right) =>
      left.sortOrder - right.sortOrder || left.title.localeCompare(right.title),
  )

  for (const position of sortedPositions) {
    nodeById.set(position.id, {
      ...position,
      members: (membersByPosition.get(position.id) ?? []).sort(
        (left, right) => left.sortOrder - right.sortOrder,
      ),
      children: [],
    })
  }

  const roots: PastoralCouncilPositionTreeNodeDto[] = []

  for (const position of sortedPositions) {
    const node = nodeById.get(position.id)
    if (!node) continue

    const parent = position.parentId
      ? nodeById.get(position.parentId)
      : undefined

    if (parent) parent.children.push(node)
    else roots.push(node)
  }

  return roots
}

// 직책 이동 요청이 자기 자신을 조상으로 만드는지 판별한다.
export function createsPastoralCouncilPositionCycle(params: {
  positionId: string
  parentId: string | null
  positions: readonly { id: string; parentId: string | null }[]
}) {
  if (!params.parentId) return false
  if (params.parentId === params.positionId) return true

  const parentById = new Map(
    params.positions.map((position) => [position.id, position.parentId]),
  )
  let cursor: string | null = params.parentId
  const visited = new Set<string>()

  while (cursor) {
    if (cursor === params.positionId) return true
    if (visited.has(cursor)) return true
    visited.add(cursor)
    cursor = parentById.get(cursor) ?? null
  }

  return false
}
