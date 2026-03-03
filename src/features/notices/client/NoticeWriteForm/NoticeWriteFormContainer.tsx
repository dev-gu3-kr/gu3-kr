"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import type { CreateNoticeInputDto } from "@/features/notices/isomorphic"
import { apiFetch } from "@/lib/api"
import { NoticeWriteFormView } from "./NoticeWriteFormView"

export function NoticeWriteFormContainer() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const router = useRouter()

  async function uploadNoticeImage(file: File) {
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

  const handleSubmit = async (values: CreateNoticeInputDto) => {
    setIsLoading(true)
    setMessage(null)
    setIsError(false)

    try {
      const response = await apiFetch
        .post("/api/admin/notices")
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
        router.push(`/admin/notices/${json.id}`)
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
    <NoticeWriteFormView
      onSubmitAction={handleSubmit}
      isLoading={isLoading}
      message={message}
      isError={isError}
      onUploadImageAction={uploadNoticeImage}
    />
  )
}
