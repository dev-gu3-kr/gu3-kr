import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { SubLanding } from "@/components/SubLanding"
import { PublicIntroPageContainer } from "@/features/intro-posts/client"
import { introPostsPrefetch } from "@/features/intro-posts/server"
import { getQueryClient } from "@/lib/react-query"

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
