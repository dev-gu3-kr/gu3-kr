import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { SubLanding } from "@/components/SubLanding"
import { PublicIntroPageContainer } from "@/features/intro-posts/client"
import { introPostsPrefetch } from "@/features/intro-posts/server"
import { getQueryClient } from "@/lib/react-query"

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
