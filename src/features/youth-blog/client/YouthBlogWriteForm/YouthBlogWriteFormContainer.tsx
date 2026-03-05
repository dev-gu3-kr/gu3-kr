// 공지 작성 컨테이너: 저장 API 연동 + 에디터 이미지 업로드
"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import type { CreateYouthBlogInputDto } from "@/features/youth-blog/isomorphic"
import { apiFetch } from "@/lib/api"
import { YouthBlogWriteFormView } from "./YouthBlogWriteFormView"

// 공지 작성 컨테이너: 생성 API 호출/성공 이동/에러 메시지 상태를 담당한다.
export function YouthBlogWriteFormContainer() {
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

  // 저장 처리: 성공 시 상세 페이지로 이동하고, 실패 시 사용자 메시지를 표시한다.
  const handleSubmit = async (values: CreateYouthBlogInputDto) => {
    setIsLoading(true)
    setMessage(null)
    setIsError(false)

    try {
      const response = await apiFetch
        .post("/api/admin/youth-blog")
        .json(values)
        .send()

      const json = (await response.json().catch(() => null)) as {
        ok?: boolean
        message?: string
        id?: string
      } | null

      if (!response.ok || !json?.ok) {
        throw new Error(json?.message ?? "공지 저장에 실패했습니다.")
      }

      setMessage("공지사항이 저장되었습니다.")
      toast.success("공지사항이 저장되었습니다.")

      if (json.id) {
        router.push(`/admin/youth-blog/${json.id}`)
        router.refresh()
        return
      }

      router.refresh()
    } catch (error) {
      setIsError(true)
      setMessage(
        error instanceof Error ? error.message : "공지 저장에 실패했습니다.",
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
      onUploadImageAction={uploadYouthBlogImage}
    />
  )
}
