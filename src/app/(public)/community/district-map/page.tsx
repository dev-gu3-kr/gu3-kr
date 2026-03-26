import Image from "next/image"

import { SubLanding } from "@/components/SubLanding"

export default async function Page() {
  return (
    <>
      <SubLanding
        title=""
        sectionLabel="공동체 마당"
        currentLabel="관할 구역도"
      />

      <section className="mx-auto w-full max-w-[1220px] px-5 py-5 md:px-8 md:py-14">
        <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[#252629] md:text-[22px]">
          관할 구역도
        </h2>

        <div className="relative mt-6 aspect-[16/19] w-full overflow-hidden bg-[#e5e5e5] md:mx-0 md:aspect-[61/40]">
          <Image
            src="/images/community/community-district-map-mobile.webp"
            alt="구로3동 성당 관할 구역도"
            fill
            sizes="(max-width: 767px) calc(100vw - 40px), 1220px"
            className="object-cover md:hidden"
          />
          <Image
            src="/images/community/community-district-map.webp"
            alt="구로3동 성당 관할 구역도"
            fill
            sizes="(max-width: 1279px) 100vw, 1220px"
            className="hidden object-cover md:block"
          />
        </div>
      </section>
    </>
  )
}
