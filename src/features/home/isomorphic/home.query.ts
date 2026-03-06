export const homeQueryKeys = {
  all: ["public", "home"] as const,
  page: (monthKey: string) => [...homeQueryKeys.all, "page", monthKey] as const,
} as const
