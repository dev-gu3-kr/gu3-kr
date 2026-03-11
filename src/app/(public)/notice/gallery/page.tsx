import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { SubLanding } from "@/components/SubLanding"
import { PublicGalleryListContainer } from "@/features/gallery/client"
import { galleryPrefetch } from "@/features/gallery/server"
import { getQueryClient } from "@/lib/react-query"

type PageProps = {
  searchParams?: Promise<{
    page?: string
    q?: string
  }>
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const query = (resolvedSearchParams.q || "").trim()
  const page = Math.max(1, Number(resolvedSearchParams.page || "1") || 1)

  const queryClient = getQueryClient()
  await galleryPrefetch.prefetchPublicGalleryList(queryClient, { page, query })

  return (
    <>
      <SubLanding title="" sectionLabel="본당알림" currentLabel="본당 갤러리" />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <PublicGalleryListContainer />
      </HydrationBoundary>
    </>
  )
}
