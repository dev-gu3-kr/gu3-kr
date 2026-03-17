"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import {
  type PastoralCouncilListItemDto,
  pastoralCouncilQueryKeys,
  publicPastoralCouncilQueryKeys,
} from "@/features/pastoral-council/isomorphic"
import { apiFetch } from "@/lib/api"

export function PastoralCouncilDeleteButton({
  memberId,
}: {
  memberId: string
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
      window.alert("삭제에 실패했습니다.")
      return
    }

    // 삭제 직후 목록으로 돌아가도 이전 캐시가 보이지 않도록 즉시 동기화한다.
    queryClient.setQueryData<PastoralCouncilListItemDto[]>(
      pastoralCouncilQueryKeys.lists(),
      (previous) => previous?.filter((item) => item.id !== memberId) ?? [],
    )
    queryClient.setQueryData<PastoralCouncilListItemDto[]>(
      publicPastoralCouncilQueryKeys.lists(),
      (previous) => previous?.filter((item) => item.id !== memberId) ?? [],
    )

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: pastoralCouncilQueryKeys.lists(),
      }),
      queryClient.invalidateQueries({
        queryKey: pastoralCouncilQueryKeys.detail(memberId),
      }),
      queryClient.invalidateQueries({
        queryKey: publicPastoralCouncilQueryKeys.lists(),
      }),
    ])

    router.push("/admin/pastoral-council")
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
    >
      삭제
    </button>
  )
}
