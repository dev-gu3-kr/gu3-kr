import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type { NunListItemDto } from "./nun.types"

export const nunQueryKeys = {
  all: ["admin", "clergy", "nuns"] as const,
  lists: () => [...nunQueryKeys.all, "list"] as const,
}

type NunListResponseDto = { ok?: boolean; items?: NunListItemDto[] }

async function fetchNuns() {
  const response = await apiFetch
    .get("/api/admin/clergy/nuns")
    .query({ take: 30 })
    .send()
  if (!response.ok) throw new Error("수녀님 목록을 불러오지 못했습니다.")
  const json = (await response
    .json()
    .catch(() => null)) as NunListResponseDto | null
  return json?.ok && Array.isArray(json.items) ? json.items : []
}

export function useNunListQuery() {
  return useQuery({
    queryKey: nunQueryKeys.lists(),
    queryFn: fetchNuns,
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}
