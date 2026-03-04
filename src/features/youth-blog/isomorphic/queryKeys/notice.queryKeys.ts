import type { NoticePublishFilterDto } from "@/features/youth-blog/isomorphic"

// notices React Query key 집합이다.
export const youthBlogQueryKeys = {
  all: ["admin", "youth-blog"] as const,
  list: (filters: { query: string; status: NoticePublishFilterDto }) =>
    [...youthBlogQueryKeys.all, "list", filters] as const,
} as const
