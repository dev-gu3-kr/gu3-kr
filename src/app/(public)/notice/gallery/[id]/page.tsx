import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import type { Metadata } from "next"

import { SubLanding } from "@/components/SubLanding"
import { PublicGalleryDetailContainer } from "@/features/gallery/client"
import { galleryPrefetch } from "@/features/gallery/server"
import { getQueryClient } from "@/lib/react-query"
import { createPageMetadata } from "@/lib/seo"

type DetailPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: DetailPageProps): Promise<Metadata> {
  const { id } = await params

  return createPageMetadata({
    title: "본당 갤러리",
    description: "구로3동성당 갤러리의 사진과 자세한 내용을 확인하세요.",
    path: `/notice/gallery/${id}`,
  })
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
