type Props = {
  onSubmit: (formData: FormData) => void
  isLoading?: boolean
}

export function LoginFormView({ onSubmit, isLoading = false }: Props) {
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
