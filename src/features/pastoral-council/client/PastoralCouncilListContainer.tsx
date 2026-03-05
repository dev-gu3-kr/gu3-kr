"use client"

import { BriefcaseBusiness, Phone } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { usePastoralCouncilListQuery } from "@/features/pastoral-council/isomorphic"

export function PastoralCouncilListContainer() {
  const { data, isLoading, isError } = usePastoralCouncilListQuery()

  const items = data ?? []
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(
    () => new Set(),
  )

  if (isLoading) {
    return (
      <div className="space-y-2">
        {["pc-sk-1", "pc-sk-2", "pc-sk-3"].map((key) => (
          <div
            key={key}
            className="grid animate-pulse grid-cols-[104px_1fr] gap-4 rounded-md border p-3"
          >
            <div className="h-[128px] w-[104px] rounded-md bg-neutral-200" />
            <div className="space-y-2">
              <div className="h-5 w-40 rounded bg-neutral-200" />
              <div className="h-4 w-56 rounded bg-neutral-200" />
              <div className="h-4 w-48 rounded bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md border p-4 text-sm text-red-600">
        사목협의회 목록 조회에 실패했습니다.
      </div>
    )
  }

  return (
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
            {item.imageUrl && !failedImageIds.has(item.id) ? (
              <Image
                src={item.imageUrl}
                alt={`${item.name} 사진`}
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
  )
}
