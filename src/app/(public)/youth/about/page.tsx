import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { SubLanding } from "@/components/SubLanding"
import { PublicIntroPageContainer } from "@/features/intro-posts/client"
import { introPostsPrefetch } from "@/features/intro-posts/server"
import { getQueryClient } from "@/lib/react-query"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "청소년 마당 소개",
  description: "구로3동성당 청소년 공동체와 신앙 활동을 소개합니다.",
  path: "/youth/about",
})

export default async function Page() {
  const queryClient = getQueryClient()
  await introPostsPrefetch.prefetchPublicIntroPosts(queryClient, {
    section: "youth",
  })

  return (
    <>
      <SubLanding
        title=""
        sectionLabel="청소년 마당"
        currentLabel="청소년 마당 소개"
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PublicIntroPageContainer section="youth" />
      </HydrationBoundary>
    </>
  )
}
