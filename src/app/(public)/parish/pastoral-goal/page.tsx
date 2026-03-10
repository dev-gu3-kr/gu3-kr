import Image from "next/image"
import { SubLanding } from "@/components/SubLanding"

const PRACTICE_AREAS = [
  {
    id: "1",
    title: "친교 : 성사와 말씀 안에 모두 하나 되기",
    items: [
      "소공동체 모임에 적극 참여하기",
      "청소년, 노약자에게 애정을 갖고 필요한 나눔 실천하기",
    ],
  },
  {
    id: "2",
    title: "선교 : 하느님의 선교에 적극 참여하기",
    items: ["주 1회 평일미사 참여하기", "주 1회 개인 성체조배 시간 갖기"],
  },
  {
    id: "3",
    title: "참여 : 표징을 바라보는 신앙의 눈 회복하기",
    items: ["검소한 생활양식 선택하기", "플라스틱, 일회용품 사용 줄이기"],
  },
] as const

const GROWTH_STAGES = [
  {
    id: "1",
    title: "개인적 차원",
    items: [
      "자신을 돌아보며 진심으로 성찰할 수 있는 지혜",
      "새로운 변화로의 초대에 응답할 수 있는 용기",
      "모든 일에 있어 하느님께 의탁할 수 있는 겸손",
    ],
  },
  {
    id: "2",
    title: "공동체적 차원",
    items: [
      "진실한 사랑으로 가난하고 소외 당하는 이웃을 보듬는 나눔의 공동체",
      "겸손한 마음으로 자신을 낮추고 깨끗한 마음으로 봉사를 다하는 섬김의 공동체",
      "한 분이신 하느님의 뜻에 따라, 한 분이신 예수님의 몸을 나누며, 한 분이신 성령의 이끄심에 응답하는 친교의 공동체",
    ],
  },
  {
    id: "3",
    title: "교회적 차원",
    items: [
      "사제는 공동체를 맡은 신자들의 삶을 거룩하게 이끌기",
      "평신도는 그리스도의 지체로서 일상을 거룩하게 살아내기",
      "수도자는 공동체를 위해 낮은 곳에서 봉사하며 거룩함 안에 머물기",
    ],
  },
] as const

function NumberBadge({ id }: { readonly id: string }) {
  return (
    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-[6px] bg-[#1f2329] px-1 text-xs font-semibold text-white">
      {id}
    </span>
  )
}

export default async function PastoralGoalPage() {
  return (
    <>
      <SubLanding
        title=""
        sectionLabel="구로3동 성당"
        currentLabel="사목 목표"
      />

      <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
        <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#252629]">
          사목 목표
        </h2>

        <article className="relative mt-6 h-[160px] overflow-hidden rounded-2xl border border-[#d8e8f8] md:h-[180px]">
          <Image
            src="/images/parish/pastoral-goal-banner.webp"
            alt="사목 목표 소개 이미지"
            fill
            sizes="(max-width: 1280px) 100vw, 1220px"
            className="object-cover"
            priority
          />
          <p className="relative z-10 flex h-full items-center justify-center px-6 text-center text-xl font-extrabold tracking-[-0.02em] bg-[linear-gradient(90deg,#1D7FFF_0%,#1D7FFF_35%,#FF4C58_65%,#FF4C58_100%)] bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(255,255,255,0.25)] md:text-3xl">
            "시노드 교회 안에 함께 걸어가는 공동체"
          </p>
        </article>

        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-10">
          <article>
            <h3 className="text-lg font-bold text-[#8b1c21]">
              친교, 선교, 참여의 세 가지 차원 실천 사항
            </h3>

            <div className="mt-5 space-y-6">
              {PRACTICE_AREAS.map((section) => (
                <section key={section.id} className="space-y-3">
                  <h4 className="flex items-center gap-2 text-base font-bold text-[#252629]">
                    <NumberBadge id={section.id} />
                    <span>{section.title}</span>
                  </h4>
                  <ul className="space-y-1.5 pl-1 text-[15px] font-medium leading-7 text-neutral-800">
                    {section.items.map((item) => (
                      <li key={item}>· {item}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </article>

          <article>
            <h3 className="text-lg font-bold text-[#8b1c21]">
              본당의 세 가지 차원의 영적 성장과 성숙의 단계
            </h3>

            <div className="mt-5 space-y-6">
              {GROWTH_STAGES.map((section) => (
                <section key={section.id} className="space-y-3">
                  <h4 className="flex items-center gap-2 text-base font-bold text-[#252629]">
                    <NumberBadge id={section.id} />
                    <span>{section.title}</span>
                  </h4>
                  <ul className="space-y-1.5 pl-1 text-[15px] font-medium leading-7 text-neutral-800">
                    {section.items.map((item) => (
                      <li key={item}>· {item}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </article>
        </div>
      </section>
    </>
  )
}
