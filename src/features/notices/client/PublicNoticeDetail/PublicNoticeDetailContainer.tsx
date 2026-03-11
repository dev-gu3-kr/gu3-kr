"use client"

import { useParams } from "next/navigation"

import { AppLink as Link } from "@/components/AppLink"
import { NoticeContentViewer } from "@/features/notices/client"
import { usePublicNoticeDetailQuery } from "@/features/notices/isomorphic"

export function PublicNoticeDetailContainer() {
  const params = useParams<{ id: string }>()
  const id = String(params?.id ?? "")
  const { data, isLoading, isError } = usePublicNoticeDetailQuery(id)

  if (isLoading)
    return (
      <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
        로딩 중...
      </section>
    )
  if (isError || !data)
    return (
      <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
        공지사항 상세를 불러오지 못했습니다.
      </section>
    )

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
      <h2 className="text-[30px] font-semibold tracking-[-0.02em] text-[#252629]">
        공지사항
      </h2>
      <div className="mt-4 border-t border-[#2f2f2f]" />
      <div className="mt-1 border-b border-[#ececec] bg-[#f7f7f7] px-3 py-3 text-sm">
        <div className="grid grid-cols-[80px_1fr_120px_120px] items-center gap-2">
          <div className="text-center text-xs text-[#666]">
            {data.isPinned ? (
              <span className="inline-block rounded-sm bg-[#ececec] px-2 py-0.5 font-medium text-[#3b3b3b]">
                공지
              </span>
            ) : null}
          </div>
          <p className="font-medium text-[#2f2f2f]">{data.title}</p>
          <p className="text-center text-xs text-[#444]">관리자</p>
          <p className="text-center text-xs text-[#666]">
            {new Date(data.createdAt).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>
      <article className="border-b border-[#ececec] px-2 py-6 text-[15px] leading-7 text-[#2f2f2f]">
        <NoticeContentViewer content={data.content} />
      </article>
      <div className="mt-6 flex justify-center">
        <Link
          href="/notice/notices"
          className="inline-flex items-center rounded-full border border-[#d6d6d6] px-5 py-2 text-sm text-[#333] hover:bg-[#f7f7f7]"
        >
          목록으로
        </Link>
      </div>
    </section>
  )
}
