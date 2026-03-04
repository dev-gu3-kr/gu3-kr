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

export function GalleryWriteFormContainer() {
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
        .post("/api/admin/gallery")
        .init({ body: form })
        .send()
      const json = (await response.json().catch(() => null)) as {
        ok?: boolean
        id?: string
        message?: string
      } | null
      if (!response.ok || !json?.ok || !json.id) {
        throw new Error(json?.message ?? "저장에 실패했습니다.")
      }
      toast.success("갤러리가 저장되었습니다.")
      router.push(`/admin/gallery/${json.id}`)
      router.refresh()
    } catch (error) {
      setIsError(true)
      setMessage(
        error instanceof Error ? error.message : "저장에 실패했습니다.",
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
      submitLabel="갤러리 저장"
    />
  )
}
