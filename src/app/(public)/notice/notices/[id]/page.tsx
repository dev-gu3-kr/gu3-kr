import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { SubLanding } from "@/components/SubLanding"
import { PublicNoticeDetailContainer } from "@/features/notices/client"
import { noticePrefetch } from "@/features/notices/server"
import { getQueryClient } from "@/lib/react-query"

type DetailPageProps = {
  params: Promise<{ id: string }>
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
