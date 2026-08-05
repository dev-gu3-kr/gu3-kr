"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { usePastoralCouncilPositionsQuery } from "@/features/pastoral-council/isomorphic"

export function PastoralCouncilCreateButton() {
  const router = useRouter()
  const { data } = usePastoralCouncilPositionsQuery()
  const isDisabled = data !== undefined && data.length === 0

  return (
    <Button
      type="button"
      disabled={isDisabled}
      title={isDisabled ? "먼저 직책을 등록해 주세요." : undefined}
      onClick={() => router.push("/admin/pastoral-council/new")}
      className="min-w-[92px]"
    >
      + 등록
    </Button>
  )
}
