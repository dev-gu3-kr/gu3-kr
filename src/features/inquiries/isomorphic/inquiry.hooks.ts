"use client"

import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api"

import type {
  ApiResponseDto,
  InquiryDetailDto,
  InquiryPageDto,
  InquiryStatusDto,
  InquiryStatusFilterDto,
} from "./inquiry.types"

const inquiryQueryKeys = {
  all: ["admin", "inquiries"] as const,
  list: (filters: { query: string; status: InquiryStatusFilterDto }) =>
    [...inquiryQueryKeys.all, "list", filters] as const,
  detail: (id: string) => [...inquiryQueryKeys.all, "detail", id] as const,
} as const

type InquiryPageResponse = ApiResponseDto<InquiryPageDto>
type InquiryPageInfiniteData = InfiniteData<InquiryPageResponse>

type InquiryListFilters = {
  query: string
  status: InquiryStatusFilterDto
}

async function fetchInquiryPage(params: {
  cursor?: string | null
  filters: InquiryListFilters
}): Promise<InquiryPageResponse> {
  const response = await apiFetch
    .get("/api/admin/inquiries")
    .query({
      take: 10,
      cursor: params.cursor,
      status: params.filters.status,
      q: params.filters.query.trim() || undefined,
    })
    .send()

  if (!response.ok) throw new Error("문의 목록을 불러오지 못했습니다.")

  const json = (await response.json()) as Partial<InquiryPageResponse>

  return {
    ok: Boolean(json.ok),
    items: Array.isArray(json.items) ? json.items : [],
    nextCursor: json.nextCursor ?? null,
  }
}

export function useInquiryListInfinite(params: {
  filters: InquiryListFilters
}) {
  return useInfiniteQuery({
    queryKey: inquiryQueryKeys.list(params.filters),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      fetchInquiryPage({ cursor: pageParam, filters: params.filters }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    placeholderData: (previousData) => previousData,
  })
}

async function fetchInquiryDetail(id: string) {
  const response = await apiFetch.get(`/api/admin/inquiries/${id}`).send()

  if (!response.ok) throw new Error("문의 상세를 불러오지 못했습니다.")

  const json = (await response.json().catch(() => null)) as ApiResponseDto<{
    item: InquiryDetailDto
  }> | null

  if (!json?.ok || !json.item) {
    throw new Error("문의 상세를 불러오지 못했습니다.")
  }

  return json.item
}

async function patchInquiryStatus(id: string, status: InquiryStatusDto) {
  const response = await apiFetch
    .patch(`/api/admin/inquiries/${id}`)
    .json({ status })
    .send()

  const json = (await response.json().catch(() => null)) as ApiResponseDto<{
    item: InquiryDetailDto
  }> | null

  if (!response.ok || !json?.ok || !json.item) {
    throw new Error(json?.message ?? "문의 상태 업데이트에 실패했습니다.")
  }

  return json.item
}

export function useInquiryDetailQuery(id: string) {
  return useQuery({
    queryKey: inquiryQueryKeys.detail(id),
    enabled: id.length > 0,
    queryFn: () => fetchInquiryDetail(id),
  })
}

export function useInquiryStatusMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (status: InquiryStatusDto) => patchInquiryStatus(id, status),
    onMutate: async (nextStatus) => {
      await queryClient.cancelQueries({ queryKey: inquiryQueryKeys.detail(id) })

      const previousInquiry = queryClient.getQueryData<InquiryDetailDto>(
        inquiryQueryKeys.detail(id),
      )

      if (previousInquiry) {
        queryClient.setQueryData<InquiryDetailDto>(inquiryQueryKeys.detail(id), {
          ...previousInquiry,
          status: nextStatus,
          processedAt: nextStatus === "DONE" ? new Date().toISOString() : null,
          processedById: null,
        })
      }

      return { previousInquiry }
    },
    onError: (_error, _nextStatus, context) => {
      if (context?.previousInquiry) {
        queryClient.setQueryData(
          inquiryQueryKeys.detail(id),
          context.previousInquiry,
        )
      }
    },
    onSuccess: (updatedInquiry) => {
      queryClient.setQueryData(inquiryQueryKeys.detail(id), updatedInquiry)
      queryClient.invalidateQueries({
        queryKey: [...inquiryQueryKeys.all, "list"],
      })
    },
  })
}
