import { UserManagerContainer } from "@/features/users/client"

export default function AdminUsersPage() {
  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">사용자 등록 관리</h1>
        <p className="text-sm text-neutral-600">
          관리자 계정을 생성하고 비밀번호를 초기화합니다.
        </p>
      </section>

      <UserManagerContainer />
    </main>
  )
}
