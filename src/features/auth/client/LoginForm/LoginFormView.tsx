import type { FormEventHandler } from "react"
import type { FieldErrors, UseFormRegister } from "react-hook-form"
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
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm">
          이메일 <span className="text-red-600">*</span>
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={`w-full rounded-md border px-3 py-2 ${
            errors.email ? "border-red-600 outline-red-600" : ""
          }`}
          {...register("email")}
        />
        {errors.email ? (
          <p id="email-error" className="text-sm text-red-600">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm">
          비밀번호 <span className="text-red-600">*</span>
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
          className={`w-full rounded-md border px-3 py-2 ${
            errors.password ? "border-red-600 outline-red-600" : ""
          }`}
          {...register("password")}
        />
        {errors.password ? (
          <p id="password-error" className="text-sm text-red-600">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      {errorMessage ? (
        <p role="alert" className="text-sm text-red-600">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
      >
        {isLoading ? "로그인 중..." : "로그인"}
      </button>
    </form>
  )
}
