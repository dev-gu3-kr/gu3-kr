// 신부 수정 페이지: 상세 돌아가기 + 폼 컨테이너
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

// 상세 DTO를 폼 초기값 DTO로 변환한다.
function toInput(item: PriestDetailDto): UpsertPriestInputDto {
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

// 신부님 상세를 조회해 수정 폼 초기값으로 주입한다.
export default async function AdminPriestEditPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  const response = await serverApiFetch
    .get(`/api/admin/clergy/priests/${id}`)
    .send()

  if (response.status === 404) notFound()

  const json = (await response
    .json()
    .catch(() => null)) as PriestDetailResponseDto | null

  if (!response.ok || !json?.ok || !json.item) notFound()

  return (
    <main className="space-y-6">
      <section className="space-y-4 rounded-xl bg-white p-5">
        <Link
          href={`/admin/clergy/priests/${id}`}
          className="inline-flex text-sm text-neutral-500 hover:text-neutral-800"
        >
          ← 상세로 돌아가기
        </Link>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">신부님 수정</h1>
          <p className="text-sm text-neutral-600">
            신부님 소개 정보를 수정합니다.
          </p>
        </div>

        <section className="pt-1">
          <PriestFormContainer
            mode="edit"
            priestId={id}
            initialValues={toInput(json.item)}
          />
        </section>
      </section>
    </main>
  )
}
