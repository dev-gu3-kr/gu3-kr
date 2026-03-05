// 신부 폼 컨테이너: 저장/이미지 업로드/교체/삭제 로직
"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import {
  type UpsertPriestInputDto,
  usePriestDetailQuery,
} from "@/features/clergy-priests/isomorphic"
import { apiFetch } from "@/lib/api"
import { PriestFormView } from "./PriestFormView"

// datetime-local/로케일 문자열을 ISO로 변환한다.
function toIsoDateTime(input?: string) {
  if (!input || input.trim() === "") return undefined

  const trimmed = input.trim()

  const koreanMatch = trimmed.match(
    /^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.\s*(오전|오후)\s*(\d{1,2}):(\d{2})$/,
  )

  if (koreanMatch) {
    const [, y, m, d, meridiem, hh, mm] = koreanMatch
    let hour = Number(hh)
    if (meridiem === "오후" && hour < 12) hour += 12
    if (meridiem === "오전" && hour === 12) hour = 0

    const date = new Date(
      Number(y),
      Number(m) - 1,
      Number(d),
      hour,
      Number(mm),
      0,
      0,
    )
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
  }

  const date = new Date(trimmed)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

// 숫자 필드의 NaN/비정상 값을 제거한다.
function normalizeNumber(input?: number) {
  if (typeof input !== "number" || Number.isNaN(input)) return undefined
  return input
}

// 폼 입력값을 trim/타입 정규화해 API payload 형태로 맞춘다.
function normalizeInput(values: UpsertPriestInputDto): UpsertPriestInputDto {
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
  priestId?: string
  initialValues?: UpsertPriestInputDto
}

// 생성/수정 모드 분기, 저장 API 호출, 성공 후 상세 이동을 담당한다.
export function PriestFormContainer({ mode, priestId, initialValues }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const router = useRouter()

  const detailQuery = usePriestDetailQuery(priestId ?? "")

  const resolvedInitialValues =
    mode === "edit"
      ? (initialValues ??
        (detailQuery.data
          ? {
              name: detailQuery.data.name,
              baptismalName: detailQuery.data.baptismalName ?? undefined,
              duty: detailQuery.data.duty,
              feastMonth: detailQuery.data.feastMonth ?? undefined,
              feastDay: detailQuery.data.feastDay ?? undefined,
              termStart: detailQuery.data.termStart ?? undefined,
              termEnd: detailQuery.data.termEnd ?? undefined,
              phone: detailQuery.data.phone ?? undefined,
              imageUrl: detailQuery.data.imageUrl ?? undefined,
              isCurrent: detailQuery.data.isCurrent,
              sortOrder: detailQuery.data.sortOrder,
            }
          : undefined))
      : initialValues

  const handleSubmit = async (values: UpsertPriestInputDto) => {
    const normalizedValues = normalizeInput(values)
    setIsLoading(true)
    setMessage(null)
    setIsError(false)
    try {
      if (mode === "create") {
        const response = await apiFetch
          .post("/api/admin/clergy/priests")
          .json(normalizedValues)
          .send()
        const json = (await response.json().catch(() => null)) as {
          ok?: boolean
          id?: string
          message?: string
        } | null
        if (!response.ok || !json?.ok || !json.id)
          throw new Error(json?.message ?? "저장에 실패했습니다.")
        toast.success("신부님 프로필이 저장되었습니다.")
        router.push(`/admin/clergy/priests/${json.id}`)
        router.refresh()
        return
      }
      const response = await apiFetch
        .patch(`/api/admin/clergy/priests/${priestId}`)
        .json(normalizedValues)
        .send()
      const json = (await response.json().catch(() => null)) as {
        ok?: boolean
        message?: string
      } | null
      if (!response.ok || !json?.ok)
        throw new Error(json?.message ?? "수정에 실패했습니다.")
      toast.success("신부님 프로필이 수정되었습니다.")
      router.push(`/admin/clergy/priests/${priestId}`)
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

  // 이미지 업로드 후(edit 모드) DB imageUrl 즉시 반영 + 이전 이미지 정리.
  async function uploadClergyImage(file: File, previousUrl?: string) {
    const formData = new FormData()
    formData.append("file", file)

    const response = await apiFetch
      .post("/api/admin/uploads/clergy-image")
      .init({ body: formData })
      .send()
    const json = (await response.json().catch(() => null)) as {
      ok?: boolean
      url?: string
      message?: string
    } | null

    if (!response.ok || !json?.ok || !json.url) {
      throw new Error(json?.message ?? "이미지 업로드에 실패했습니다.")
    }

    if (mode === "edit" && priestId) {
      const patchResponse = await apiFetch
        .patch(`/api/admin/clergy/priests/${priestId}`)
        .json({ imageUrl: json.url })
        .send()

      const patchJson = (await patchResponse.json().catch(() => null)) as {
        ok?: boolean
        message?: string
      } | null

      if (!patchResponse.ok || !patchJson?.ok) {
        throw new Error(patchJson?.message ?? "image change save failed")
      }

      if (previousUrl && previousUrl !== json.url) {
        await removeClergyImage(previousUrl)
      }
    }

    return json.url
  }

  // 저장소 이미지 물리 삭제 API 호출.
  async function removeClergyImage(url: string) {
    const response = await apiFetch
      .del("/api/admin/uploads/clergy-image")
      .json({ url })
      .send()

    const json = (await response.json().catch(() => null)) as {
      ok?: boolean
      message?: string
    } | null

    if (!response.ok || !json?.ok) {
      throw new Error(json?.message ?? "이미지 삭제에 실패했습니다.")
    }
  }

  if (mode === "edit" && !resolvedInitialValues) {
    if (detailQuery.isLoading)
      return (
        <div className="h-[420px] animate-pulse rounded-md border bg-neutral-100" />
      )

    if (detailQuery.isError)
      return (
        <p className="text-sm text-red-600">
          신부님 수정 데이터를 불러오지 못했습니다.
        </p>
      )
  }

  return (
    <PriestFormView
      initialValues={resolvedInitialValues}
      onSubmitAction={handleSubmit}
      onUploadImageAction={uploadClergyImage}
      onRemoveImageAction={removeClergyImage}
      submitLabel={mode === "create" ? "저장" : "수정 저장"}
      isLoading={isLoading}
      message={message}
      isError={isError}
    />
  )
}
