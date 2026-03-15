import { SubLanding } from "@/components/SubLanding"

export default async function CatechumenClassPage() {
  return (
    <>
      <SubLanding
        title=""
        sectionLabel="본당업무"
        currentLabel="예비신자 교리"
      />

      <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
        <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#252629]">
          예비신자 교리
        </h2>

        <div className="mt-6 space-y-9 text-[15px] leading-[1.8] text-[#2f3136]">
          <article className="space-y-2.5">
            <h3 className="text-base font-bold text-[#b1232a]">
              • 예비신자 입교안내
            </h3>
            <p>
              천주교 신자가 되기위해서는 세례성사를 받아야 합니다.
              <br />
              세례성사를 받기 위해서는 교회의 가르침을 배우는 예비자교리 과정을
              이수하여야 합니다.
            </p>

            <div className="mt-4 bg-[#f2f2f2] px-6 py-5 text-sm leading-[1.7] text-[#3f434b]">
              <p className="font-bold text-[#252629]">예비자 교리 과정 안내</p>
              <p className="mt-2">
                구로3동 성당은 3월경마다 새로운 예비신자 교리가 시작됩니다.
              </p>
              <p className="mt-1">- 교육기간 : 총 8개월</p>
              <p className="mt-1">
                - 교육과정 : 매주 1회 1시간 (화요일 저녁8시 반, 주일 낮12시 반)
              </p>
              <p className="mt-1">- 문의 : 본당 사무실 (Tel. 02-857-8541)</p>
            </div>
          </article>

          <article className="space-y-2.5">
            <h3 className="text-base font-bold text-[#b1232a]">
              • 유아세례 안내
            </h3>
            <p>
              그리스도교에서 어린이에게 베푸는 세례로서 어린이가 물 또는
              성별세김으로써
              <br />
              하느님께 바쳐 하느님의 은총 속에서 기르겠다는 부모의 서약 아래
              예식을 진행합니다.
            </p>

            <div className="mt-4 bg-[#f2f2f2] px-6 py-5 text-sm leading-[1.7] text-[#3f434b]">
              <p className="font-bold text-[#252629]">유아세례 일정</p>
              <p className="mt-2.5 font-semibold text-[#b1232a]">
                * 부모는 유아세례 전날 실시하는 부모교육에 반드시 참석하여
                교회가 가르치는 부모의 역할을 배워야 합니다.
              </p>
              <p className="mt-2">
                - 일 시 : 3월, 6월, 9월, 12월 네 번째 토요일 16:00
              </p>
              <p className="mt-1">
                - 유아세례 부모 교육 : 유아세례 전날 금요일 20:00
              </p>
              <p className="mt-1">- 문의 : 본당 사무실 (Tel. 02-857-8541)</p>
            </div>
          </article>
        </div>
      </section>
    </>
  )
}
