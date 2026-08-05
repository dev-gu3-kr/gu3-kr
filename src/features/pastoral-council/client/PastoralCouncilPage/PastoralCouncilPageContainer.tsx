"use client"

import {
  buildPastoralCouncilPositionTree,
  usePublicPastoralCouncilQuery,
} from "@/features/pastoral-council/isomorphic"
import { PastoralCouncilPageView } from "./PastoralCouncilPageView"

export function PastoralCouncilPageContainer() {
  const { data, isLoading, isError } = usePublicPastoralCouncilQuery()
  const roots = buildPastoralCouncilPositionTree({
    positions: data?.positions ?? [],
    members: data?.members ?? [],
  })

  if (isLoading && !data) {
    return (
      <div className="mt-8 min-h-[640px] rounded-3xl border border-border/60 bg-muted/40" />
    )
  }

  if (isError && !data) {
    return (
      <div className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        사목협의회 정보를 불러오지 못했습니다.
      </div>
    )
  }

  return <PastoralCouncilPageView roots={roots} />
}
