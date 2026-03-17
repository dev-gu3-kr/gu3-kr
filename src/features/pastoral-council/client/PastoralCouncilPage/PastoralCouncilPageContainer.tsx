"use client"

import {
  formatPastoralCouncilDisplayName,
  getPastoralCouncilPlaceholderImageSrc,
  type PastoralCouncilListItemDto,
  pastoralCouncilDefaultPlaceholderImageType,
  pastoralCouncilDepartmentRoles,
  pastoralCouncilDistrictRoles,
  pastoralCouncilExecutiveRoleMap,
  pastoralCouncilRoleLabels,
  usePublicPastoralCouncilListQuery,
} from "@/features/pastoral-council/isomorphic"
import { PastoralCouncilPageView } from "./PastoralCouncilPageView"

type CouncilLeader = {
  readonly role: string
  readonly name: string
  readonly imageUrl?: string
  readonly fallbackImageUrl: string
}

type CouncilBranch = {
  readonly role: string
  readonly name: string
}

function createVacantItem(role: keyof typeof pastoralCouncilRoleLabels) {
  return {
    id: `vacant-${role}`,
    role,
    name: "공석",
    baptismalName: null,
    phone: null,
    imageUrl: null,
    placeholderImageType: pastoralCouncilDefaultPlaceholderImageType,
    sortOrder: 0,
    isActive: true,
    createdAt: new Date(0).toISOString(),
  } satisfies PastoralCouncilListItemDto
}

function toLeader(item: PastoralCouncilListItemDto): CouncilLeader {
  return {
    role: pastoralCouncilRoleLabels[item.role],
    name: formatPastoralCouncilDisplayName(item),
    imageUrl: item.imageUrl ?? undefined,
    fallbackImageUrl: getPastoralCouncilPlaceholderImageSrc(
      item.placeholderImageType,
    ),
  }
}

function toBranch(item: PastoralCouncilListItemDto): CouncilBranch {
  return {
    role: pastoralCouncilRoleLabels[item.role],
    name: formatPastoralCouncilDisplayName(item),
  }
}

export function PastoralCouncilPageContainer() {
  const { data, isLoading, isError } = usePublicPastoralCouncilListQuery()
  const items = data ?? []
  const itemMap = new Map(items.map((item) => [item.role, item]))

  const executiveLeaders = {
    parishPriest: toLeader(
      itemMap.get(pastoralCouncilExecutiveRoleMap.parishPriest) ??
        createVacantItem(pastoralCouncilExecutiveRoleMap.parishPriest),
    ),
    leftWing: toLeader(
      itemMap.get(pastoralCouncilExecutiveRoleMap.leftWing) ??
        createVacantItem(pastoralCouncilExecutiveRoleMap.leftWing),
    ),
    rightWing: toLeader(
      itemMap.get(pastoralCouncilExecutiveRoleMap.rightWing) ??
        createVacantItem(pastoralCouncilExecutiveRoleMap.rightWing),
    ),
    chair: toLeader(
      itemMap.get(pastoralCouncilExecutiveRoleMap.chair) ??
        createVacantItem(pastoralCouncilExecutiveRoleMap.chair),
    ),
    viceChair: toLeader(
      itemMap.get(pastoralCouncilExecutiveRoleMap.viceChair) ??
        createVacantItem(pastoralCouncilExecutiveRoleMap.viceChair),
    ),
    secretary: toLeader(
      itemMap.get(pastoralCouncilExecutiveRoleMap.secretary) ??
        createVacantItem(pastoralCouncilExecutiveRoleMap.secretary),
    ),
    districtChief: toLeader(
      itemMap.get(pastoralCouncilExecutiveRoleMap.districtChief) ??
        createVacantItem(pastoralCouncilExecutiveRoleMap.districtChief),
    ),
  }

  const departmentBranches = pastoralCouncilDepartmentRoles.map((role) =>
    toBranch(itemMap.get(role) ?? createVacantItem(role)),
  )

  const districtBranches = pastoralCouncilDistrictRoles.map((role) =>
    toBranch(itemMap.get(role) ?? createVacantItem(role)),
  )

  if (isLoading && items.length === 0) {
    return (
      <div className="mt-8 min-h-[640px] animate-pulse rounded-3xl border border-border/60 bg-card/60" />
    )
  }

  if (isError && items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        사목협의회 정보를 불러오지 못했습니다.
      </div>
    )
  }

  return (
    <PastoralCouncilPageView
      executiveLeaders={executiveLeaders}
      departmentBranches={departmentBranches}
      districtBranches={districtBranches}
    />
  )
}
