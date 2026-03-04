import { BadgeCheck, BriefcaseBusiness, Phone } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PastoralCouncilDeleteButton } from "@/features/pastoral-council/client"
import type { PastoralCouncilDetailDto } from "@/features/pastoral-council/isomorphic"
import { serverApiFetch } from "@/lib/api-server"

type DetailResponse = { ok?: boolean; item?: PastoralCouncilDetailDto }

export default async function AdminPastoralCouncilViewPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const response = await serverApiFetch
    .get(`/api/admin/pastoral-council/${id}`)
    .send()
  if (response.status === 404) notFound()

  const json = (await response
    .json()
    .catch(() => null)) as DetailResponse | null
  if (!response.ok || !json?.ok || !json.item) notFound()

  const item = json.item
  const displayName = item.baptismalName
    ? `${item.name} · ${item.baptismalName}`
    : item.name

  return (
    <main className="space-y-6">
      <section className="space-y-6 rounded-xl bg-white p-5">
        <Link
          href="/admin/pastoral-council"
          className="text-sm text-neutral-500 hover:text-neutral-800"
        >
          ← 목록으로
        </Link>

        <div className="mx-auto mt-2 flex w-full max-w-3xl flex-col items-center gap-5 sm:mt-0">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={`${item.name} 프로필`}
              width={260}
              height={320}
              unoptimized
              className="h-[320px] w-[260px] rounded-xl object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-[320px] w-[260px] items-center justify-center rounded-xl bg-neutral-100 text-sm text-neutral-400">
              이미지 없음
            </div>
          )}

          <h1 className="text-center text-3xl font-normal">{displayName}</h1>

          <div className="w-full max-w-xl">
            <div className="mx-auto grid w-fit gap-y-4">
              <div className="grid grid-cols-[24px_88px_1fr] items-center gap-x-3">
                <BriefcaseBusiness className="h-5 w-5 text-primary" />
                <p className="text-sm text-neutral-500">담당영역</p>
                <p className="text-lg font-normal text-neutral-900">
                  {item.duty}
                </p>
              </div>
              <div className="grid grid-cols-[24px_88px_1fr] items-center gap-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <p className="text-sm text-neutral-500">연락처</p>
                <p className="text-lg font-normal text-neutral-900">
                  {item.phone}
                </p>
              </div>
              <div className="grid grid-cols-[24px_88px_1fr] items-center gap-x-3">
                <BadgeCheck className="h-5 w-5 text-primary" />
                <p className="text-sm text-neutral-500">상태</p>
                <p className="text-lg font-normal text-neutral-900">
                  {item.isActive ? "활성" : "비활성"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2 pt-2">
            <Link
              href={`/admin/pastoral-council/${item.id}/edit`}
              className="rounded-md border px-3 py-2 text-sm hover:bg-neutral-50"
            >
              수정
            </Link>
            <PastoralCouncilDeleteButton memberId={item.id} />
          </div>
        </div>
      </section>
    </main>
  )
}
