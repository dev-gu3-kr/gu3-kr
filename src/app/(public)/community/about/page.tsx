import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { SubLanding } from "@/components/SubLanding"
import { PublicIntroPageContainer } from "@/features/intro-posts/client"
import { introPostsPrefetch } from "@/features/intro-posts/server"
import { getQueryClient } from "@/lib/react-query"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "공동체 마당 소개",
  description: "구로3동성당의 단체와 공동체 활동을 소개합니다.",
  path: "/community/about",
})

export default async function Page() {
  const queryClient = getQueryClient()
  await introPostsPrefetch.prefetchPublicIntroPosts(queryClient, {
    section: "community",
  })

  return (
    <>
      <SubLanding
        title=""
        sectionLabel="공동체 마당"
        currentLabel="공동체 마당 소개"
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PublicIntroPageContainer section="community" />
      </HydrationBoundary>
    </>
  )
}
