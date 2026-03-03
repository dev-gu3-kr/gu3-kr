import Link from "next/link"
import { notFound } from "next/navigation"
import { NunFormContainer } from "@/features/clergy-nuns/client"
import type {
  NunDetailDto,
  UpsertNunInputDto,
} from "@/features/clergy-nuns/isomorphic"
import { serverApiFetch } from "@/lib/api-server"

type NunDetailResponseDto = {
  ok?: boolean
  item?: NunDetailDto
}

function toInput(item: NunDetailDto): UpsertNunInputDto {
  return {
    name: item.name,
    baptismalName: item.baptismalName ?? undefined,
    duty: item.duty,
    feastMonth: item.feastMonth ?? undefined,
    feastDay: item.feastDay ?? undefined,
    termStart: item.termStart ?? undefined,
    termEnd: item.termEnd ?? undefined,
    phone: item.phone ?? undefined,
    imageUrl: item.imageUrl ?? undefined,
    isCurrent: item.isCurrent,
    sortOrder: item.sortOrder,
  }
}

export default async function AdminNunEditPage(props: {
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

  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">수녀님 수정</h1>
          <p className="text-sm text-neutral-600">
            수녀님 소개 정보를 수정합니다.
          </p>
        </div>
        <Link
          href={`/admin/clergy/nuns/${id}`}
          className="inline-flex rounded-md border px-3 py-2 text-sm hover:bg-neutral-50"
        >
          상세로 돌아가기
        </Link>
      </section>

      <section className="rounded-lg border p-4">
        <NunFormContainer
          mode="edit"
          nunId={id}
          initialValues={toInput(json.item)}
        />
      </section>
    </main>
  )
}
