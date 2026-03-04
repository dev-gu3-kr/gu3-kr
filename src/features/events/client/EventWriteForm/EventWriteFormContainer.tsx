"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api"
import { EventWriteFormView } from "./EventWriteFormView"

type EventWriteFormValues = {
  title: string
  description: string
  startsAt: string
  endsAt: string
  isPublished: boolean
}

export function EventWriteFormContainer() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const router = useRouter()

  const handleSubmit = async (values: EventWriteFormValues) => {
    setIsLoading(true)
    setMessage(null)
    setIsError(false)

    try {
      const response = await apiFetch
        .post("/api/admin/events")
        .json({
          title: values.title.trim(),
          description: values.description.trim(),
          startsAt: values.startsAt,
          endsAt: values.endsAt,
          isPublished: values.isPublished,
        })
        .send()

      const json = (await response.json().catch(() => null)) as {
        ok?: boolean
        message?: string
        id?: string
      } | null

      if (!response.ok || !json?.ok || !json.id) {
        throw new Error(json?.message ?? "일정 저장에 실패했습니다.")
      }

      toast.success("일정이 저장되었습니다.")
      router.push(`/admin/events/${json.id}`)
      router.refresh()
    } catch (error) {
      setIsError(true)
      setMessage(
        error instanceof Error ? error.message : "일정 저장에 실패했습니다.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <EventWriteFormView
      onSubmitAction={handleSubmit}
      isLoading={isLoading}
      message={message}
      isError={isError}
      submitLabel="일정 저장"
    />
  )
}
