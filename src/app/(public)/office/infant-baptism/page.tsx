import Image from "next/image"

import { SubLanding } from "@/components/SubLanding"
import { OfficePhoneIcon } from "@/components/svgs"

const STEPS = [
  "1. 본당 사무실에 방문 또는 전화로 신청합니다.",
  "2. 유아세례 부모 교육에 참석합니다.",
  "3. 지정된 날짜에 세례식에 참석합니다.",
] as const

const SPONSOR_CONDITIONS = [
  "- 천주교에서 세례와 견진성사를 받은 신자",
  "- 신앙생활을 꾸준히 하는 신자",
  "- 만 16세 이상",
] as const

const PREPARE_ITEMS = [
  "- 세례복 (흰 옷)",
  "- 세례초",
  "- 대부 또는 대모",
] as const

export default async function InfantBaptismPage() {
  return (
    <>
      <SubLanding title="" sectionLabel="본당업무" currentLabel="유아세례" />

      <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
        <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#252629]">
          유아세례
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-[230px_minmax(0,1fr)] md:gap-8">
          <div className="relative mx-auto aspect-[230/340] w-full max-w-[230px] overflow-hidden rounded-[14px] bg-[#f3f3f3] md:mx-0">
            <Image
              src="/images/office/office-infant-baptism.webp"
              alt="유아세례 안내 이미지"
              fill
              sizes="(max-width: 768px) 100vw, 230px"
              className="object-cover"
            />
          </div>

          <div className="space-y-6 text-[15px] leading-7 text-[#2f3136]">
            <div className="space-y-2">
              <p>
                유아세례는 아직 스스로 신앙을 고백할 수 없는 아기를 대신하여
                부모와 대부모가 신앙 안에서 아기를 양육하겠다는 약속과 함께
                하느님의 자녀로 태어나도록 하는 가톨릭 교회의 성사입니다. 세례를
                통해 아기는 하느님의 사랑 안에서 새로운 생명을 받고 교회의
                공동체 안에서 신앙의 삶을 시작하게 됩니다. 부모와 대부모는
                아이가 성장하는 동안 기도와 모범적인 삶으로 신앙을 전해 줄
                책임을 지게 됩니다.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#252629]">
                유아세례 일정
              </h3>
              <p>- 일시 : 3월, 6월, 9월, 12월 네 번째 토요일 16:00</p>
              <p>- 장소 : 구로3동 성당</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#252629]">
                부모 교육 안내
              </h3>
              <p className="font-semibold text-[#b1232a]">
                * 유아세례를 받기 위해서는 부모 교육에 참석하셔야 합니다.
              </p>
              <p>- 일시 : 유아세례 전날 금요일 20:00</p>
              <p>- 대상 : 유아세례를 신청한 부모 및 대부모</p>
              <p>
                부모 교육에서는 유아세례의 의미와 부모 및 대부모의 신앙적 역할에
                대해 안내합니다.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#252629]">
                유아세례 신청 방법
              </h3>
              <div className="space-y-1">
                {STEPS.map((step) => (
                  <p key={step}>{step}</p>
                ))}
              </div>
              <p className="font-semibold text-[#b1232a]">
                * 신청은 세례 일정 최소 1~2주 전까지 접수해 주시면 원활한 준비가
                가능합니다.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#252629]">
                대부모 자격 안내
              </h3>
              <p className="font-semibold text-[#b1232a]">
                * 유아세례에는 아이의 신앙 성장을 도와줄 대부 또는 대모가
                필요합니다. 대부모는 다음의 조건을 갖추어야 합니다.
              </p>
              <div className="space-y-1">
                {SPONSOR_CONDITIONS.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#252629]">준비 사항</h3>
              <div className="space-y-1">
                {PREPARE_ITEMS.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#252629]">
                문의 및 신청
              </h3>
              <p>
                유아세례 신청 및 자세한 안내는 본당 사무실로 문의해 주시기
                바랍니다.
              </p>
              <a
                href="tel:02-857-8541"
                className="inline-flex items-center gap-2 rounded-full border border-[#c6c6c6] px-5 py-2.5 text-[22px] font-bold text-[#252629]"
              >
                <OfficePhoneIcon className="h-[15px] w-[15px]" aria-hidden />
                <span className="text-base">02)857-8541</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
