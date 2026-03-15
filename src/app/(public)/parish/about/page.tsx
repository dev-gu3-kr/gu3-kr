import Image from "next/image"

import { SubLanding } from "@/components/SubLanding"
import {
  ParishMissionEvangelizationIcon,
  ParishMissionPrayerIcon,
  ParishMissionSharingIcon,
} from "@/components/svgs"

const MISSION_ITEMS = [
  {
    title: "기도하는 공동체",
    description: "하느님의 말씀과 성사를 중심으로 신앙을 살아가는 공동체",
    Icon: ParishMissionPrayerIcon,
    iconClassName: "h-10 w-auto",
  },
  {
    title: "나누는 공동체",
    description: "이웃과 사랑을 나누며 지역사회와 함께하는 공동체",
    Icon: ParishMissionSharingIcon,
    iconClassName: "h-10 w-auto",
  },
  {
    title: "선교하는 공동체",
    description:
      "복음을 삶으로 증거하며 세상 속에서 그리스도의 빛이 되는 공동체",
    Icon: ParishMissionEvangelizationIcon,
    iconClassName: "h-11 w-auto",
  },
] as const

const HISTORY_ITEMS = [
  {
    period: "1963",
    lead: "구로 지역 신앙 공동체 형성과 함께",
    emphasis: "본당 설립",
  },
  {
    period: "1970 ~ 1990",
    lead: "신앙 공동체 성장과 함께",
    emphasis: "다양한 사목 활동 확대",
  },
  {
    period: "2000 ~",
    lead: "지역사회와 함께하는 본당으로 성장하며",
    emphasis: "교육, 청년 사목, 사회 봉사 활동 강화",
  },
  {
    period: "현재",
    lead: "수많은 신자들의 신앙과 봉사 속에서",
    emphasis: "기도와 사랑을 실천하는 공동체로 이어지고 있음",
  },
] as const

export default async function AboutPage() {
  return (
    <>
      <SubLanding
        title=""
        sectionLabel="구로3동 성당"
        currentLabel="본당 소개"
      />

      <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
        <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#252629]">
          본당 소개
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-[230px_minmax(0,1fr)] md:gap-8">
          <div className="relative aspect-[206/302] w-full max-w-[230px] overflow-hidden rounded-md border border-[#e6e6e6] bg-[#f4f4f4]">
            <Image
              src="/images/parish/parish-about-intro.webp"
              alt="구로3동 성당 본당 소개 이미지"
              fill
              sizes="(max-width: 768px) 100vw, 230px"
              className="object-cover"
            />
          </div>

          <div className="space-y-4 text-[15px] leading-7 text-[#2f3136]">
            <div className="space-y-1.5">
              <p className="text-base font-semibold text-[#252629]">
                구로3동 성당에 오신 것을 환영합니다
              </p>
              <p>
                그리스도의 평화가 여러분과 함께하시길 바랍니다.
                <br />
                구로3동 성당 홈페이지를 찾아주신 모든 분들을 진심으로
                환영합니다.
                <br />
                우리 본당은 하느님의 사랑 안에서 서로를 존중하고 함께 성장하는
                신앙 공동체입니다.
                <br />
                바쁜 일상 속에서도 하느님을 만나고 이웃과 사랑을 나누며, 복음을
                삶 속에서 실천하는 공동체가 되도록 노력하고 있습니다.
                <br />이 홈페이지가 신앙생활의 도움이 되고 본당 공동체를
                이해하는 작은 길잡이가 되기를 바랍니다.
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-base font-semibold text-[#252629]">
                본당 소개
              </p>
              <p>
                구로3동 성당은 서울대교구 구로지구에 속한 천주교 본당으로 서울
                구로구 디지털로27길 82에 위치하고 있습니다.
                <br />
                1963년 설립된 이후 지역 사회 안에서 복음을 전하며 신자들과 함께
                성장해 온 신앙 공동체입니다.
                <br />
                우리 본당은 미사와 성사를 중심으로 신앙 교육, 청소년 사목,
                다양한 단체 활동과 봉사를 통해 하느님의 사랑을 실천하고
                있습니다.
                <br />
                또한 모든 이에게 열린 공동체로서 신앙 안에서 서로를 격려하고
                함께 성장하는 본당을 지향하고 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-base font-bold text-[#252629]">
            본당 공동체의 사명
          </h3>
          <p className="mt-1 text-sm text-[#60636b]">
            구로3동 성당 공동체는 다음과 같은 사명을 지향합니다.
          </p>

          <div className="mt-4 space-y-3">
            {MISSION_ITEMS.map(
              ({ title, description, Icon, iconClassName }) => (
                <article
                  key={title}
                  className="flex items-center gap-4 rounded-xl border border-[#ececec] bg-white px-5 py-4"
                >
                  <span className="flex size-[58px] shrink-0 items-center justify-center rounded-full bg-[#f4f4f4] p-[8px] text-[#8a8f97]">
                    <Icon className={iconClassName} />
                  </span>

                  <div>
                    <p className="text-[15px] font-bold text-[#b1232a]">
                      {title}
                    </p>
                    <p className="mt-0.5 text-sm text-[#4e525b]">
                      {description}
                    </p>
                  </div>
                </article>
              ),
            )}
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-bold text-[#252629]">본당 연혁</h3>

          <div className="mt-4 grid gap-px overflow-hidden rounded-sm bg-[#e8e8e8] md:grid-cols-4">
            {HISTORY_ITEMS.map((item) => (
              <article key={item.period} className="bg-[#f7f7f7] px-6 py-7">
                <p className="text-[28px] font-extrabold tracking-[-0.02em] text-[#24272d] md:text-[30px]">
                  {item.period}
                </p>
                <p className="mt-3 text-sm leading-6 text-[#3f434b]">
                  {item.lead}
                </p>
                <p className="text-sm font-semibold leading-6 text-[#24272d]">
                  {item.emphasis}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
