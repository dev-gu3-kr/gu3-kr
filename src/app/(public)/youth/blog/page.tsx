import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { SubLanding } from "@/components/SubLanding"
import { PublicYouthBlogListContainer } from "@/features/youth-blog/client"
import { youthBlogPrefetch } from "@/features/youth-blog/server"
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
  await youthBlogPrefetch.prefetchPublicYouthBlogList(queryClient, {
    page,
    query,
  })

  return (
    <>
      <SubLanding
        title=""
        sectionLabel="청소년 마당"
        currentLabel="청소년 블로그"
      />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <PublicYouthBlogListContainer />
      </HydrationBoundary>
    </>
  )
}
