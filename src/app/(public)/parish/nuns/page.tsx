import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { SubLanding } from "@/components/SubLanding"
import { NunIntroPageContainer } from "@/features/clergy-nuns/client"
import { nunPrefetch } from "@/features/clergy-nuns/server"
import { getQueryClient } from "@/lib/react-query"

export default async function NunsPage() {
  const queryClient = getQueryClient()

  await nunPrefetch.prefetchPublicNunList(queryClient)

  return (
    <>
      <SubLanding
        title="수녀님 소개"
        sectionLabel="구로3동 성당"
        currentLabel="수녀님 소개"
      />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <NunIntroPageContainer />
      </HydrationBoundary>
    </>
  )
}
