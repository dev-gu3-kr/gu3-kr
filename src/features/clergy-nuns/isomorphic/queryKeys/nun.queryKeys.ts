export const nunQueryKeys = {
  all: ["admin", "clergy", "nuns"] as const,
  lists: () => [...nunQueryKeys.all, "list"] as const,
}
