import { BriefcaseBusiness, Phone } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { PastoralCouncilListItemDto } from "@/features/pastoral-council/isomorphic"
import { serverApiFetch } from "@/lib/api-server"

type ListResponse = { ok?: boolean; items?: PastoralCouncilListItemDto[] }

export default async function AdminPastoralCouncilPage() {
  const response = await serverApiFetch
    .get("/api/admin/pastoral-council")
    .query({ take: 30 })
    .send()
  const json = (await response.json().catch(() => null)) as ListResponse | null
  const items = json?.ok && Array.isArray(json.items) ? json.items : []

  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">사목협의회 관리</h1>
          <p className="text-sm text-neutral-600">
            사목협의회 위원 정보를 확인하고 등록/수정합니다.
          </p>
        </div>
        <Link
          href="/admin/pastoral-council/new"
          className="inline-flex min-w-[92px] items-center justify-center whitespace-nowrap rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
        >
          + 등록
        </Link>
      </section>

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="rounded-md border p-4 text-sm text-neutral-500">
            등록된 사목협의회 위원 정보가 없습니다.
          </div>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={`/admin/pastoral-council/${item.id}`}
              className="grid grid-cols-[104px_1fr] gap-4 rounded-md border p-3 hover:bg-neutral-50"
            >
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={`${item.name} 사진`}
                  unoptimized
                  width={104}
                  height={128}
                  className="h-[128px] w-[104px] rounded-md border object-cover"
                />
              ) : (
                <div className="flex h-[128px] w-[104px] items-center justify-center rounded-md border bg-neutral-100 text-xs text-neutral-500">
                  사진
                </div>
              )}
              <div className="space-y-2">
                <p className="text-base font-medium leading-tight">
                  {item.name}
                  {item.baptismalName ? ` · ${item.baptismalName}` : ""}
                </p>
                <div className="space-y-1.5 text-sm text-neutral-700">
                  <p className="flex items-center gap-1.5">
                    <BriefcaseBusiness className="h-4 w-4 text-primary" />
                    <span>
                      <span className="text-neutral-500">담당영역:</span>{" "}
                      {item.duty}
                    </span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>
                      <span className="text-neutral-500">연락처:</span>{" "}
                      {item.phone}
                    </span>
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  )
}
