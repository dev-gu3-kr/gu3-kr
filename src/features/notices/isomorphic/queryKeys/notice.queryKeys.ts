// notices React Query key 집합이다.
export const noticeQueryKeys = {
  all: ["admin", "notices"] as const,
  list: () => [...noticeQueryKeys.all, "list"] as const,
} as const
