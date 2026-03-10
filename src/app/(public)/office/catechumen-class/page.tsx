import { SubLanding } from "@/components/SubLanding"

export default async function Page() {
  return (
    <>
      <SubLanding
        title=""
        sectionLabel="본당업무"
        currentLabel="예비신자 교리"
      />

      <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#252629] md:text-3xl">
          예비신자 교리
        </h2>
      </section>
    </>
  )
}
