import { LoginFormContainer } from "@/features/auth/client"

export default function AdminLoginPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-semibold">관리자 로그인</h1>
      <LoginFormContainer />
    </main>
  )
}
