// 청소년 블로그 작성 컨테이너: 저장 API 연동과 이미지 업로드를 담당한다.
"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import type { CreateYouthBlogInputDto } from "@/features/youth-blog/isomorphic"
import { apiFetch } from "@/lib/api"
import { YouthBlogWriteFormView } from "./YouthBlogWriteFormView"

export function YouthBlogWriteFormContainer() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const router = useRouter()

  async function uploadYouthBlogImage(file: File) {
    const formData = new FormData()
    formData.append("file", file)

    const response = await apiFetch
      .post("/api/admin/uploads/youth-blog-image")
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
        throw new Error(json?.message ?? "청소년 블로그 저장에 실패했습니다.")
      }

      setMessage("청소년 블로그가 저장되었습니다.")
      toast.success("청소년 블로그가 저장되었습니다.")

      if (json.id) {
        router.push(`/admin/youth-blog/${json.id}`)
        router.refresh()
        return
      }

      router.refresh()
    } catch (error) {
      setIsError(true)
      setMessage(
        error instanceof Error
          ? error.message
          : "청소년 블로그 저장에 실패했습니다.",
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
      onUploadThumbnailAction={uploadYouthBlogImage}
    />
  )
}
