"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import type { UpsertNunInputDto } from "@/features/clergy-nuns/isomorphic"
import { apiFetch } from "@/lib/api"
import { NunFormView } from "./NunFormView"

function toIsoDateTime(input?: string) {
  if (!input || input.trim() === "") return undefined
  const date = new Date(input)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}
function normalizeNumber(input?: number) {
  if (typeof input !== "number" || Number.isNaN(input)) return undefined
  return input
}
function normalizeInput(values: UpsertNunInputDto): UpsertNunInputDto {
  return {
    ...values,
    baptismalName: values.baptismalName?.trim() || undefined,
    phone: values.phone?.trim() || undefined,
    imageUrl: values.imageUrl?.trim() || undefined,
    feastMonth: normalizeNumber(values.feastMonth),
    feastDay: normalizeNumber(values.feastDay),
    sortOrder: normalizeNumber(values.sortOrder),
    termStart: toIsoDateTime(values.termStart),
    termEnd: toIsoDateTime(values.termEnd),
  }
}

type Props = {
  mode: "create" | "edit"
  nunId?: string
  initialValues?: UpsertNunInputDto
}

export function NunFormContainer({ mode, nunId, initialValues }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const router = useRouter()

  const handleSubmit = async (values: UpsertNunInputDto) => {
    const normalizedValues = normalizeInput(values)
    setIsLoading(true)
    setMessage(null)
    setIsError(false)
    try {
      if (mode === "create") {
        const response = await apiFetch
          .post("/api/admin/clergy/nuns")
          .json(normalizedValues)
          .send()
        const json = (await response.json().catch(() => null)) as {
          ok?: boolean
          id?: string
          message?: string
        } | null
        if (!response.ok || !json?.ok || !json.id)
          throw new Error(json?.message ?? "저장에 실패했습니다.")
        toast.success("수녀님 프로필이 저장되었습니다.")
        router.push(`/admin/clergy/nuns/${json.id}`)
        router.refresh()
        return
      }
      const response = await apiFetch
        .patch(`/api/admin/clergy/nuns/${nunId}`)
        .json(normalizedValues)
        .send()
      const json = (await response.json().catch(() => null)) as {
        ok?: boolean
        message?: string
      } | null
      if (!response.ok || !json?.ok)
        throw new Error(json?.message ?? "수정에 실패했습니다.")
      toast.success("수녀님 프로필이 수정되었습니다.")
      router.push(`/admin/clergy/nuns/${nunId}`)
      router.refresh()
    } catch (error) {
      setIsError(true)
      setMessage(
        error instanceof Error ? error.message : "처리에 실패했습니다.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <NunFormView
      initialValues={initialValues}
      onSubmitAction={handleSubmit}
      submitLabel={mode === "create" ? "저장" : "수정 저장"}
      isLoading={isLoading}
      message={message}
      isError={isError}
    />
  )
}
