import { SubLanding } from "@/components/SubLanding"
import { PrayerPageContainer } from "@/features/prayers/client"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "기도문",
  description:
    "가톨릭 신앙생활에 자주 사용하는 주요 기도문을 확인할 수 있습니다.",
  path: "/faith/prayers",
})

export default function Page() {
  return (
    <>
      <SubLanding title="" sectionLabel="신앙생활" currentLabel="기도문" />
      <PrayerPageContainer />
    </>
  )
}
