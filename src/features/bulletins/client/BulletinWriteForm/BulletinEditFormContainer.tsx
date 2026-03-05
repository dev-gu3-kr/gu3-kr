"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { useBulletinDetailQuery } from "@/features/bulletins/isomorphic"
import { apiFetch } from "@/lib/api"
import { BulletinWriteFormView } from "./BulletinWriteFormView"

type BulletinWriteFormValues = {
  title: string
  content: string
  isPublished: boolean
  file: FileList
}

export function BulletinEditFormContainer({
  bulletinId,
}: {
  bulletinId: string
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const router = useRouter()
  const {
    data,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useBulletinDetailQuery(bulletinId)

  const handleSubmit = async (values: BulletinWriteFormValues) => {
    setIsLoading(true)
    setMessage(null)
    setIsError(false)
    try {
      const formData = new FormData()
      formData.append("title", values.title.trim())
      formData.append("content", values.content.trim())
      formData.append("isPublished", values.isPublished ? "true" : "false")
      if (values.file?.[0]) formData.append("file", values.file[0] as File)

      const response = await apiFetch
        .patch(`/api/admin/bulletins/${bulletinId}`)
        .init({ body: formData })
        .send()
      const json = (await response.json().catch(() => null)) as {
        ok?: boolean
        message?: string
      } | null
      if (!response.ok || !json?.ok)
        throw new Error(json?.message ?? "본당주보 수정에 실패했습니다.")

      toast.success("본당주보가 수정되었습니다.")
      router.push(`/admin/bulletins/${bulletinId}`)
      router.refresh()
    } catch (error) {
      setIsError(true)
      setMessage(
        error instanceof Error
          ? error.message
          : "본당주보 수정에 실패했습니다.",
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
        주보 수정 데이터를 불러오지 못했습니다.
      </p>
    )

  const attachment = data.attachments[0]

  return (
    <BulletinWriteFormView
      onSubmitAction={handleSubmit}
      isLoading={isLoading}
      message={message}
      isError={isError}
      initialTitle={data.title}
      initialContent={data.content}
      initialIsPublished={data.isPublished}
      submitLabel="수정 저장"
      requireFile={false}
      currentFileName={attachment?.originalName}
      currentFileUrl={
        attachment ? `/api/admin/bulletins/${data.id}/download` : undefined
      }
    />
  )
}
