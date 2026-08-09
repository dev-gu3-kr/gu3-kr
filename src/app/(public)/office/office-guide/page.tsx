import { SubLanding } from "@/components/SubLanding"
import { OfficeGuidePageContainer } from "@/features/office-guide/client"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "사무실 안내",
  description: "구로3동성당 사무실 운영 시간과 주요 업무, 연락처를 안내합니다.",
  path: "/office/office-guide",
})

export default function Page() {
  return (
    <>
      <SubLanding title="" sectionLabel="본당업무" currentLabel="사무실 안내" />
      <OfficeGuidePageContainer />
    </>
  )
}
