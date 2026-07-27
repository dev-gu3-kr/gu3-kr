import { useMutation, useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"

import type { AdminSessionDto, LoginInput } from "./auth.types"

export const adminSessionQueryKey = ["admin", "session"] as const

export function useAdminSession() {
  return useQuery({
    queryKey: adminSessionQueryKey,
    queryFn: async () => {
      const response = await apiFetch
        .get("/api/admin/session")
        .init({ cache: "no-store" })
        .send()
      const payload = (await response.json().catch(() => null)) as
        | ({ ok?: boolean; message?: string } & Partial<AdminSessionDto>)
        | null

      if (
        !response.ok ||
        !payload?.ok ||
        !payload.role ||
        !payload.displayName ||
        !Array.isArray(payload.menuPermissions)
      ) {
        throw new Error(
          payload?.message ?? "관리자 세션을 확인하지 못했습니다.",
        )
      }

      return {
        role: payload.role,
        displayName: payload.displayName,
        menuPermissions: payload.menuPermissions,
      } satisfies AdminSessionDto
    },
    staleTime: 30_000,
  })
}

export function useLoginForm() {
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      // 로그인 API를 호출해 관리자 인증을 수행한다.
      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "fetch",
        },
        body: JSON.stringify(input),
      })

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean
        message?: string
      } | null

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.message ?? "로그인에 실패했습니다.")
      }

      return payload
    },
  })
}
