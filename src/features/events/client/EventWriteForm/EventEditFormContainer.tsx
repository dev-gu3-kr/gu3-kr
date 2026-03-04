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

type EventEditFormContainerProps = {
  eventId: string
  initialValues: EventWriteFormValues
}

export function EventEditFormContainer({
  eventId,
  initialValues,
}: EventEditFormContainerProps) {
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
        .patch(`/api/admin/events/${eventId}`)
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
      } | null

      if (!response.ok || !json?.ok) {
        throw new Error(json?.message ?? "일정 수정에 실패했습니다.")
      }

      toast.success("일정이 수정되었습니다.")
      router.push(`/admin/events/${eventId}`)
      router.refresh()
    } catch (error) {
      setIsError(true)
      setMessage(
        error instanceof Error ? error.message : "일정 수정에 실패했습니다.",
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
      initialValues={initialValues}
      submitLabel="수정 저장"
    />
  )
}
