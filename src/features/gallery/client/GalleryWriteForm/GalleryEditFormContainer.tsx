"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import {
  galleryQueryKeys,
  useGalleryDetailQuery,
} from "@/features/gallery/isomorphic"
import { apiFetch } from "@/lib/api"
import { GalleryWriteFormView } from "./GalleryWriteFormView"

type Values = {
  title: string
  content: string
  isPublished: boolean
  thumbnailUrl: string
}

export function GalleryEditFormContainer({ postId }: { postId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()
  const {
    data,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useGalleryDetailQuery(postId)

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
    if (!response.ok || !json?.ok || !json.url)
      throw new Error(json?.message ?? "이미지 업로드에 실패했습니다.")
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
      if (!response.ok || !json?.ok)
        throw new Error(json?.message ?? "수정에 실패했습니다.")

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: galleryQueryKeys.detail(postId),
        }),
        queryClient.invalidateQueries({ queryKey: galleryQueryKeys.all }),
      ])

      toast.success("갤러리가 수정되었습니다.")
      router.replace(`/admin/gallery/${postId}`)
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

  if (isDetailLoading)
    return (
      <div className="h-[420px] animate-pulse rounded-md border bg-neutral-100" />
    )
  if (isDetailError || !data)
    return (
      <p className="text-sm text-red-600">
        갤러리 수정 데이터를 불러오지 못했습니다.
      </p>
    )

  return (
    <GalleryWriteFormView
      onSubmitAction={onSubmit}
      onUploadImageAction={uploadGalleryImage}
      onUploadThumbnailAction={uploadGalleryImage}
      isLoading={isLoading}
      message={message}
      isError={isError}
      initialTitle={data.title}
      initialContent={data.content}
      initialIsPublished={data.isPublished}
      currentThumbnailUrl={data.galleryImages[0]?.url}
      submitLabel="수정 저장"
      requireThumbnail={false}
    />
  )
}
