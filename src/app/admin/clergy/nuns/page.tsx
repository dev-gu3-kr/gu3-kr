import Link from "next/link"
import type { NunListItemDto } from "@/features/clergy-nuns/isomorphic"
import { serverApiFetch } from "@/lib/api-server"

type NunListResponseDto = {
  ok?: boolean
  items?: NunListItemDto[]
}

export default async function AdminNunsPage() {
  const response = await serverApiFetch
    .get("/api/admin/clergy/nuns")
    .query({ take: 30 })
    .send()
  const json = (await response
    .json()
    .catch(() => null)) as NunListResponseDto | null
  const items = json?.ok && Array.isArray(json.items) ? json.items : []

  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">수녀님 소개 관리</h1>
          <p className="text-sm text-neutral-600">
            수녀님 소개 목록을 확인하고 등록/수정합니다.
          </p>
        </div>
        <Link
          href="/admin/clergy/nuns/new"
          className="inline-flex min-w-[92px] items-center justify-center whitespace-nowrap rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
        >
          + 등록
        </Link>
      </section>

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="rounded-md border p-4 text-sm text-neutral-500">
            등록된 수녀님 프로필이 없습니다.
          </div>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={`/admin/clergy/nuns/${item.id}`}
              className="grid grid-cols-[80px_1fr] gap-3 rounded-md border p-3 hover:bg-neutral-50"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-md border bg-neutral-100 text-xs text-neutral-500">
                {item.imageUrl ? "이미지" : "사진"}
              </div>
              <div className="space-y-1">
                <p className="font-medium">
                  이름(세례명): {item.name}
                  {item.baptismalName ? `(${item.baptismalName})` : ""}
                </p>
                <p className="text-sm text-neutral-600">
                  담당 영역: {item.duty}
                </p>
                <p className="text-sm text-neutral-600">
                  축일: {item.feastMonth ?? "-"}월 {item.feastDay ?? "-"}일
                </p>
                <p className="text-xs text-neutral-500">
                  재임 기간:{" "}
                  {item.termStart ? item.termStart.slice(0, 10) : "-"} ~{" "}
                  {item.termEnd ? item.termEnd.slice(0, 10) : "현재"}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  )
}
