import Image from "next/image"

import { SubLanding } from "@/components/SubLanding"

const FACILITY_CARDS = [
  {
    title: "성물방",
    lines: [
      "• 고종미사 전/후로만 잠시 운영합니다.",
      "",
      "주일(일요일)",
      "오전 09:30 - 14:00",
      "",
      "화,목요일(합평기)",
      "- 오전 10:30 - 12:00",
      "- 오후 18:30 - 19:30 (합평기)",
      "- 오전 10:30 - 12:00",
    ],
  },
  {
    title: "카페 엘레그로",
    lines: [
      "주일 (토~일)",
      "오전 09:30 - 16:00",
      "",
      "평일 (월~금)",
      "오전 10:30 - 15:00",
    ],
  },
  {
    title: "노인정 (벤디냐 실버하우스)",
    lines: [
      "주일 (일요일)",
      "오전 10:00 - 19:00",
      "",
      "평일 (월~토)",
      "오전 10:00 - 19:00",
    ],
  },
] as const

export default async function FacilitiesPage() {
  return (
    <>
      <SubLanding
        title=""
        sectionLabel="구로3동 성당"
        currentLabel="부속 시설"
      />

      <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
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

          <div>
            <p className="text-base font-bold text-[#b1232a]">• 사무실 안내</p>

            <div className="mt-3 grid gap-4 md:grid-cols-[260px_minmax(0,1fr)] md:items-start">
              <div className="relative aspect-[206/120] w-full max-w-[260px] overflow-hidden rounded-sm bg-[#f2f2f2]">
                <Image
                  src="/images/parish/parish-facilities-office.webp"
                  alt="사무실 안내 이미지"
                  fill
                  sizes="(max-width: 768px) 100vw, 260px"
                  className="object-cover"
                />
              </div>

              <div className="text-[15px] leading-8 text-[#2f3136]">
                <p className="font-bold text-[#252629]">사무실 업무시간</p>
                <p> - 주일 : 오전 9:00 - 오후 6:00</p>
                <p> - 평일 : 오전 9:00 - 오후 6:00</p>
                <p> - 월요일은 업무하지 않습니다.</p>
                <p> - 전화번호 : 02-857-8541</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-base font-bold text-[#b1232a]">
              • 부속시설 안내
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {FACILITY_CARDS.map((card) => (
                <article key={card.title} className="bg-[#f3f3f3] px-5 py-5">
                  <p className="text-base font-bold text-[#252629]">
                    {card.title}
                  </p>
                  <div className="mt-3 space-y-1.5 text-sm leading-6 text-[#3f434b]">
                    {card.lines.map((line, index) =>
                      line === "" ? (
                        <div key={`${card.title}-${index}`} className="h-1" />
                      ) : (
                        <p
                          key={`${card.title}-${index}`}
                          className={
                            line === "• 고종미사 전/후로만 잠시 운영합니다."
                              ? "font-semibold text-[#b1232a]"
                              : undefined
                          }
                        >
                          {line}
                        </p>
                      ),
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
