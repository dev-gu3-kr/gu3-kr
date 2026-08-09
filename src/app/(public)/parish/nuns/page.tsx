import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { SubLanding } from "@/components/SubLanding"
import { NunIntroPageContainer } from "@/features/clergy-nuns/client"
import { nunPrefetch } from "@/features/clergy-nuns/server"
import { getQueryClient } from "@/lib/react-query"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "수녀님 소개",
  description: "구로3동성당 공동체와 함께하는 수녀님을 소개합니다.",
  path: "/parish/nuns",
})

export default async function NunsPage() {
  const queryClient = getQueryClient()

  await nunPrefetch.prefetchPublicNunList(queryClient)

  return (
    <>
      <SubLanding
        title=""
        sectionLabel="구로3동 성당"
        currentLabel="수녀님 소개"
      />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <NunIntroPageContainer />
      </HydrationBoundary>
    </>
  )
}
