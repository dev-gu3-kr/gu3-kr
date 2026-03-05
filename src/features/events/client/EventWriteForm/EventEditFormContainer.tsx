"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { useEventDetailQuery } from "@/features/events/isomorphic"
import { apiFetch } from "@/lib/api"
import { EventWriteFormView } from "./EventWriteFormView"

type EventWriteFormValues = {
  title: string
  description: string
  startsAt: string
  endsAt: string
  isPublished: boolean
}

function toDateTimeLocal(text: string) {
  const d = new Date(text)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function EventEditFormContainer({ eventId }: { eventId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const router = useRouter()
  const {
    data,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useEventDetailQuery(eventId)

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
      if (!response.ok || !json?.ok)
        throw new Error(json?.message ?? "일정 수정에 실패했습니다.")

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

  if (isDetailLoading)
    return (
      <div className="h-[420px] animate-pulse rounded-md border bg-neutral-100" />
    )
  if (isDetailError || !data)
    return (
      <p className="text-sm text-red-600">
        일정 수정 데이터를 불러오지 못했습니다.
      </p>
    )

  return (
    <EventWriteFormView
      onSubmitAction={handleSubmit}
      isLoading={isLoading}
      message={message}
      isError={isError}
      initialValues={{
        title: data.title,
        description: data.description || "",
        startsAt: toDateTimeLocal(data.startsAt),
        endsAt: toDateTimeLocal(data.endsAt),
        isPublished: data.isPublished,
      }}
      submitLabel="수정 저장"
    />
  )
}
