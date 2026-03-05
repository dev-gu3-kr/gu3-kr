export const pastoralCouncilQueryKeys = {
  all: ["admin", "pastoral-council"] as const,
  lists: () => [...pastoralCouncilQueryKeys.all, "list"] as const,
}
