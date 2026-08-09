import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import type { Metadata } from "next"
import { SubLanding } from "@/components/SubLanding"
import { PublicBulletinDetailContainer } from "@/features/bulletins/client"
import { bulletinPrefetch } from "@/features/bulletins/server"
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
    title: "본당 주보",
    description: "구로3동성당 본당 주보의 자세한 내용을 확인하고 내려받으세요.",
    path: `/notice/weekly-bulletin/${id}`,
  })
}

export default async function BulletinDetailPage({ params }: DetailPageProps) {
  const { id } = await params

  const queryClient = getQueryClient()
  await bulletinPrefetch.prefetchPublicBulletinDetail(queryClient, id)

  return (
    <>
      <SubLanding title="" sectionLabel="본당알림" currentLabel="본당 주보" />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <PublicBulletinDetailContainer />
      </HydrationBoundary>
    </>
  )
}
