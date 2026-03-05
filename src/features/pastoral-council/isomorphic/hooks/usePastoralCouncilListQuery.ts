import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import { pastoralCouncilQueryKeys } from "../queryKeys"
import type { PastoralCouncilListItemDto } from "../types"

type ListResponse = { ok?: boolean; items?: PastoralCouncilListItemDto[] }

async function fetchPastoralCouncil() {
  const response = await apiFetch
    .get("/api/admin/pastoral-council")
    .query({ take: 30 })
    .send()
  if (!response.ok) throw new Error("사목협의회 목록을 불러오지 못했습니다.")

  const json = (await response.json().catch(() => null)) as ListResponse | null
  return json?.ok && Array.isArray(json.items) ? json.items : []
}

export function usePastoralCouncilListQuery() {
  return useQuery({
    queryKey: pastoralCouncilQueryKeys.lists(),
    queryFn: fetchPastoralCouncil,
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}
