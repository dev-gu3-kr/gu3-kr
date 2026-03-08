import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { HomePageClient } from "@/features/home/client"
import { homePrefetch } from "@/features/home/server"
import { getQueryClient } from "@/lib/react-query"

export default async function Home() {
  const queryClient = getQueryClient()

  await homePrefetch.prefetchHomePage(queryClient)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePageClient />
    </HydrationBoundary>
  )
}
