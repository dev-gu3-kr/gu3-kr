import { useMutation } from "@tanstack/react-query"

import type { LoginInput } from "./auth.types"

export function useLoginForm() {
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      // 로그인 API를 호출해 관리자 인증을 수행한다.
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
