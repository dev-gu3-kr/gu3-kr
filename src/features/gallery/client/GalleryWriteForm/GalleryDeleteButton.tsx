"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { apiFetch } from "@/lib/api"

export function GalleryDeleteButton({ postId }: { postId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  return (
    <button
      type="button"
      disabled={isDeleting}
      className="rounded-md border px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
      onClick={async () => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return
        setIsDeleting(true)
        try {
          const response = await apiFetch
            .del(`/api/admin/gallery/${postId}`)
            .send()
          const json = (await response.json().catch(() => null)) as {
            ok?: boolean
            message?: string
          } | null
          if (!response.ok || !json?.ok)
            throw new Error(json?.message ?? "삭제에 실패했습니다.")
          router.push("/admin/gallery")
          router.refresh()
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
