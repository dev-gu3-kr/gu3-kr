import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { SubLanding } from "@/components/SubLanding"
import { PublicNoticeListContainer } from "@/features/notices/client"
import { noticePrefetch } from "@/features/notices/server"
import { getQueryClient } from "@/lib/react-query"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "공지사항",
  description: "구로3동성당의 새로운 소식과 주요 공지사항을 확인하세요.",
  path: "/notice/notices",
})

type PageProps = {
  searchParams?: Promise<{
    page?: string
    q?: string
  }>
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const query = (resolvedSearchParams.q || "").trim()
  const page = Math.max(1, Number(resolvedSearchParams.page || "1") || 1)

  const queryClient = getQueryClient()

  await noticePrefetch.prefetchPublicNoticeList(queryClient, {
    page,
    query,
  })

  return (
    <>
      <SubLanding title="" sectionLabel="본당알림" currentLabel="공지사항" />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <PublicNoticeListContainer />
      </HydrationBoundary>
    </>
  )
}
