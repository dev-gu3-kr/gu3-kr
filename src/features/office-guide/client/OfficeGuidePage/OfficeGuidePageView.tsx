import {
  OfficeFacilityCards,
  OfficeGuideSummary,
} from "@/components/office-guide"

export function OfficeGuidePageView() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-5 md:px-8 md:py-14">
      <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#252629]">
        사무실 안내
      </h2>

      <div className="mt-6 space-y-8">
        <OfficeGuideSummary />
        <OfficeFacilityCards />
      </div>
    </section>
  )
}
