import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { SubLanding } from "@/components/SubLanding"
import { PriestIntroPageContainer } from "@/features/clergy-priests/client"
import { priestPrefetch } from "@/features/clergy-priests/server"
import { getQueryClient } from "@/lib/react-query"

export default async function PriestsPage() {
  const queryClient = getQueryClient()

  await priestPrefetch.prefetchPublicPriestList(queryClient)

  return (
    <>
      <SubLanding
        title="신부님 소개"
        sectionLabel="구로3동 성당"
        currentLabel="신부님 소개"
      />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <PriestIntroPageContainer />
      </HydrationBoundary>
    </>
  )
}
