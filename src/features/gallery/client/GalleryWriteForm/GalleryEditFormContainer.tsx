"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api"
import { GalleryWriteFormView } from "./GalleryWriteFormView"

type Values = {
  title: string
  content: string
  isPublished: boolean
  thumbnailUrl: string
}

export function GalleryEditFormContainer({
  postId,
  initialTitle,
  initialContent,
  initialIsPublished,
  currentThumbnailUrl,
}: {
  postId: string
  initialTitle: string
  initialContent: string
  initialIsPublished: boolean
  currentThumbnailUrl?: string
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const router = useRouter()

  async function uploadGalleryImage(file: File) {
    const formData = new FormData()
    formData.append("file", file)

    const response = await apiFetch
      .post("/api/admin/uploads/gallery-image")
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

  const onSubmit = async (values: Values) => {
    setIsLoading(true)
    setMessage(null)
    setIsError(false)
    try {
      const form = new FormData()
      form.append("title", values.title.trim())
      form.append("content", values.content.trim())
      form.append("isPublished", values.isPublished ? "true" : "false")
      form.append("thumbnailUrl", values.thumbnailUrl.trim())
      const response = await apiFetch
        .patch(`/api/admin/gallery/${postId}`)
        .init({ body: form })
        .send()
      const json = (await response.json().catch(() => null)) as {
        ok?: boolean
        message?: string
      } | null
      if (!response.ok || !json?.ok) {
        throw new Error(json?.message ?? "수정에 실패했습니다.")
      }
      toast.success("갤러리가 수정되었습니다.")
      router.push(`/admin/gallery/${postId}`)
      router.refresh()
    } catch (error) {
      setIsError(true)
      setMessage(
        error instanceof Error ? error.message : "수정에 실패했습니다.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <GalleryWriteFormView
      onSubmitAction={onSubmit}
      onUploadImageAction={uploadGalleryImage}
      onUploadThumbnailAction={uploadGalleryImage}
      isLoading={isLoading}
      message={message}
      isError={isError}
      initialTitle={initialTitle}
      initialContent={initialContent}
      initialIsPublished={initialIsPublished}
      currentThumbnailUrl={currentThumbnailUrl}
      submitLabel="수정 저장"
      requireThumbnail={false}
    />
  )
}
