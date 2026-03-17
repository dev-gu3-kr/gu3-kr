"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import {
  getAvailablePastoralCouncilRoles,
  type PastoralCouncilDetailDto,
  type PastoralCouncilListItemDto,
  pastoralCouncilQueryKeys,
  pastoralCouncilRoleSortOrder,
  publicPastoralCouncilQueryKeys,
  type UpsertPastoralCouncilInputDto,
  usePastoralCouncilDetailQuery,
  usePastoralCouncilListQuery,
} from "@/features/pastoral-council/isomorphic"
import { apiFetch } from "@/lib/api"
import { PastoralCouncilFormView } from "./PastoralCouncilFormView"

function normalizeNumber(input?: number) {
  if (typeof input !== "number" || Number.isNaN(input)) return undefined
  return input
}

function normalizeNullableString(input?: string) {
  const normalized = input?.trim()
  return normalized ? normalized : null
}

function normalizeInput(
  values: UpsertPastoralCouncilInputDto,
): UpsertPastoralCouncilInputDto {
  return {
    ...values,
    baptismalName: values.baptismalName?.trim() || undefined,
    phone: values.phone?.trim() || undefined,
    imageUrl: values.imageUrl?.trim() || undefined,
    sortOrder: normalizeNumber(values.sortOrder),
  }
}

function sortPastoralCouncilItems(items: PastoralCouncilListItemDto[]) {
  return [...items].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder)
      return left.sortOrder - right.sortOrder
    return right.createdAt.localeCompare(left.createdAt)
  })
}

function upsertPastoralCouncilListItem(
  previous: PastoralCouncilListItemDto[] | undefined,
  nextItem: PastoralCouncilListItemDto,
) {
  const nextItems = previous?.filter((item) => item.id !== nextItem.id) ?? []
  nextItems.push(nextItem)
  return sortPastoralCouncilItems(nextItems)
}

function upsertPublicPastoralCouncilListItem(
  previous: PastoralCouncilListItemDto[] | undefined,
  nextItem: PastoralCouncilListItemDto,
) {
  const nextItems = previous?.filter((item) => item.id !== nextItem.id) ?? []
  if (nextItem.isActive) nextItems.push(nextItem)
  return sortPastoralCouncilItems(nextItems)
}

function createCachedPastoralCouncilItem(params: {
  id: string
  createdAt: string
  values: UpsertPastoralCouncilInputDto
}): PastoralCouncilDetailDto {
  const { id, createdAt, values } = params

  return {
    id,
    role: values.role,
    name: values.name.trim(),
    baptismalName: normalizeNullableString(values.baptismalName),
    phone: normalizeNullableString(values.phone),
    imageUrl: normalizeNullableString(values.imageUrl),
    sortOrder: values.sortOrder ?? pastoralCouncilRoleSortOrder[values.role],
    isActive: values.isActive ?? true,
    createdAt,
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
  const queryClient = useQueryClient()

  const listQuery = usePastoralCouncilListQuery()
  const detailQuery = usePastoralCouncilDetailQuery(memberId ?? "")

  const resolvedInitialValues =
    mode === "edit"
      ? (initialValues ??
        (detailQuery.data
          ? {
              role: detailQuery.data.role,
              name: detailQuery.data.name,
              baptismalName: detailQuery.data.baptismalName ?? undefined,
              phone: detailQuery.data.phone ?? undefined,
              imageUrl: detailQuery.data.imageUrl ?? undefined,
              isActive: detailQuery.data.isActive,
              sortOrder: detailQuery.data.sortOrder,
            }
          : undefined))
      : initialValues

  const roleOptions = listQuery.data
    ? getAvailablePastoralCouncilRoles({
        usedRoles: listQuery.data.map((item) => item.role),
        currentRole: resolvedInitialValues?.role,
      })
    : resolvedInitialValues?.role
      ? [resolvedInitialValues.role]
      : []
  const isRoleOptionsLoading = listQuery.isLoading && !listQuery.data
  const isRoleSelectionDisabled =
    isLoading || isRoleOptionsLoading || roleOptions.length === 0
  const roleHelperMessage = isRoleOptionsLoading
    ? "직책 목록을 불러오는 중입니다."
    : roleOptions.length === 0
      ? "모든 직책이 이미 등록되어 있습니다. 기존 위원을 수정하거나 삭제한 뒤 다시 시도해 주세요."
      : null

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

        const createdItem = createCachedPastoralCouncilItem({
          id: json.id,
          createdAt: new Date().toISOString(),
          values: normalizedValues,
        })

        queryClient.setQueryData(
          pastoralCouncilQueryKeys.detail(json.id),
          createdItem,
        )
        queryClient.setQueryData<PastoralCouncilListItemDto[]>(
          pastoralCouncilQueryKeys.lists(),
          (previous) => upsertPastoralCouncilListItem(previous, createdItem),
        )
        queryClient.setQueryData<PastoralCouncilListItemDto[]>(
          publicPastoralCouncilQueryKeys.lists(),
          (previous) =>
            upsertPublicPastoralCouncilListItem(previous, createdItem),
        )

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: pastoralCouncilQueryKeys.lists(),
          }),
          queryClient.invalidateQueries({
            queryKey: pastoralCouncilQueryKeys.detail(json.id),
          }),
          queryClient.invalidateQueries({
            queryKey: publicPastoralCouncilQueryKeys.lists(),
          }),
        ])

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

      const existingItem =
        detailQuery.data ??
        listQuery.data?.find((item) => item.id === memberId) ??
        null
      const updatedItem = createCachedPastoralCouncilItem({
        id: memberId ?? "",
        createdAt: existingItem?.createdAt ?? new Date().toISOString(),
        values: normalizedValues,
      })

      queryClient.setQueryData(
        pastoralCouncilQueryKeys.detail(memberId ?? ""),
        updatedItem,
      )
      queryClient.setQueryData<PastoralCouncilListItemDto[]>(
        pastoralCouncilQueryKeys.lists(),
        (previous) => upsertPastoralCouncilListItem(previous, updatedItem),
      )
      queryClient.setQueryData<PastoralCouncilListItemDto[]>(
        publicPastoralCouncilQueryKeys.lists(),
        (previous) =>
          upsertPublicPastoralCouncilListItem(previous, updatedItem),
      )

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: pastoralCouncilQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: pastoralCouncilQueryKeys.detail(memberId ?? ""),
        }),
        queryClient.invalidateQueries({
          queryKey: publicPastoralCouncilQueryKeys.lists(),
        }),
      ])

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
      roleOptions={roleOptions}
      roleHelperMessage={roleHelperMessage}
      isRoleSelectionDisabled={isRoleSelectionDisabled}
      onSubmitAction={handleSubmit}
      onUploadImageAction={uploadClergyImage}
      onRemoveImageAction={removeClergyImage}
      submitLabel={mode === "create" ? "저장" : "수정 저장"}
      isLoading={isLoading}
      isSubmitDisabled={isRoleSelectionDisabled}
      message={message}
      isError={isError}
    />
  )
}
