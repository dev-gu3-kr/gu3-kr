import { SubLanding } from "@/components/SubLanding"
import { PublicInquiryFormContainer } from "@/features/inquiries/client"

export default function Page() {
  return (
    <>
      <SubLanding title="" sectionLabel="공동체 마당" currentLabel="1:1 문의" />

      <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
        <h2 className="text-[32px] font-bold tracking-[-0.02em] text-[#252629]">
          1:1 문의
        </h2>

        <PublicInquiryFormContainer />
      </section>
    </>
  )
}
