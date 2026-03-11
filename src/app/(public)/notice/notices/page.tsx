import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { SubLanding } from "@/components/SubLanding"
import { PublicNoticeListContainer } from "@/features/notices/client"
import { noticePrefetch } from "@/features/notices/server"
import { getQueryClient } from "@/lib/react-query"

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
