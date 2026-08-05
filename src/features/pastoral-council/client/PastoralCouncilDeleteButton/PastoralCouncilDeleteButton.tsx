"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  type PastoralCouncilListItemDto,
  type PastoralCouncilPositionDto,
  pastoralCouncilQueryKeys,
  publicPastoralCouncilQueryKeys,
} from "@/features/pastoral-council/isomorphic"
import { apiFetch } from "@/lib/api"

export function PastoralCouncilDeleteButton({
  memberId,
  positionId,
  isActive,
}: {
  memberId: string
  positionId: string
  isActive: boolean
}) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    const shouldDelete = window.confirm("이 사목협의회 위원을 삭제할까요?")
    if (!shouldDelete) return

    const response = await apiFetch
      .del(`/api/admin/pastoral-council/${memberId}`)
      .send()
    if (!response.ok) {
      toast.error("삭제에 실패했습니다.")
      return
    }

    queryClient.removeQueries({
      queryKey: pastoralCouncilQueryKeys.detail(memberId),
      exact: true,
    })
    queryClient.setQueryData<PastoralCouncilListItemDto[]>(
      pastoralCouncilQueryKeys.lists(),
      (previous) => previous?.filter((item) => item.id !== memberId) ?? [],
    )
    if (isActive) {
      queryClient.setQueryData<PastoralCouncilPositionDto[]>(
        pastoralCouncilQueryKeys.positions(),
        (previous) =>
          previous?.map((position) =>
            position.id === positionId
              ? {
                  ...position,
                  memberCount: Math.max(0, position.memberCount - 1),
                }
              : position,
          ) ?? [],
      )
    }

    router.replace("/admin/pastoral-council")

    void queryClient.invalidateQueries({
      queryKey: pastoralCouncilQueryKeys.lists(),
    })
    void queryClient.invalidateQueries({
      queryKey: publicPastoralCouncilQueryKeys.detail(),
    })
    void queryClient.invalidateQueries({
      queryKey: pastoralCouncilQueryKeys.positions(),
    })
  }

  return (
    <Button type="button" variant="destructive" onClick={handleDelete}>
      삭제
    </Button>
  )
}
