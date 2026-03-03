import type { NoticePublishFilterDto } from "@/features/notices/isomorphic"

// notices React Query key 집합이다.
export const noticeQueryKeys = {
  all: ["admin", "notices"] as const,
  list: (filters: { query: string; status: NoticePublishFilterDto }) =>
    [...noticeQueryKeys.all, "list", filters] as const,
} as const
