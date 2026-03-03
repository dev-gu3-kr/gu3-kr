import Link from "next/link"
import { notFound } from "next/navigation"
import { NunDeleteButton } from "@/features/clergy-nuns/client"
import type { NunDetailDto } from "@/features/clergy-nuns/isomorphic"
import { serverApiFetch } from "@/lib/api-server"

type NunDetailResponseDto = {
  ok?: boolean
  item?: NunDetailDto
}

export default async function AdminNunViewPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const response = await serverApiFetch
    .get(`/api/admin/clergy/nuns/${id}`)
    .send()
  if (response.status === 404) notFound()

  const json = (await response
    .json()
    .catch(() => null)) as NunDetailResponseDto | null
  if (!response.ok || !json?.ok || !json.item) notFound()

  const item = json.item

  return (
    <main className="space-y-6">
      <section className="space-y-3 rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between">
          <Link
            href="/admin/clergy/nuns"
            className="text-sm text-neutral-500 hover:text-neutral-800"
          >
            ← 목록으로
          </Link>
        </div>

        <h1 className="text-3xl font-semibold">
          {item.name}
          {item.baptismalName ? ` (${item.baptismalName})` : ""}
        </h1>
        <p className="text-sm text-neutral-600">담당영역: {item.duty}</p>
        <p className="text-sm text-neutral-600">
          축일: {item.feastMonth ?? "-"}월 {item.feastDay ?? "-"}일
        </p>
        <p className="text-sm text-neutral-600">
          재임기간: {item.termStart ? item.termStart.slice(0, 10) : "-"} ~{" "}
          {item.termEnd ? item.termEnd.slice(0, 10) : "현재"}
        </p>
        <p className="text-sm text-neutral-600">연락처: {item.phone ?? "-"}</p>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Link
            href={`/admin/clergy/nuns/${item.id}/edit`}
            className="rounded-md border px-3 py-2 text-sm hover:bg-neutral-50"
          >
            수정
          </Link>
          <NunDeleteButton nunId={item.id} />
        </div>
      </section>
    </main>
  )
}
