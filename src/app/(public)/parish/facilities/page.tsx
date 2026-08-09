import {
  OfficeFacilityCards,
  OfficeGuideSummary,
} from "@/components/office-guide"
import { SubLanding } from "@/components/SubLanding"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "부속 시설",
  description: "구로3동성당의 주요 부속 시설과 이용 정보를 안내합니다.",
  path: "/parish/facilities",
})

export default async function FacilitiesPage() {
  return (
    <>
      <SubLanding
        title=""
        sectionLabel="구로3동 성당"
        currentLabel="부속 시설"
      />

      <section className="mx-auto w-full max-w-[1200px] px-5 py-5 md:px-8 md:py-14">
        <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#252629]">
          부속 시설
        </h2>

        <div className="mt-6 space-y-8 text-[15px] leading-7 text-[#2f3136]">
          <div>
            <p className="text-base font-bold text-[#b1232a]">
              • 교적 전입, 전출
            </p>
            <p className="mt-2">
              이사를 가거나 장기간 다른 지역에 머무를 때에는 교적을 가까운
              성당으로 옮겨야 합니다.
              <br />
              교적을 옮기고자 할 때, 전화나 방문을 통해 본당사무실에 알리면,
              본당사무실에서 해당 본당으로 직접 옮겨 드립니다.
            </p>
          </div>

          <OfficeGuideSummary showHeading />

          <OfficeFacilityCards />
        </div>
      </section>
    </>
  )
}
