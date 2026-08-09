import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { SubLanding } from "@/components/SubLanding"
import { ParishCalendarContainer } from "@/features/home/client"
import { homePrefetch } from "@/features/home/server"
import { getQueryClient } from "@/lib/react-query"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "본당 달력",
  description: "구로3동성당의 전례와 공동체 행사 일정을 달력으로 확인하세요.",
  path: "/notice/parish-calendar",
})

export default async function Page() {
  const queryClient = getQueryClient()
  await homePrefetch.prefetchHomePage(queryClient)

  return (
    <>
      <SubLanding title="" sectionLabel="본당알림" currentLabel="본당 달력" />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <ParishCalendarContainer />
      </HydrationBoundary>
    </>
  )
}
