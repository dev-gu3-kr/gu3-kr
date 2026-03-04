"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api"
import { BulletinWriteFormView } from "./BulletinWriteFormView"

type BulletinWriteFormValues = {
  title: string
  content: string
  isPublished: boolean
  file: FileList
}

type BulletinEditFormContainerProps = {
  bulletinId: string
  initialTitle: string
  initialContent: string
  initialIsPublished: boolean
  currentFileName?: string
  currentFileUrl?: string
}

// 본당주보 수정 컨테이너: PATCH multipart 요청 후 상세 페이지로 복귀한다.
export function BulletinEditFormContainer({
  bulletinId,
  initialTitle,
  initialContent,
  initialIsPublished,
  currentFileName,
  currentFileUrl,
}: BulletinEditFormContainerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const router = useRouter()

  const handleSubmit = async (values: BulletinWriteFormValues) => {
    setIsLoading(true)
    setMessage(null)
    setIsError(false)

    try {
      const formData = new FormData()
      formData.append("title", values.title.trim())
      formData.append("content", values.content.trim())
      formData.append("isPublished", values.isPublished ? "true" : "false")

      if (values.file?.[0]) {
        formData.append("file", values.file[0] as File)
      }

      const response = await apiFetch
        .patch(`/api/admin/bulletins/${bulletinId}`)
        .init({ body: formData })
        .send()

      const json = (await response.json().catch(() => null)) as {
        ok?: boolean
        message?: string
      } | null

      if (!response.ok || !json?.ok) {
        throw new Error(json?.message ?? "본당주보 수정에 실패했습니다.")
      }

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

  return (
    <BulletinWriteFormView
      onSubmitAction={handleSubmit}
      isLoading={isLoading}
      message={message}
      isError={isError}
      initialTitle={initialTitle}
      initialContent={initialContent}
      initialIsPublished={initialIsPublished}
      submitLabel="수정 저장"
      requireFile={false}
      currentFileName={currentFileName}
      currentFileUrl={currentFileUrl}
    />
  )
}
