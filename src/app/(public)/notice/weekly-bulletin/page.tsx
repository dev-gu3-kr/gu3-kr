import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { SubLanding } from "@/components/SubLanding"
import { PublicBulletinListContainer } from "@/features/bulletins/client"
import { bulletinPrefetch } from "@/features/bulletins/server"
import { getQueryClient } from "@/lib/react-query"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "본당 주보",
  description:
    "구로3동성당의 최신 주보와 지난 주보를 확인하고 내려받을 수 있습니다.",
  path: "/notice/weekly-bulletin",
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

  await bulletinPrefetch.prefetchPublicBulletinList(queryClient, {
    page,
    query,
  })

  return (
    <>
      <SubLanding title="" sectionLabel="본당알림" currentLabel="본당 주보" />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <PublicBulletinListContainer />
      </HydrationBoundary>
    </>
  )
}
