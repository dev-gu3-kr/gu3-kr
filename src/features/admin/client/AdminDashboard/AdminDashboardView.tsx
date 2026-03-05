import { AppLink as Link } from "@/components/AppLink"
import type { AdminMenuItem } from "@/features/admin/isomorphic"

type AdminDashboardViewProps = {
  // 대시보드 카드로 렌더링할 메뉴 목록
  menuItems: AdminMenuItem[]
}

export function AdminDashboardView({ menuItems }: AdminDashboardViewProps) {
  return (
    <section className="space-y-4">
      {/* 관리자 첫 진입 시 목적을 안내하는 헤더 */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">관리자 대시보드</h1>
        <p className="text-sm text-neutral-600">
          운영 메뉴를 선택해 콘텐츠를 관리하세요.
        </p>
      </header>

      {/* 메뉴별 진입점을 카드 그리드로 제공 */}
      <div className="grid gap-3 sm:grid-cols-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border p-4 transition hover:bg-neutral-50"
          >
            <h2 className="font-medium">{item.label}</h2>
            <p className="mt-1 text-sm text-neutral-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
