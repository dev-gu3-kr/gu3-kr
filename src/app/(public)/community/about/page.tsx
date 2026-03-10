import { SubLanding } from "@/components/SubLanding"

export default async function Page() {
  return (
    <>
      <SubLanding
        title=""
        sectionLabel="공동체 마당"
        currentLabel="공동체 마당 소개"
      />

      <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#252629] md:text-3xl">
          공동체 마당 소개
        </h2>
      </section>
    </>
  )
}
