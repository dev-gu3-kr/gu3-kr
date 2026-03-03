"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { apiFetch } from "@/lib/api"
import { NoticeWriteFormView } from "./NoticeWriteFormView"

type NoticeEditFormContainerProps = {
  noticeId: string
  initialTitle: string
  initialSummary?: string | null
  initialContent: string
  initialIsPublished: boolean
}

export function NoticeEditFormContainer({
  noticeId,
  initialTitle,
  initialSummary,
  initialContent,
  initialIsPublished,
}: NoticeEditFormContainerProps) {
  // 저장 처리 중 상태를 관리한다.
  const [isLoading, setIsLoading] = useState(false)
  // 사용자 안내 메시지를 관리한다.
  const [message, setMessage] = useState<string | null>(null)
  // 안내 메시지의 에러 여부를 관리한다.
  const [isError, setIsError] = useState(false)
  // Toast UI 본문 마크다운 값을 관리한다.
  const [content, setContent] = useState(initialContent)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)
    setIsError(false)

    const payload = {
      title: String(formData.get("title") ?? ""),
      summary: String(formData.get("summary") ?? ""),
      content: String(formData.get("content") ?? ""),
      isPublished: formData.get("isPublished") === "true",
    }

    try {
      // 공지 수정 API를 호출한다.
      const response = await apiFetch
        .put(`/api/admin/notices/${noticeId}`)
        .json(payload)
        .send()

      const json = (await response.json().catch(() => null)) as {
        ok?: boolean
        message?: string
      } | null

      if (!response.ok || !json?.ok) {
        throw new Error(json?.message ?? "공지 수정에 실패했습니다.")
      }

      setMessage("공지사항이 수정되었습니다.")
      router.push(`/admin/notices/${noticeId}`)
      router.refresh()
    } catch (error) {
      setIsError(true)
      setMessage(
        error instanceof Error ? error.message : "공지 수정에 실패했습니다.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <NoticeWriteFormView
      onSubmitAction={handleSubmit}
      isLoading={isLoading}
      message={message}
      isError={isError}
      content={content}
      onContentChangeAction={setContent}
      initialTitle={initialTitle}
      initialSummary={initialSummary ?? undefined}
      initialIsPublished={initialIsPublished}
      submitLabel="수정 저장"
    />
  )
}
