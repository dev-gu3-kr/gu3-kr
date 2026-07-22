"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import {
  syncEventMutationCache,
  toEventDateTimeIso,
  toEventDateTimeLocal,
  useEventDetailQuery,
} from "@/features/events/isomorphic"
import { apiFetch } from "@/lib/api"
import { EventWriteFormView } from "./EventWriteFormView"

type EventWriteFormValues = {
  title: string
  description: string
  startsAt: string
  endsAt: string
  isPublished: boolean
}

export function EventEditFormContainer({
  eventId,
  navigateOnSuccess = true,
  onSuccessAction,
  onCloseAction,
}: {
  eventId: string
  navigateOnSuccess?: boolean
  onSuccessAction?: () => void
  onCloseAction?: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()
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
          startsAt: toEventDateTimeIso(values.startsAt),
          endsAt: toEventDateTimeIso(values.endsAt),
          isPublished: values.isPublished,
        })
        .send()

      const json = (await response.json().catch(() => null)) as {
        ok?: boolean
        message?: string
      } | null
      if (!response.ok || !json?.ok)
        throw new Error(json?.message ?? "일정 수정에 실패했습니다.")

      await syncEventMutationCache(queryClient, { id: eventId })

      toast.success("일정이 수정되었습니다.")
      if (navigateOnSuccess) {
        router.push(`/admin/events/${eventId}`)
        router.refresh()
      } else {
        onSuccessAction?.()
      }
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
        startsAt: toEventDateTimeLocal(data.startsAt),
        endsAt: toEventDateTimeLocal(data.endsAt),
        isPublished: data.isPublished,
      }}
      submitLabel="수정 저장"
      onCloseAction={onCloseAction}
    />
  )
}
