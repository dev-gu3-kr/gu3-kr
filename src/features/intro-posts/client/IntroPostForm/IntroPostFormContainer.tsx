"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import {
  type CreateIntroPostInputDto,
  getIntroPostSectionConfig,
  type IntroPostSectionKey,
  syncIntroPostMutationCache,
  useIntroPostDetailQuery,
} from "@/features/intro-posts/isomorphic"
import { apiFetch } from "@/lib/api"
import { IntroPostFormView } from "./IntroPostFormView"

type IntroPostFormContainerProps = {
  section: IntroPostSectionKey
  postId?: string
}

export function IntroPostFormContainer({
  section,
  postId,
}: IntroPostFormContainerProps) {
  const config = getIntroPostSectionConfig(section)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()
  const detailQuery = useIntroPostDetailQuery(section, postId ?? "")

  async function uploadIntroImage(file: File) {
    const formData = new FormData()
    formData.append("file", file)

    const response = await apiFetch
      .post("/api/admin/uploads/intro-image")
      .init({ body: formData })
      .send()

    const json = (await response.json().catch(() => null)) as {
      ok?: boolean
      url?: string
      message?: string
    } | null

    if (!response.ok || !json?.ok || !json.url) {
      throw new Error(json?.message ?? "이미지 업로드에 실패했습니다.")
    }

    return json.url
  }

  async function removeIntroImage(url: string) {
    const isPersistedImage = Boolean(
      postId && detailQuery.data?.imageUrl === url,
    )

    const response = isPersistedImage
      ? await apiFetch.del(`${config.adminApiPath}/${postId}/image`).send()
      : await apiFetch
          .del("/api/admin/uploads/intro-image")
          .json({ url })
          .send()

    const json = (await response.json().catch(() => null)) as {
      ok?: boolean
      message?: string
    } | null

    if (!response.ok || !json?.ok) {
      throw new Error(json?.message ?? "이미지 삭제에 실패했습니다.")
    }

    await syncIntroPostMutationCache(queryClient, { section, id: postId })
  }

  const handleSubmit = async (values: CreateIntroPostInputDto) => {
    setIsLoading(true)
    setMessage(null)
    setIsError(false)

    try {
      const response = postId
        ? await apiFetch
            .patch(`${config.adminApiPath}/${postId}`)
            .json(values)
            .send()
        : await apiFetch.post(config.adminApiPath).json(values).send()

      const json = (await response.json().catch(() => null)) as {
        ok?: boolean
        id?: string
        message?: string
      } | null

      if (!response.ok || !json?.ok) {
        throw new Error(
          json?.message ?? `${config.menuLabel} 저장에 실패했습니다.`,
        )
      }

      await syncIntroPostMutationCache(queryClient, {
        section,
        id: postId ?? json.id,
      })

      const successMessage = postId
        ? `${config.menuLabel}가 수정되었습니다.`
        : `${config.menuLabel}가 저장되었습니다.`
      const nextId = postId ?? json?.id ?? ""

      setMessage(successMessage)
      toast.success(successMessage)

      if (!postId && nextId) {
        router.push(config.adminPath)
        return
      }

      router.refresh()
    } catch (error) {
      setIsError(true)
      setMessage(
        error instanceof Error
          ? error.message
          : `${config.menuLabel} 저장에 실패했습니다.`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (postId && detailQuery.isLoading) {
    return (
      <div className="h-[480px] animate-pulse rounded-md border bg-neutral-100" />
    )
  }

  if (postId && (detailQuery.isError || !detailQuery.data)) {
    return (
      <p className="text-sm text-red-600">
        {config.menuLabel} 수정 데이터를 불러오지 못했습니다.
      </p>
    )
  }

  return (
    <IntroPostFormView
      onSubmitAction={handleSubmit}
      onUploadImageAction={uploadIntroImage}
      onRemoveImageAction={removeIntroImage}
      isLoading={isLoading}
      message={message}
      isError={isError}
      initialTitle={detailQuery.data?.title}
      initialImageUrl={detailQuery.data?.imageUrl ?? undefined}
      initialContent={detailQuery.data?.content}
      initialSortOrder={detailQuery.data?.sortOrder}
      initialIsPublished={detailQuery.data?.isPublished}
      submitLabel={postId ? "수정 저장" : "소개 저장"}
    />
  )
}
