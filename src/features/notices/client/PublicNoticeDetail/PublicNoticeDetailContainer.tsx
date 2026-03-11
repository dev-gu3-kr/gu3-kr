"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useParams } from "next/navigation"

import { AppLink as Link } from "@/components/AppLink"
import { NoticeContentViewer } from "@/features/notices/client"
import { usePublicNoticeDetailQuery } from "@/features/notices/isomorphic"

export function PublicNoticeDetailContainer() {
  const params = useParams<{ id: string }>()
  const id = String(params?.id ?? "")
  const { data, isLoading, isError } = usePublicNoticeDetailQuery(id)

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
        로딩 중...
      </section>
    )
  }

  if (isError || !data) {
    return (
      <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
        공지사항 상세를 불러오지 못했습니다.
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
      <h2 className="text-[30px] font-semibold tracking-[-0.02em] text-[#252629]">
        공지사항
      </h2>

      <div className="mt-4 bg-[#efefef] px-4 py-3 text-sm">
        <div className="grid grid-cols-[64px_1fr_180px] items-center gap-3">
          <div className="text-center text-xs text-[#3b3b3b]">
            {data.item.isPinned ? (
              <span className="inline-flex rounded-sm bg-white px-3 py-1 font-semibold text-[#1f1f1f]">
                공지
              </span>
            ) : null}
          </div>

          <p className="font-medium text-[#2f2f2f]">{data.item.title}</p>

          <p className="text-right text-xs text-[#666]">
            {data.item.authorName}{" "}
            <span className="mx-1 text-[#b8b8b8]">·</span>
            {new Date(data.item.createdAt).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>

      <article className="border-b border-[#e5e5e5] px-2 py-6 text-[15px] leading-7 text-[#2f2f2f]">
        <NoticeContentViewer content={data.item.content} />
      </article>

      <div className="relative mt-5 min-h-9 text-sm text-[#444]">
        <Link
          href="/notice/notices"
          className="inline-flex items-center gap-2 text-[#333] hover:text-[#111]"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#d9d9d9] text-[#666]">
            <ChevronLeft className="h-4 w-4" />
          </span>
          목록으로
        </Link>

        <div className="mt-4 flex items-center justify-center gap-4 text-[#777] md:absolute md:left-1/2 md:top-1/2 md:mt-0 md:-translate-x-1/2 md:-translate-y-1/2">
          {data.navigation.prev ? (
            <Link
              href={`/notice/notices/${data.navigation.prev.id}`}
              className="inline-flex items-center gap-2 text-[#666] hover:text-[#333]"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f3f3] text-[#888]">
                <ChevronLeft className="h-4 w-4" />
              </span>
              이전 글
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f3f3] text-[#c1c1c1]">
                <ChevronLeft className="h-4 w-4" />
              </span>
              이전 글
            </button>
          )}

          <span className="h-4 w-px bg-[#d9d9d9]" aria-hidden />

          {data.navigation.next ? (
            <Link
              href={`/notice/notices/${data.navigation.next.id}`}
              className="inline-flex items-center gap-2 text-[#666] hover:text-[#333]"
            >
              다음 글
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f3f3] text-[#888]">
                <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2"
            >
              다음 글
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f3f3] text-[#c1c1c1]">
                <ChevronRight className="h-4 w-4" />
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
