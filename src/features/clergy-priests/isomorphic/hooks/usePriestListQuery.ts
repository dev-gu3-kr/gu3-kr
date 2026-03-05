import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import { priestQueryKeys } from "../queryKeys"
import type { PriestListItemDto } from "../types"

type PriestListResponseDto = { ok?: boolean; items?: PriestListItemDto[] }

async function fetchPriests() {
  const response = await apiFetch
    .get("/api/admin/clergy/priests")
    .query({ take: 30 })
    .send()
  if (!response.ok) throw new Error("신부님 목록을 불러오지 못했습니다.")

  const json = (await response
    .json()
    .catch(() => null)) as PriestListResponseDto | null
  return json?.ok && Array.isArray(json.items) ? json.items : []
}

export function usePriestListQuery() {
  return useQuery({
    queryKey: priestQueryKeys.lists(),
    queryFn: fetchPriests,
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}
