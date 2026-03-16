import Image from "next/image"

import { SubLanding } from "@/components/SubLanding"

type MassTimeChip = {
  time: string
  label: string
}

type MassTimeRow = {
  dayLabel: string
  chips: MassTimeChip[]
  isDayEmphasis?: boolean
}

const SUNDAY_ROWS: MassTimeRow[] = [
  {
    dayLabel: "일요일",
    isDayEmphasis: true,
    chips: [
      { time: "06:30", label: "새벽미사" },
      { time: "10:30", label: "교중미사" },
      { time: "12:00", label: "중고등부 미사" },
      { time: "15:30", label: "유초등부 미사" },
      { time: "18:00", label: "청년 미사" },
      { time: "21:00", label: "밤 미사" },
    ],
  },
  {
    dayLabel: "토요일",
    chips: [{ time: "19:00", label: "토요 저녁 주일 미사" }],
  },
]

const WEEKDAY_ROWS: MassTimeRow[] = [
  {
    dayLabel: "월/화/수/금",
    isDayEmphasis: true,
    chips: [
      { time: "06:30", label: "평일 새벽미사" },
      { time: "19:00", label: "평일 저녁 미사" },
    ],
  },
  {
    dayLabel: "목요일",
    chips: [{ time: "10:00", label: "목요 오전 미사" }],
  },
]

const PARTICIPATION_GUIDES = [
  "미사 시작 10분 전까지는 성당에 도착하여 마음을 차분히 정돈하고 준비하는 시간을 갖고 휴대전화는 꺼 둡니다.",
  "단정한 옷차림으로 참여하며 운동복이나 슬리퍼 착용은 삼가합니다.",
  "미사시간에는 조용하고 경건한 자세를 유지하고, 특히 하느님의 말씀에 봉독되는 독서·복음, 강론 때는 주보나 안내책자를 보는 행동을 삼가고 경청합니다.",
  "자신을 하느님께 봉헌하는 시간입니다. 헌금은 미리 정성으로 준비해 봉헌합니다.",
  "주님을 모시는 거룩한 시간입니다. 미사 시간 전에 음식을 먹지 않는 공복재를 지키며 손을 깨끗이 씻도록 합시다.",
  "어린이와 함께 미사를 드릴 경우에는 잠깐만 도움이 필요한 활동이 생기지 않도록 주의 바랍니다.",
  "주변 분들의 기도에 방해가 되지 않도록 조용히 행동하고, 미사가 끝난 뒤에도 감사의 마음으로 마무리합니다.",
]

function MassTimeSection({
  title,
  rows,
}: {
  title: string
  rows: MassTimeRow[]
}) {
  return (
    <section className="space-y-4">
      <h3 className="text-base font-semibold text-[#252629] md:text-[17px]">
        {title}
      </h3>

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.dayLabel}
            className="flex flex-col gap-2 md:flex-row md:items-start"
          >
            <p
              className={
                row.isDayEmphasis
                  ? "w-[86px] pt-1 text-sm font-bold text-[#ae2125]"
                  : "w-[86px] pt-1 text-sm font-bold text-[#252629]"
              }
            >
              {row.dayLabel}
            </p>

            <div className="flex flex-1 flex-wrap gap-2">
              {row.chips.map((chip) => (
                <div
                  key={`${row.dayLabel}-${chip.time}-${chip.label}`}
                  className="inline-flex items-center gap-2 rounded-md bg-[#f3f3f3] px-3 py-2 text-[13px] text-[#252629]"
                >
                  <span className="text-[#707070] font-semibold">
                    {chip.time}
                  </span>
                  <span className="font-semibold">{chip.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Page() {
  return (
    <>
      <SubLanding title="" sectionLabel="본당알림" currentLabel="미사 시간" />

      <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#252629] md:text-3xl">
          미사 시간
        </h2>

        <div className="mt-8 space-y-8 font-semibold">
          <MassTimeSection title="주일 미사 안내" rows={SUNDAY_ROWS} />

          <div className="h-px bg-[#e5e5e5]" />

          <MassTimeSection title="평일 미사 안내" rows={WEEKDAY_ROWS} />

          <div className="h-px bg-[#e5e5e5]" />

          <section className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="relative h-[228px] w-[160px] shrink-0 overflow-hidden rounded-md border border-[#e4e4e4]">
              <Image
                src="/images/notice/mass-participation-guide.webp"
                alt="미사 안내 이미지"
                fill
                sizes="160px"
                className="object-cover"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-[#252629] md:text-[17px]">
                미사 참례 자세
              </h3>
              <ul className="space-y-1 text-[13px] leading-6 text-[#333]">
                {PARTICIPATION_GUIDES.map((guide) => (
                  <li key={guide} className="flex items-start gap-1.5">
                    <span className="mt-[9px] inline-block h-1 w-1 rounded-full bg-[#252629]" />
                    <span>{guide}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </section>
    </>
  )
}
