import { SubLanding } from "@/components/SubLanding"

export default async function AboutPage() {
  return (
    <>
      <SubLanding
        title="본당 소개"
        sectionLabel="구로3동 성당"
        currentLabel="본당 소개"
      />

      <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
        <div className="space-y-8">
          <header className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#252629] md:text-3xl">
              구로3동 성당을 소개합니다
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-neutral-600 md:text-base">
              구로3동 성당은 복음의 기쁨을 함께 나누며, 기도와 전례, 교육과 나눔
              안에서 지역과 함께 성장하는 신앙 공동체입니다. 누구에게나 열린
              마음으로 환대하며, 신앙의 여정을 함께 걸어갑니다.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-neutral-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-[#252629]">
                본당 사명
              </h3>
              <p className="mt-3 text-sm leading-7 text-neutral-600">
                말씀과 성사 안에서 하느님을 만나고, 이웃 사랑을 실천하는
                공동체를 지향합니다. 세대와 계층을 넘어 모두가 참여하는 전례와
                교육, 봉사를 통해 살아있는 본당 문화를 만들어 갑니다.
              </p>
            </article>

            <article className="rounded-xl border border-neutral-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-[#252629]">
                공동체 비전
              </h3>
              <p className="mt-3 text-sm leading-7 text-neutral-600">
                청소년부터 어르신까지 각자의 자리에서 신앙을 키우고, 지역사회와
                함께 호흡하는 본당을 지향합니다. 기도와 친교, 봉사 안에서 모두가
                서로의 힘이 되는 공동체를 만들어 갑니다.
              </p>
            </article>
          </div>

          <article className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
            <h3 className="text-lg font-semibold text-[#252629]">안내</h3>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-neutral-700">
              <li>• 주소: 서울특별시 구로구 디지털로27길 82</li>
              <li>• 대표전화: 02-857-8541</li>
              <li>
                • 사무실 운영시간: 평일 09:00 - 18:00 (점심시간 12:00 - 13:00)
              </li>
            </ul>
          </article>
        </div>
      </section>
    </>
  )
}
