"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import {
  pastoralCouncilDefaultPlaceholderImageType,
  pastoralCouncilQueryKeys,
  publicPastoralCouncilQueryKeys,
  type UpsertPastoralCouncilInputDto,
  usePastoralCouncilDetailQuery,
  usePastoralCouncilPositionsQuery,
} from "@/features/pastoral-council/isomorphic"
import { apiFetch } from "@/lib/api"
import { PastoralCouncilFormView } from "./PastoralCouncilFormView"

function normalizeInput(
  values: UpsertPastoralCouncilInputDto,
): UpsertPastoralCouncilInputDto {
  return {
    ...values,
    name: values.name.trim(),
    baptismalName: values.baptismalName?.trim() || undefined,
    phone: values.phone?.trim() || undefined,
    imageUrl: values.imageUrl?.trim() || undefined,
    placeholderImageType:
      values.placeholderImageType ?? pastoralCouncilDefaultPlaceholderImageType,
    sortOrder:
      typeof values.sortOrder === "number" && !Number.isNaN(values.sortOrder)
        ? values.sortOrder
        : undefined,
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
  const router = useRouter()
  const queryClient = useQueryClient()
  const positionsQuery = usePastoralCouncilPositionsQuery()
  const detailQuery = usePastoralCouncilDetailQuery(memberId ?? "")

  const resolvedInitialValues =
    mode === "edit"
      ? (initialValues ??
        (detailQuery.data
          ? {
              positionId: detailQuery.data.positionId,
              name: detailQuery.data.name,
              baptismalName: detailQuery.data.baptismalName ?? undefined,
              phone: detailQuery.data.phone ?? undefined,
              imageUrl: detailQuery.data.imageUrl ?? undefined,
              placeholderImageType: detailQuery.data.placeholderImageType,
              isActive: detailQuery.data.isActive,
              sortOrder: detailQuery.data.sortOrder,
            }
          : undefined))
      : initialValues

  async function invalidatePastoralCouncil(id?: string) {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: pastoralCouncilQueryKeys.lists(),
      }),
      queryClient.invalidateQueries({
        queryKey: pastoralCouncilQueryKeys.positions(),
      }),
      queryClient.invalidateQueries({
        queryKey: publicPastoralCouncilQueryKeys.detail(),
      }),
      ...(id
        ? [
            queryClient.invalidateQueries({
              queryKey: pastoralCouncilQueryKeys.detail(id),
            }),
          ]
        : []),
    ])
  }

  const handleSubmit = async (values: UpsertPastoralCouncilInputDto) => {
    const normalizedValues = normalizeInput(values)
    setIsLoading(true)
    setMessage(null)

    try {
      const response =
        mode === "create"
          ? await apiFetch
              .post("/api/admin/pastoral-council")
              .json(normalizedValues)
              .send()
          : await apiFetch
              .patch(`/api/admin/pastoral-council/${memberId}`)
              .json(normalizedValues)
              .send()
      const json = (await response.json().catch(() => null)) as {
        ok?: boolean
        id?: string
        message?: string
      } | null
      if (!response.ok || !json?.ok) {
        throw new Error(json?.message ?? "저장에 실패했습니다.")
      }

      const savedId = mode === "create" ? json.id : memberId
      if (!savedId) throw new Error("저장된 구성원을 확인할 수 없습니다.")

      await invalidatePastoralCouncil(savedId)
      toast.success(
        mode === "create"
          ? "사목협의회 구성원이 저장되었습니다."
          : "사목협의회 구성원이 수정되었습니다.",
      )
      router.push(`/admin/pastoral-council/${savedId}`)
      router.refresh()
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "처리에 실패했습니다.",
      )
    } finally {
      setIsLoading(false)
    }
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
    if (!response.ok || !json?.ok) {
      throw new Error(json?.message ?? "이미지 삭제에 실패했습니다.")
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
    if (!response.ok || !json?.ok || !json.url) {
      throw new Error(json?.message ?? "이미지 업로드에 실패했습니다.")
    }

    if (mode === "edit" && memberId) {
      const patchResponse = await apiFetch
        .patch(`/api/admin/pastoral-council/${memberId}`)
        .json({ imageUrl: json.url })
        .send()
      const patchJson = (await patchResponse.json().catch(() => null)) as {
        ok?: boolean
        message?: string
      } | null
      if (!patchResponse.ok || !patchJson?.ok) {
        throw new Error(patchJson?.message ?? "이미지 변경에 실패했습니다.")
      }
      if (previousUrl && previousUrl !== json.url) {
        await removeClergyImage(previousUrl)
      }
    }

    return json.url
  }

  if (mode === "edit" && !resolvedInitialValues) {
    if (detailQuery.isLoading) {
      return <div className="h-[420px] rounded-md border bg-muted" />
    }
    return (
      <p className="text-sm text-destructive">
        수정 데이터를 불러오지 못했습니다.
      </p>
    )
  }

  return (
    <PastoralCouncilFormView
      initialValues={resolvedInitialValues}
      positions={positionsQuery.data ?? []}
      isPositionLoading={positionsQuery.isLoading}
      onSubmitAction={handleSubmit}
      onUploadImageAction={uploadClergyImage}
      onRemoveImageAction={removeClergyImage}
      submitLabel={mode === "create" ? "저장" : "수정 저장"}
      isLoading={isLoading}
      message={message}
    />
  )
}
