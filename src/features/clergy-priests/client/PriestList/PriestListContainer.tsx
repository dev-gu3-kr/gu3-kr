"use client"
import { useQuery } from "@tanstack/react-query"
import { BriefcaseBusiness, Calendar, Clock3, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { PriestListItemDto } from "@/features/clergy-priests/isomorphic"
import { apiFetch } from "@/lib/api"

type PriestListResponseDto = { ok?: boolean; items?: PriestListItemDto[] }

async function fetchPriests() {
  const response = await apiFetch
    .get("/api/admin/clergy/priests")
    .query({ take: 30 })
    .send()
  if (!response.ok) throw new Error("신부님 목록을 불러오지 못했습니다.")
  const json = (await response
    .json()
    .catch(() => null)) as PriestListResponseDto | null
  return json?.ok && Array.isArray(json.items) ? json.items : []
}

export function PriestListContainer() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "clergy", "priests", "list"],
    queryFn: fetchPriests,
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
  const items = data ?? []

  if (isLoading)
    return (
      <div className="rounded-md border p-4 text-sm text-neutral-500">
        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> 불러오는 중...
      </div>
    )
  if (isError)
    return (
      <div className="rounded-md border p-4 text-sm text-red-600">
        신부님 목록 조회에 실패했습니다.
      </div>
    )

  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <div className="rounded-md border p-4 text-sm text-neutral-500">
          등록된 신부님 프로필이 없습니다.
        </div>
      ) : (
        items.map((item) => (
          <Link
            key={item.id}
            href={`/admin/clergy/priests/${item.id}`}
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
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>
                    <span className="text-neutral-500">축일:</span>{" "}
                    {item.feastMonth ?? "-"}월 {item.feastDay ?? "-"}일
                  </span>
                </p>
                <p className="flex items-center gap-1.5 text-sm text-neutral-600">
                  <Clock3 className="h-4 w-4 text-primary" />
                  <span>
                    <span className="text-neutral-500">재임기간:</span>{" "}
                    {item.termStart ? item.termStart.slice(0, 10) : "-"} ~{" "}
                    {item.termEnd ? item.termEnd.slice(0, 10) : "현재"}
                  </span>
                </p>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  )
}
