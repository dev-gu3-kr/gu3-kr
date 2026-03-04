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

// 본당주보 작성 컨테이너: multipart 요청을 전송하고 성공 시 상세 페이지로 이동한다.
export function BulletinWriteFormContainer() {
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
      formData.append("file", values.file[0] as File)

      const response = await apiFetch
        .post("/api/admin/bulletins")
        .init({ body: formData })
        .send()

      const json = (await response.json().catch(() => null)) as {
        ok?: boolean
        message?: string
        id?: string
      } | null

      if (!response.ok || !json?.ok || !json.id) {
        throw new Error(json?.message ?? "본당주보 저장에 실패했습니다.")
      }

      toast.success("본당주보가 저장되었습니다.")
      router.push(`/admin/bulletins/${json.id}`)
      router.refresh()
    } catch (error) {
      setIsError(true)
      setMessage(
        error instanceof Error
          ? error.message
          : "본당주보 저장에 실패했습니다.",
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
    />
  )
}
