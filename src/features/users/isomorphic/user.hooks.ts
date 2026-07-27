import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type {
  AdminUserListItemDto,
  CreateAdminUserInputDto,
  UpdateAdminUserInputDto,
} from "./user.types"

export const adminUsersQueryKey = ["admin", "users"] as const

async function readApiResult(response: Response, fallbackMessage: string) {
  const payload = (await response.json().catch(() => null)) as {
    ok?: boolean
    message?: string
  } | null

  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.message ?? fallbackMessage)
  }

  return payload
}

export function useAdminUsers() {
  return useQuery({
    queryKey: adminUsersQueryKey,
    queryFn: async () => {
      const response = await apiFetch.get("/api/admin/users").send()
      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean
        items?: AdminUserListItemDto[]
        message?: string
      } | null

      if (!response.ok || !payload?.ok || !Array.isArray(payload.items)) {
        throw new Error(
          payload?.message ?? "사용자 목록을 불러오지 못했습니다.",
        )
      }

      return payload.items
    },
  })
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateAdminUserInputDto) => {
      const response = await apiFetch
        .post("/api/admin/users")
        .json(input)
        .send()
      return readApiResult(response, "사용자 등록에 실패했습니다.")
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminUsersQueryKey })
    },
  })
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: UpdateAdminUserInputDto
    }) => {
      const response = await apiFetch
        .patch(`/api/admin/users/${id}`)
        .json(input)
        .send()
      return readApiResult(response, "사용자 수정에 실패했습니다.")
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminUsersQueryKey })
    },
  })
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiFetch.del(`/api/admin/users/${id}`).send()
      return readApiResult(response, "사용자 삭제에 실패했습니다.")
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminUsersQueryKey })
    },
  })
}
