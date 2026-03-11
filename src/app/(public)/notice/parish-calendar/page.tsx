import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { SubLanding } from "@/components/SubLanding"
import { ParishCalendarContainer } from "@/features/home/client"
import { homePrefetch } from "@/features/home/server"
import { getQueryClient } from "@/lib/react-query"

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
