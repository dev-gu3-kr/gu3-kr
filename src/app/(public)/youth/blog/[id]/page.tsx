import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { SubLanding } from "@/components/SubLanding"
import { PublicYouthBlogDetailContainer } from "@/features/youth-blog/client"
import { youthBlogPrefetch } from "@/features/youth-blog/server"
import { getQueryClient } from "@/lib/react-query"

type DetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function YouthBlogDetailPage({ params }: DetailPageProps) {
  const { id } = await params

  const queryClient = getQueryClient()
  await youthBlogPrefetch.prefetchPublicYouthBlogDetail(queryClient, id)

  return (
    <>
      <SubLanding
        title=""
        sectionLabel="청소년 마당"
        currentLabel="청소년 블로그"
      />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <PublicYouthBlogDetailContainer />
      </HydrationBoundary>
    </>
  )
}
