import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { SubLanding } from "@/components/SubLanding"
import { PublicGalleryDetailContainer } from "@/features/gallery/client"
import { galleryPrefetch } from "@/features/gallery/server"
import { getQueryClient } from "@/lib/react-query"

type DetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function GalleryDetailPage({ params }: DetailPageProps) {
  const { id } = await params

  const queryClient = getQueryClient()
  await galleryPrefetch.prefetchPublicGalleryDetail(queryClient, id)

  return (
    <>
      <SubLanding title="" sectionLabel="본당알림" currentLabel="본당 갤러리" />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <PublicGalleryDetailContainer />
      </HydrationBoundary>
    </>
  )
}
