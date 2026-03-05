"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import {
  type UpsertPastoralCouncilInputDto,
  usePastoralCouncilDetailQuery,
} from "@/features/pastoral-council/isomorphic"
import { apiFetch } from "@/lib/api"
import { PastoralCouncilFormView } from "./PastoralCouncilFormView"

function normalizeNumber(input?: number) {
  if (typeof input !== "number" || Number.isNaN(input)) return undefined
  return input
}

function normalizeInput(
  values: UpsertPastoralCouncilInputDto,
): UpsertPastoralCouncilInputDto {
  return {
    ...values,
    baptismalName: values.baptismalName?.trim() || undefined,
    phone: values.phone.trim(),
    imageUrl: values.imageUrl?.trim() || undefined,
    sortOrder: normalizeNumber(values.sortOrder),
  }
}

export function PastoralCouncilFormContainer({
  mode,
  memberId,
  initialValues,
}: {
  mode: "create" | "edit"
  memberId?: string
  initialValues?: UpsertPastoralCouncilInputDto
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const router = useRouter()

  const detailQuery = usePastoralCouncilDetailQuery(memberId ?? "")

  const resolvedInitialValues =
    mode === "edit"
      ? (initialValues ??
        (detailQuery.data
          ? {
              name: detailQuery.data.name,
              baptismalName: detailQuery.data.baptismalName ?? undefined,
              duty: detailQuery.data.duty,
              phone: detailQuery.data.phone,
              imageUrl: detailQuery.data.imageUrl ?? undefined,
              isActive: detailQuery.data.isActive,
              sortOrder: detailQuery.data.sortOrder,
            }
          : undefined))
      : initialValues

  const handleSubmit = async (values: UpsertPastoralCouncilInputDto) => {
    const normalizedValues = normalizeInput(values)
    setIsLoading(true)
    setMessage(null)
    setIsError(false)
    try {
      if (mode === "create") {
        const response = await apiFetch
          .post("/api/admin/pastoral-council")
          .json(normalizedValues)
          .send()
        const json = (await response.json().catch(() => null)) as {
          ok?: boolean
          id?: string
          message?: string
        } | null
        if (!response.ok || !json?.ok || !json.id)
          throw new Error(json?.message ?? "저장에 실패했습니다.")
        toast.success("사목협의회 위원이 저장되었습니다.")
        router.push(`/admin/pastoral-council/${json.id}`)
        router.refresh()
        return
      }

      const response = await apiFetch
        .patch(`/api/admin/pastoral-council/${memberId}`)
        .json(normalizedValues)
        .send()
      const json = (await response.json().catch(() => null)) as {
        ok?: boolean
        message?: string
      } | null
      if (!response.ok || !json?.ok)
        throw new Error(json?.message ?? "수정에 실패했습니다.")
      toast.success("사목협의회 위원이 수정되었습니다.")
      router.push(`/admin/pastoral-council/${memberId}`)
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
    if (!response.ok || !json?.ok || !json.url)
      throw new Error(json?.message ?? "이미지 업로드에 실패했습니다.")

    if (mode === "edit" && memberId) {
      const patchResponse = await apiFetch
        .patch(`/api/admin/pastoral-council/${memberId}`)
        .json({ imageUrl: json.url })
        .send()
      const patchJson = (await patchResponse.json().catch(() => null)) as {
        ok?: boolean
        message?: string
      } | null
      if (!patchResponse.ok || !patchJson?.ok)
        throw new Error(patchJson?.message ?? "image change save failed")
      if (previousUrl && previousUrl !== json.url)
        await removeClergyImage(previousUrl)
    }

    return json.url
  }

  async function removeClergyImage(url: string) {
    const response = await apiFetch
      .del("/api/admin/uploads/clergy-image")
      .json({ url })
      .send()
    const json = (await response.json().catch(() => null)) as {
      ok?: boolean
      message?: string
    } | null
    if (!response.ok || !json?.ok)
      throw new Error(json?.message ?? "이미지 삭제에 실패했습니다.")
  }

  if (mode === "edit" && !resolvedInitialValues) {
    if (detailQuery.isLoading)
      return (
        <div className="h-[420px] animate-pulse rounded-md border bg-neutral-100" />
      )

    if (detailQuery.isError)
      return (
        <p className="text-sm text-red-600">
          사목협의회 수정 데이터를 불러오지 못했습니다.
        </p>
      )
  }

  return (
    <PastoralCouncilFormView
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
