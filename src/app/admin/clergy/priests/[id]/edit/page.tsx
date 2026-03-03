import Link from "next/link"
import { notFound } from "next/navigation"
import { PriestFormContainer } from "@/features/clergy-priests/client"
import type {
  PriestDetailDto,
  UpsertPriestInputDto,
} from "@/features/clergy-priests/isomorphic"
import { serverApiFetch } from "@/lib/api-server"

type PriestDetailResponseDto = {
  ok?: boolean
  item?: PriestDetailDto
}

function toInput(item: PriestDetailDto): UpsertPriestInputDto {
  // 상세 DTO를 수정 폼 기본값으로 변환한다.
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

export default async function AdminPriestEditPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  // 수정 페이지 진입 시 신부님 단건 데이터를 조회한다.
  const response = await serverApiFetch
    .get(`/api/admin/clergy/priests/${id}`)
    .send()

  if (response.status === 404) {
    notFound()
  }

  const json = (await response
    .json()
    .catch(() => null)) as PriestDetailResponseDto | null

  if (!response.ok || !json?.ok || !json.item) {
    notFound()
  }

  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">신부님 수정</h1>
          <p className="text-sm text-neutral-600">
            신부님 소개 정보를 수정합니다.
          </p>
        </div>
        <Link
          href={`/admin/clergy/priests/${id}`}
          className="inline-flex rounded-md border px-3 py-2 text-sm hover:bg-neutral-50"
        >
          상세로 돌아가기
        </Link>
      </section>

      <section className="rounded-lg border p-4">
        <PriestFormContainer
          mode="edit"
          priestId={id}
          initialValues={toInput(json.item)}
        />
      </section>
    </main>
  )
}
