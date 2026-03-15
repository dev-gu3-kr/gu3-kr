import Image from "next/image"

import { SubLanding } from "@/components/SubLanding"
import { OfficePhoneIcon } from "@/components/svgs"

const PROCEDURE_STEPS = [
  "1. 본당 사무실에 선종 사실을 먼저 알려주십시오.",
  "2. 장례미사 및 장례 절차에 대해 안내를 받습니다.",
  "3. 장례미사 일정과 장소를 협의합니다.",
  "4. 장례 예식(입관, 장례미사, 장지 예절 등)을 진행합니다.",
] as const

const FUNERAL_ORDER = [
  "- 위령 기도",
  "- 연도 (위령 기도)",
  "- 입관 예절",
  "- 장례미사",
  "- 장지 예절",
] as const

export default async function FuneralGuidePage() {
  return (
    <>
      <SubLanding title="" sectionLabel="본당업무" currentLabel="선종안내" />

      <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
        <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#252629]">
          선종안내
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-[230px_minmax(0,1fr)] md:gap-8">
          <div className="relative mx-auto aspect-square w-full max-w-[230px] overflow-hidden rounded-[14px] bg-[#f3f3f3] md:mx-0">
            <Image
              src="/images/office/office-funeral-guide.webp"
              alt="선종 안내 이미지"
              fill
              sizes="(max-width: 768px) 100vw, 230px"
              className="object-cover"
            />
          </div>

          <div className="space-y-6 text-[15px] leading-7 text-[#2f3136]">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#252629]">
                선종(장례) 안내
              </h3>
              <p>
                가톨릭 교회에서는 신자가 세상을 떠나는 것을 단순한 죽음이 아니라
                하느님께로 돌아가는 여정이라는 의미로 "
                <span className="font-semibold text-[#252629]">선종(善終)</span>
                "이라고 부릅니다. 교회는 선종한 신자를 위해 기도하며 장례미사와
                장례 예식을 통해 고인의 영혼이 하느님의 자비 안에서 영원한
                안식을 얻도록 기도합니다. 또한 남겨진 가족들에게 위로와 희망을
                전하며 부활에 대한 그리스도인의 믿음을 함께 나눕니다.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#252629]">
                선종 시 절차 안내
              </h3>
              <p>
                신자가 선종하셨을 경우 다음 절차에 따라 본당에 알려 주시기
                바랍니다.
              </p>
              <div className="space-y-1">
                {PROCEDURE_STEPS.map((step) => (
                  <p key={step}>{step}</p>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#252629]">
                장례 예식 안내
              </h3>
              <p>가톨릭 장례 예식은 보통 다음과 같은 순서로 진행됩니다.</p>
              <div className="space-y-1">
                {FUNERAL_ORDER.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
              <p className="font-semibold text-[#b1232a]">
                * 장례미사는 고인의 영혼을 위해 봉헌되는 미사로 가톨릭 장례
                예식의 중심이 되는 중요한 예식입니다.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#252629]">
                장례 미사 안내
              </h3>
              <p>
                장례미사는 본당 성당에서 봉헌될 수 있으며 자세한 일정과 절차는
                본당과 상의하여 결정됩니다.
              </p>
              <p className="font-semibold text-[#b1232a]">
                * 상황에 따라 화장식장 미사 또는 성당 장례미사가 진행될 수
                있습니다.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#252629]">문의</h3>
              <p>
                신자가 선종하셨을 경우 가능한 한 빠르게 본당 사무실로 연락해
                주시기 바랍니다.
                <br />
                본당에서는 장례 절차와 장례미사에 대해 유가족에게 자세히 안내해
                드립니다.
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
