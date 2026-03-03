type Props = {
  // 로그인 폼 제출 핸들러
  onSubmit: (formData: FormData) => void
  // 로그인 요청 중 버튼 비활성화 제어
  isLoading?: boolean
  // 로그인 실패 시 노출할 에러 메시지
  errorMessage?: string | null
}

export function LoginFormView({
  onSubmit,
  isLoading = false,
  errorMessage = null,
}: Props) {
  return (
    <form
      action={(formData) => {
        onSubmit(formData)
      }}
      className="space-y-3"
    >
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm">
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      {/* 로그인 실패 메시지 노출 영역 */}
      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
      >
        {isLoading ? "로그인 중..." : "로그인"}
      </button>
    </form>
  )
}
