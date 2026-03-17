"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  getAvailablePastoralCouncilRoles,
  usePastoralCouncilListQuery,
} from "@/features/pastoral-council/isomorphic"

export function PastoralCouncilCreateButton() {
  const router = useRouter()
  const { data } = usePastoralCouncilListQuery()

  const availableRoles = getAvailablePastoralCouncilRoles({
    usedRoles: data?.map((item) => item.role) ?? [],
  })
  const isDisabled = data !== undefined && availableRoles.length === 0

  return (
    <Button
      type="button"
      disabled={isDisabled}
      title={isDisabled ? "모든 직책이 이미 등록되어 있습니다." : undefined}
      onClick={() => router.push("/admin/pastoral-council/new")}
      className="min-w-[92px] bg-black text-white hover:bg-black/90"
    >
      + 등록
    </Button>
  )
}
