import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { SubLanding } from "@/components/SubLanding"
import { PriestIntroPageContainer } from "@/features/clergy-priests/client"
import { priestPrefetch } from "@/features/clergy-priests/server"
import { getQueryClient } from "@/lib/react-query"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "신부님 소개",
  description: "구로3동성당에서 사목하는 신부님을 소개합니다.",
  path: "/parish/priests",
})

export default async function PriestsPage() {
  const queryClient = getQueryClient()

  await priestPrefetch.prefetchPublicPriestList(queryClient)

  return (
    <>
      <SubLanding
        title=""
        sectionLabel="구로3동 성당"
        currentLabel="신부님 소개"
      />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <PriestIntroPageContainer />
      </HydrationBoundary>
    </>
  )
}
