import { SubLanding } from "@/components/SubLanding"
import { PublicInquiryFormContainer } from "@/features/inquiries/client"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "1:1 문의",
  description: "구로3동성당에 궁금한 사항을 온라인으로 문의할 수 있습니다.",
  path: "/community/inquiry",
})

export default function Page() {
  return (
    <>
      <SubLanding title="" sectionLabel="공동체 마당" currentLabel="1:1 문의" />

      <section className="mx-auto w-full max-w-[1200px] px-5 py-5 md:px-8 md:py-14">
        <h2 className="text-[32px] font-bold tracking-[-0.02em] text-[#252629]">
          1:1 문의
        </h2>

        <PublicInquiryFormContainer />
      </section>
    </>
  )
}
