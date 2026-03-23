import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { SubLanding } from "@/components/SubLanding"
import { PublicBulletinDetailContainer } from "@/features/bulletins/client"
import { bulletinPrefetch } from "@/features/bulletins/server"
import { getQueryClient } from "@/lib/react-query"

type DetailPageProps = {
  params: Promise<{ id: string }>
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
