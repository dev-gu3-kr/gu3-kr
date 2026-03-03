"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useLoginForm } from "@/features/auth/isomorphic"
import { LoginFormView } from "./LoginFormView"

export function LoginFormContainer() {
  // 로그인 실패 메시지를 보관한다.
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  // 로그인 성공 후 관리자 페이지 이동에 사용한다.
  const router = useRouter()
  // 로그인 API 호출 뮤테이션이다.
  const loginMutation = useLoginForm()

  const handleSubmit = async (formData: FormData) => {
    // 폼에서 이메일/비밀번호를 추출한다.
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")

    setErrorMessage(null)

    try {
      // 관리자 로그인 요청을 수행한다.
      await loginMutation.mutateAsync({ email, password })
      // 성공 시 관리자 메인으로 이동한다.
      router.push("/admin")
      router.refresh()
    } catch (error) {
      // 실패 시 사용자에게 에러 메시지를 노출한다.
      setErrorMessage(
        error instanceof Error ? error.message : "로그인에 실패했습니다.",
      )
    }
  }

  return (
    <LoginFormView
      onSubmit={handleSubmit}
      isLoading={loginMutation.isPending}
      errorMessage={errorMessage}
    />
  )
}
