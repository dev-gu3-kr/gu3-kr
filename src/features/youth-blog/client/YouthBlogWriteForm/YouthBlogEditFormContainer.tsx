// 공지 수정 컨테이너: PATCH 연동 + 에디터 이미지 업로드
"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import type { CreateYouthBlogInputDto } from "@/features/youth-blog/isomorphic"
import { apiFetch } from "@/lib/api"
import { YouthBlogWriteFormView } from "./YouthBlogWriteFormView"

type YouthBlogEditFormContainerProps = {
  noticeId: string
  initialTitle: string
  initialSummary?: string | null
  initialContent: string
  initialIsPublished: boolean
}

// 공지 수정 컨테이너: PATCH 요청과 수정 완료 후 상세 복귀 흐름을 담당한다.
export function YouthBlogEditFormContainer({
  noticeId,
  initialTitle,
  initialSummary,
  initialContent,
  initialIsPublished,
}: YouthBlogEditFormContainerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const router = useRouter()

  // 본문 이미지 업로드: formData 전송 후 삽입 가능한 이미지 URL을 반환한다.
  async function uploadYouthBlogImage(file: File) {
    const formData = new FormData()
    formData.append("file", file)

    const response = await apiFetch
      .post("/api/admin/uploads/notice-image")
      .init({ body: formData })
      .send()

    const json = (await response.json().catch(() => null)) as {
      ok?: boolean
      url?: string
      message?: string
    } | null

    if (!response.ok || !json?.ok || !json.url) {
      throw new Error(json?.message ?? "이미지 업로드에 실패했습니다.")
    }

    return json.url
  }

  // 수정 저장: 성공 시 상세로 이동, 실패 시 메시지 상태로 피드백한다.
  const handleSubmit = async (values: CreateYouthBlogInputDto) => {
    setIsLoading(true)
    setMessage(null)
    setIsError(false)

    try {
      const response = await apiFetch
        .patch(`/api/admin/youth-blog/${noticeId}`)
        .json(values)
        .send()

      const json = (await response.json().catch(() => null)) as {
        ok?: boolean
        message?: string
      } | null

      if (!response.ok || !json?.ok) {
        throw new Error(json?.message ?? "공지 수정에 실패했습니다.")
      }

      setMessage("공지사항이 수정되었습니다.")
      toast.success("공지사항이 수정되었습니다.")
      router.push(`/admin/youth-blog/${noticeId}`)
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
    <YouthBlogWriteFormView
      onSubmitAction={handleSubmit}
      isLoading={isLoading}
      message={message}
      isError={isError}
      initialTitle={initialTitle}
      initialSummary={initialSummary ?? undefined}
      initialContent={initialContent}
      initialIsPublished={initialIsPublished}
      submitLabel="수정 저장"
      onUploadImageAction={uploadYouthBlogImage}
    />
  )
}
