"use client"

import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"

type YouthBlogDeleteButtonProps = {
  noticeId: string
}

export function YouthBlogDeleteButton({
  noticeId,
}: YouthBlogDeleteButtonProps) {
  const router = useRouter()

  const handleDelete = async () => {
    // 삭제 전 사용자 확인을 받는다.
    const shouldDelete = window.confirm("이 공지사항을 삭제할까요?")

    if (!shouldDelete) {
      return
    }

    const response = await apiFetch
      .del(`/api/admin/youth-blog/${noticeId}`)
      .send()

    if (!response.ok) {
      window.alert("삭제에 실패했습니다.")
      return
    }

    router.push("/admin/youth-blog")
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
