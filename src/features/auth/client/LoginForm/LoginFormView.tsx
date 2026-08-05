import type { FormEventHandler } from "react"
import type { FieldErrors, UseFormRegister } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { LoginInput } from "@/features/auth/isomorphic"

type Props = {
  onSubmit: FormEventHandler<HTMLFormElement>
  register: UseFormRegister<LoginInput>
  errors: FieldErrors<LoginInput>
  isLoading?: boolean
  errorMessage?: string | null
}

export function LoginFormView({
  onSubmit,
  register,
  errors,
  isLoading = false,
  errorMessage = null,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <FieldGroup className="gap-4">
        <Field data-invalid={Boolean(errors.username)}>
          <FieldLabel htmlFor="username">
            아이디 <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={Boolean(errors.username)}
            {...register("username")}
          />
          <FieldError>{errors.username?.message}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="password">
            비밀번호 <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          <FieldError>{errors.password?.message}</FieldError>
        </Field>
      </FieldGroup>

      {errorMessage ? (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "로그인 중..." : "로그인"}
      </Button>
    </form>
  )
}
