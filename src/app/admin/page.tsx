import { AdminDashboardContainer } from "@/features/admin/client"

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      {/* 관리자 메인 대시보드 진입 지점 */}
      <AdminDashboardContainer />
    </main>
  )
}
