"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import {
  type CreateYouthBlogInputDto,
  useYouthBlogDetailQuery,
} from "@/features/youth-blog/isomorphic"
import { apiFetch } from "@/lib/api"
import { YouthBlogWriteFormView } from "./YouthBlogWriteFormView"

export function YouthBlogEditFormContainer({ noticeId }: { noticeId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const router = useRouter()
  const {
    data,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useYouthBlogDetailQuery(noticeId)

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
    if (!response.ok || !json?.ok || !json.url)
      throw new Error(json?.message ?? "이미지 업로드에 실패했습니다.")
    return json.url
  }

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
      if (!response.ok || !json?.ok)
        throw new Error(json?.message ?? "공지 수정에 실패했습니다.")
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

  if (isDetailLoading)
    return (
      <div className="h-[420px] animate-pulse rounded-md border bg-neutral-100" />
    )
  if (isDetailError || !data)
    return (
      <p className="text-sm text-red-600">
        청소년 블로그 수정 데이터를 불러오지 못했습니다.
      </p>
    )

  return (
    <YouthBlogWriteFormView
      onSubmitAction={handleSubmit}
      isLoading={isLoading}
      message={message}
      isError={isError}
      initialTitle={data.title}
      initialSummary={data.summary ?? undefined}
      initialContent={data.content}
      initialIsPublished={data.isPublished}
      submitLabel="수정 저장"
      onUploadImageAction={uploadYouthBlogImage}
    />
  )
}
