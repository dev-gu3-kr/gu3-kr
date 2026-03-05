export const priestQueryKeys = {
  all: ["admin", "clergy", "priests"] as const,
  lists: () => [...priestQueryKeys.all, "list"] as const,
}
