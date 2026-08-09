import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import type { Metadata } from "next"

import { SubLanding } from "@/components/SubLanding"
import { PublicNoticeDetailContainer } from "@/features/notices/client"
import { noticePrefetch } from "@/features/notices/server"
import { getQueryClient } from "@/lib/react-query"
import { createPageMetadata } from "@/lib/seo"

type DetailPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: DetailPageProps): Promise<Metadata> {
  const { id } = await params

  return createPageMetadata({
    title: "공지사항",
    description: "구로3동성당 공지사항의 자세한 내용을 확인하세요.",
    path: `/notice/notices/${id}`,
  })
}

export default async function NoticeDetailPage({ params }: DetailPageProps) {
  const { id } = await params

  const queryClient = getQueryClient()
  await noticePrefetch.prefetchPublicNoticeDetail(queryClient, id)

  return (
    <>
      <SubLanding title="" sectionLabel="본당알림" currentLabel="공지사항" />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <PublicNoticeDetailContainer />
      </HydrationBoundary>
    </>
  )
}
