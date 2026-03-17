import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { SubLanding } from "@/components/SubLanding"
import { PastoralCouncilPageContainer } from "@/features/pastoral-council/client"
import { pastoralCouncilPrefetch } from "@/features/pastoral-council/server"
import { getQueryClient } from "@/lib/react-query"

export default async function Page() {
  const queryClient = getQueryClient()

  await pastoralCouncilPrefetch.prefetchPublicPastoralCouncilList(queryClient)

  return (
    <>
      <SubLanding
        title=""
        sectionLabel="공동체 마당"
        currentLabel="사목협의회"
      />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <PastoralCouncilPageContainer />
      </HydrationBoundary>
    </>
  )
}
