"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { syncEventMutationCache } from "@/features/events/isomorphic"
import { apiFetch } from "@/lib/api"

export function EventDeleteButton({
  eventId,
  navigateOnSuccess = true,
  onSuccessAction,
}: {
  eventId: string
  navigateOnSuccess?: boolean
  onSuccessAction?: () => void
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  return (
    <button
      type="button"
      disabled={isDeleting}
      className="rounded-md border px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
      onClick={async () => {
        const ok = window.confirm("정말 삭제하시겠습니까?")
        if (!ok) return

        setIsDeleting(true)
        try {
          const response = await apiFetch
            .del(`/api/admin/events/${eventId}`)
            .send()
          const json = (await response.json().catch(() => null)) as {
            ok?: boolean
            message?: string
          } | null

          if (!response.ok || !json?.ok) {
            throw new Error(json?.message ?? "삭제에 실패했습니다.")
          }

          await syncEventMutationCache(queryClient, {
            id: eventId,
            deleted: true,
          })

          // 상세 페이지는 목록으로 이동하고, 팝업은 소유자가 닫힘 상태를 결정한다.
          if (navigateOnSuccess) {
            router.push("/admin/events")
            router.refresh()
          } else {
            onSuccessAction?.()
          }
        } catch (error) {
          window.alert(
            error instanceof Error ? error.message : "삭제에 실패했습니다.",
          )
        } finally {
          setIsDeleting(false)
        }
      }}
    >
      {isDeleting ? "삭제 중..." : "삭제"}
    </button>
  )
}
