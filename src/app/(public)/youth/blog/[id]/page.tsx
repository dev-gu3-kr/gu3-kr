import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import type { Metadata } from "next"
import { SubLanding } from "@/components/SubLanding"
import { PublicYouthBlogDetailContainer } from "@/features/youth-blog/client"
import { youthBlogPrefetch } from "@/features/youth-blog/server"
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
    title: "청소년 블로그",
    description: "구로3동성당 청소년 블로그의 자세한 이야기를 확인하세요.",
    path: `/youth/blog/${id}`,
  })
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
