export const homeQueryKeys = {
  all: ["public", "home"] as const,
  page: () => [...homeQueryKeys.all, "page"] as const,
} as const
