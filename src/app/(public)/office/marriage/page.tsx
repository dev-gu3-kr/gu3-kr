import Image from "next/image"

import { SubLanding } from "@/components/SubLanding"
import { OfficePhoneIcon } from "@/components/svgs"

const COURSE_TOPICS = [
  "- 그리스도교적 혼인의 의미",
  "- 부부의 사랑과 책임",
  "- 가정 안에서의 신앙생활",
] as const

const REQUIRED_DOCS = [
  "- 세례증명서",
  "- 견진증명서",
  "- 혼인 당사자 주민등록등본",
  "- 혼인 전 교리 관련 서류",
] as const

const APPLICATION_STEPS = [
  "1. 본당 사무실 문의 및 상담 예약",
  "2. 주일 신부님 혼인 면담",
  "3. 혼인 강좌 이수",
  "4. 혼인성사 일정 확정",
] as const

export default async function MarriagePage() {
  return (
    <>
      <SubLanding title="" sectionLabel="본당업무" currentLabel="혼인성사" />

      <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
        <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#252629]">
          혼인성사
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-[230px_minmax(0,1fr)] md:gap-8">
          <div className="space-y-5">
            <div className="relative mx-auto aspect-square w-full max-w-[230px] overflow-hidden rounded-[14px] bg-[#f3f3f3] md:mx-0">
              <Image
                src="/images/office/office-marriage-main.webp"
                alt="혼인성사 안내 이미지"
                fill
                sizes="(max-width: 768px) 100vw, 230px"
                className="object-cover"
              />
            </div>

            <div className="relative mx-auto aspect-square w-full max-w-[230px] overflow-hidden rounded-[14px] bg-[#f3f3f3] md:mx-0">
              <Image
                src="/images/office/office-marriage-sub.webp"
                alt="혼인성사 준비 이미지"
                fill
                sizes="(max-width: 768px) 100vw, 230px"
                className="object-cover"
              />
            </div>
          </div>

          <div className="space-y-6 text-[15px] leading-7 text-[#2f3136]">
            <div className="space-y-2">
              <p>
                혼인성사는 남녀가 하느님 앞에서 서로 사랑하고 존중하며 평생을
                함께 살아갈 것을 약속하는 가톨릭 교회의 성사입니다. 두 사람이
                사랑을 단순한 약속을 넘어 하느님의 축복 안에서 이루어지는 거룩한
                결합으로 받아들이며, 부부는 서로를 돕고 사랑하며 가정을 이루고
                생명의 소중함을 지키며 신앙 안에서 살아가도록 부르심을 받습니다.
                가톨릭 교회는 혼인을 통해 이루어지는 가정을 "
                <span className="font-semibold text-[#252629]">가정 교회</span>
                "라고 부르며, 신앙과 사랑을 전하는 공동체로 소중하게 여깁니다.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#252629]">
                혼인성사 준비 안내
              </h3>
              <p>
                혼인성사를 위해서는 교회의 규정에 따라 미리 준비 과정을 거쳐야
                합니다.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#252629]">혼인 면담</h3>
              <p>
                혼인을 준비하는 예비부부는 주일 신부님과의 혼인 면담을 통해
                혼인성사에 대한 안내를 받습니다.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#252629]">혼인 강좌</h3>
              <p>
                가톨릭 교회에서는 예비부부가 신앙 안에서 가정을 준비할 수 있도록
                혼인 강좌 참여를 권장합니다.
              </p>
              <p>혼인 강좌에서는 다음과 같은 내용을 다룹니다.</p>
              <div className="space-y-1">
                {COURSE_TOPICS.map((topic) => (
                  <p key={topic}>{topic}</p>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#252629]">
                혼인성사 신청 방법
              </h3>
              <p className="font-semibold text-[#b1232a]">
                * 혼인성사를 희망하는 예비부부는 혼인 예정일 최소 3~6개월 전에
                본당 사무실로 문의해 주시기 바랍니다.
              </p>
              <p>신청 절차는 다음과 같습니다.</p>
              <div className="space-y-1">
                {APPLICATION_STEPS.map((step) => (
                  <p key={step}>{step}</p>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#252629]">
                혼인성사 준비 서류 (일반 안내)
              </h3>
              <p>혼인성사 준비를 위해 다음과 같은 서류가 필요할 수 있습니다.</p>
              <div className="space-y-1">
                {REQUIRED_DOCS.map((doc) => (
                  <p key={doc}>{doc}</p>
                ))}
              </div>
              <p className="font-semibold text-[#b1232a]">
                * 필요한 서류는 상황에 따라 달라질 수 있으므로 본당 사무실에서
                자세히 안내해 드립니다.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#252629]">
                문의 및 신청
              </h3>
              <p>
                혼인성사 상담 및 일정 문의는 본당 사무실로 연락해 주시기
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
