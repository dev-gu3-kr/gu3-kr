import { useMutation } from "@tanstack/react-query"

export function useLoginForm() {
  return useMutation({
    mutationFn: async (_input: { email: string; password: string }) => {
      // TODO: login API 연결
      return { ok: true }
    },
  })
}
