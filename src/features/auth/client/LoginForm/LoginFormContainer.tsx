"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  type LoginInput,
  loginSchema,
  useLoginForm,
} from "@/features/auth/isomorphic"
import { LoginFormView } from "./LoginFormView"

export function LoginFormContainer() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const loginMutation = useLoginForm()
  const form = useForm<LoginInput>({
    resolver: standardSchemaResolver(loginSchema),
    mode: "onSubmit",
    defaultValues: { email: "", password: "" },
  })

  const handleSubmit = async (input: LoginInput) => {
    setErrorMessage(null)

    try {
      await loginMutation.mutateAsync(input)
      toast.success("로그인되었습니다.")
      router.push("/admin")
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "로그인에 실패했습니다."
      setErrorMessage(message)
      toast.error(message)
    }
  }

  return (
    <LoginFormView
      onSubmit={form.handleSubmit(handleSubmit)}
      register={form.register}
      errors={form.formState.errors}
      isLoading={loginMutation.isPending}
      errorMessage={errorMessage}
    />
  )
}
