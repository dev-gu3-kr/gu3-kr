import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { SubLanding } from "@/components/SubLanding"
import { PastoralCouncilPageContainer } from "@/features/pastoral-council/client"
import { pastoralCouncilPrefetch } from "@/features/pastoral-council/server"
import { getQueryClient } from "@/lib/react-query"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "사목협의회",
  description: "구로3동성당 사목협의회의 구성과 조직을 안내합니다.",
  path: "/community/pastoral-council",
})

function CouncilOrganizationTitleBar() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-5 md:px-8 md:py-14">
      <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#252629] md:text-[30px]">
        사목협의회
      </h2>
      <div className="mx-auto mt-6 flex h-12 w-full items-center justify-center rounded-sm border border-border/60 bg-[#f6f6f6] px-4 text-center text-sm font-semibold tracking-[-0.01em] text-[#252629] md:mt-7 md:h-[60px] md:text-lg">
        천주교 구로3동 성당 사목 조직표
      </div>
    </section>
  )
}

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

      <CouncilOrganizationTitleBar />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <PastoralCouncilPageContainer />
      </HydrationBoundary>
    </>
  )
}
