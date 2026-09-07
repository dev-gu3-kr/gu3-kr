import { Suspense } from "react"
import { SubLanding } from "@/components/SubLanding"
import { PublicPhotoArchivePageContainer } from "@/features/photoArchive/client"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "사진 아카이브",
  description: "구로3동성당의 다양한 기록 사진을 연도별로 살펴보세요.",
  path: "/parish/photo-archive",
})

export default function PhotoArchivePage() {
  return (
    <>
      <SubLanding
        title=""
        sectionLabel="구로3동 성당"
        currentLabel="사진 아카이브"
      />
      <Suspense
        fallback={
          <div className="mx-auto min-h-96 w-full max-w-[1200px] animate-pulse px-5 py-5 md:px-8 md:py-14" />
        }
      >
        <PublicPhotoArchivePageContainer />
      </Suspense>
    </>
  )
}
