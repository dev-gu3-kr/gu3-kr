import Image from "next/image"

import { SubLanding } from "@/components/SubLanding"
import { OfficePhoneIcon } from "@/components/svgs"

const RECIPIENTS = [
  "- 중병으로 치료 중인 신자",
  "- 큰 수술을 앞둔 신자",
  "- 노환으로 건강이 크게 약해진 어르신",
  "- 병원에 입원 중인 신자",
] as const

const PREPARE_ITEMS = [
  "- 십자가 또는 성상",
  "- 초",
  "- 작은 탁자 (성사 준비용)",
] as const

export default async function AnointingPage() {
  return (
    <>
      <SubLanding title="" sectionLabel="본당업무" currentLabel="병자성사" />

      <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
        <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#252629]">
          병자성사
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-[230px_minmax(0,1fr)] md:gap-8">
          <div className="relative mx-auto aspect-square w-full max-w-[230px] overflow-hidden rounded-[14px] bg-[#f3f3f3] md:mx-0">
            <Image
              src="/images/office/office-anointing.webp"
              alt="병자성사 안내 이미지"
              fill
              sizes="(max-width: 768px) 100vw, 230px"
              className="object-cover"
            />
          </div>

          <div className="space-y-6 text-[15px] leading-7 text-[#2f3136]">
            <div className="space-y-2">
              <p>
                병자성사는 질병이나 노환으로 고통을 겪고 있는 신자에게 하느님의
                위로와 은총을 전해 주는 가톨릭 교회의 성사입니다. 사제는 기도와
                안수, 성유를 사용하여 병자에게 기름을 바르며 하느님의 치유와
                평화를 청합니다. 이를 통해 병자는 육체적·영적 힘을 얻고 하느님의
                사랑 안에서 고통을 이겨 나갈 수 있도록 도움을 받게 됩니다.
                병자성사는 단순히 임종 직전에만 받는 것이 아니라{" "}
                <span className="font-semibold text-[#252629]">
                  질병을 앓고 있거나 큰 수술을 앞두었을 때, 또는 노환으로 건강이
                  크게 약해졌을 때 받을 수 있는 성사입니다.
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#252629]">
                병자성사 대상
              </h3>
              <p>다음과 같은 경우 병자성사를 받을 수 있습니다.</p>
              <div className="space-y-1">
                {RECIPIENTS.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
              <p className="font-semibold text-[#b1232a]">
                * 필요할 경우 가정이나 병원 방문을 통해서도 병자성사를 받을 수
                있습니다.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#252629]">
                병자성사 신청 방법
              </h3>
              <p>
                병자성사를 원하시는 경우 본당 사무실로 연락하여 신청하실 수
                있습니다.
              </p>
              <p>
                사무실에서 상황을 확인한 후, 신부님 방문 일정 또는 성사 시간을
                안내해 드립니다.
              </p>
              <p>
                특히 위급한 상황에서는 가능한 한 빠르게 연락해 주시기 바랍니다.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#252629]">준비사항</h3>
              <p>병자성사를 위해 다음 사항을 준비해 주시면 좋습니다.</p>
              <div className="space-y-1">
                {PREPARE_ITEMS.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
              <p className="font-semibold text-[#b1232a]">
                * 준비가 어려운 경우에도 성사를 받을 수 있으니 부담 없이 문의해
                주시기 바랍니다.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#252629]">
                문의 및 신청
              </h3>
              <p>
                병자성사 신청 및 상담은 본당 사무실로 연락해 주시기 바랍니다.
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
