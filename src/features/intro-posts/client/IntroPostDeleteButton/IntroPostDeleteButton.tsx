"use client"

import { useRouter } from "next/navigation"
import {
  getIntroPostSectionConfig,
  type IntroPostSectionKey,
} from "@/features/intro-posts/isomorphic"
import { apiFetch } from "@/lib/api"

type IntroPostDeleteButtonProps = {
  section: IntroPostSectionKey
  postId: string
}

export function IntroPostDeleteButton({
  section,
  postId,
}: IntroPostDeleteButtonProps) {
  const config = getIntroPostSectionConfig(section)
  const router = useRouter()

  const handleDelete = async () => {
    const shouldDelete = window.confirm(
      `${config.menuLabel} 항목을 삭제할까요?`,
    )

    if (!shouldDelete) return

    const response = await apiFetch
      .del(`${config.adminApiPath}/${postId}`)
      .send()

    if (!response.ok) {
      window.alert(`${config.menuLabel} 삭제에 실패했습니다.`)
      return
    }

    router.push(config.adminPath)
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
    >
      삭제
    </button>
  )
}
