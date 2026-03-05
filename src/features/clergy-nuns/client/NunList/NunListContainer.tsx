"use client"
import { BriefcaseBusiness, Calendar, Clock3 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { AppLink as Link } from "@/components/AppLink"
import { useNunListQuery } from "@/features/clergy-nuns/isomorphic"

export function NunListContainer() {
  const { data, isLoading, isError } = useNunListQuery()
  const items = data ?? []
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(
    () => new Set(),
  )

  if (isLoading)
    return (
      <div className="space-y-2">
        {["s1", "s2", "s3"].map((key) => (
          <div
            key={key}
            className="grid animate-pulse grid-cols-[104px_1fr] gap-4 rounded-md border p-3"
          >
            <div className="h-[128px] w-[104px] rounded-md bg-neutral-200" />
            <div className="space-y-2">
              <div className="h-5 w-40 rounded bg-neutral-200" />
              <div className="h-4 w-56 rounded bg-neutral-200" />
              <div className="h-4 w-48 rounded bg-neutral-200" />
              <div className="h-4 w-64 rounded bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
    )
  if (isError)
    return (
      <div className="rounded-md border p-4 text-sm text-red-600">
        수녀님 목록 조회에 실패했습니다.
      </div>
    )

  return (
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
            className="grid grid-cols-[104px_1fr] gap-4 rounded-md border p-3 hover:bg-neutral-50"
          >
            {item.imageUrl && !failedImageIds.has(item.id) ? (
              <Image
                src={item.imageUrl}
                alt={`${item.name} 사진`}
                unoptimized
                width={104}
                height={128}
                sizes="104px"
                className="h-[128px] w-[104px] rounded-md border object-cover"
                onError={() => {
                  setFailedImageIds((prev) => new Set(prev).add(item.id))
                }}
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
