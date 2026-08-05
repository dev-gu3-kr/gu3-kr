import { PastoralCouncilAdminTabs } from "@/features/pastoral-council/client"

export default function AdminPastoralCouncilPage() {
  return (
    <main className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-semibold">사목협의회 관리</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          직책 구조와 구성원 배정을 관리하고 공개 화면을 확인합니다.
        </p>
      </section>

      <PastoralCouncilAdminTabs />
    </main>
  )
}
