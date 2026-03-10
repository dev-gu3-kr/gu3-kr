import Image from "next/image"

import { SubLanding } from "@/components/SubLanding"

const salesianSpiritIntro = [
  <>
    &apos;살레시오&apos;란 온유의 성인, 애덕의 박사로 불리는 프란치스코 살레시오
    성인(St. Francis de Sales 1564-1622)의 성(姓)을 가리킵니다. 살레시오회의
    창립자{" "}
    <span className="font-semibold text-[#2563eb] underline decoration-[#2563eb]/70 underline-offset-2">
      성 요한 보스코
    </span>
    는 하느님께서 자신에게 맡기신 청소년 영혼구원 사명을 보다 효과적으로
    실현하는 데 필요한 가장 필요한 마음 자세가 프란치스코 살레시오 성인이 지녔던
    온유한 마음이라고 생각하였기에, 자신이 창립한 수도회 명칭 역시
    &apos;살레시오회&apos;라고 정하였습니다.
  </>,
  "오늘날 돈보스코의 제자들을 가리켜 살레시안이라고 부릅니다. 마찬가지로 살레시안들이 추구하는 영성도 '돈보스코 영성'이란 용어보다 '살레시오 영성'이란 용어를 더 즐겨 사용합니다.",
  "살레시오 영성은 '나에게 영혼을 달라. 나머지는 다 가져가라(Da mihi animas cetera tolle)'라는 돈보스코의 모토 안에 잘 드러납니다. 청소년들의 영혼구원을 위해 창안한 예방교육은 이성, 종교, 친절이라는 세 영역 안에 종합되어 있고, 더불어 성체성사와 도움이신 성모님, 교황님에 대한 사랑 안에 살레시오 영성의 신심적 차원이 요약되어 있습니다.",
] as const

const salesianSpiritBody = [
  "살레시오 영성은 청소년들이 뛰어놀던 운동장과 그들이 공부하던 교실 안에서, 그리고 가난한 청소년들의 일터에서, 돈보스코와 청소년들 사이의 관계 안에서 확대되고 무르익어 갔습니다. 그의 영성은 치열하고 절박하며 구체적인 만남을 통해 보다 육화되고, 하느님과 이웃에 대한 구체적인 사랑으로 실현된 영성이었습니다. 돈보스코는 가장 도움이 필요한 이웃을 가난한 청소년들 안에서 발견했습니다. 그리고 그는 그들 가운데 투신하였습니다.",
  "그는 다음과 같이 단언하였습니다. '나는 여러분을 위하여 공부하고, 여러분을 위하여 일하며, 여러분을 위하여 살고, 여러분을 위하여 나의 생명까지 바칠 각오가 되어 있습니다.' 청소년들에 대한 사랑, 이것은 한 사제로서 그가 걸어간 사도적 활동이었고, 자신을 온전히 바쳐 그리스도를 따르는 구체적인 방법이었습니다. 돈보스코는 '예방 교육제도(preventive system)'를 도입하여 청소년들의 교육과 지도에 힘썼는데, 이 교육방법은 교육사에 획기적으로 공헌했을 뿐 아니라 영성사 안에서 독특한 교육 영성의 장을 이룩하였습니다. 그리스도를 본받는 참된 인간적, 영적 양성을 목표로 합니다.",
  "돈보스코의 교육은 언제나 복음적 사랑 속에서 자유롭고 즐겁게 행해졌으며 평화롭고 신뢰에 찬 가족적인 분위기를 지향하며 이루어졌습니다. 요한 보스코는 개인적인 만남과 대화의 시간들을 영성지도의 기회로 적절히 이용했으며 흔히 고해성사로 끝나도록 했습니다.",
  "그는 또한 밤 인사(Buona notte) 시간을 교육의 좋은 기회로 활용하였습니다. 그는 가능하면 처벌보다는 칭찬을 통해 그들이 올바른 행동을 계속 실천하도록 하였고, '귓속말'이라는 독특한 방법으로 효율적인 권고와 훈계를 하였습니다.",
] as const

const donBoscoParagraphs = [
  "1815년 8월 16일, 이탈리아 토리노 근교의 시골마을 베키에서 태어난 요한 보스코는 일찍이 두 살 때 아버지를 여의고 가난한 환경에서 성장했습니다. 마가리타 오키에나의 보살핌을 받으며 다른 두 형제들과 함께 힘든 유년기를 보냈고, 어린 시절 꾼 꿈은 그의 일생을 계시해주는 것으로 널리 알려져 있습니다.",
  "그 꿈을 계기로 요한 보스코는 사제성소에 대한 열망을 갖게 되지만, 가난한 과부의 아들로서 공부를 할 수 있는 여건이 마련되지 않아 남의 집 머슴살이나 상점의 점원 또는 직공 등을 하면서 신부가 되는 데 필요한 공부의 길을 찾습니다. 남들보다 늦게 공부한 탓에 그는 스물여섯 살이 되던 1841년 토리노 교구의 사제로 서품됩니다. 사제가 된 요한 보스코 신부가 가장 먼저 한 일은 소년원에 수감되어 있는 소년죄수들을 찾아보는 것이었습니다.",
  "당시 이탈리아 사회는 공업화가 한창 진행되고 있었으므로 시골에서 일자리를 찾아 도시로 몰려드는 청소년들로 인한 많은 혼란이 있었습니다. 도시에 안정적인 거처를 마련하지 못한 젊은이들은 쉽게 범죄의 상황에 빠지게 되었고, 교도소는 항상 넘쳐나고 있었습니다.",
  "보스코 신부는 버림받은 청소년들이 그들을 돌보아주고 곁에 있어주고 정직한 주인 밑에서 일할 수 있도록 여건을 마련해 주면 정직한 시민과 착한 그리스도인으로 거듭날 수 있다는 것을 체험으로 간파합니다. 그래서 보살펴주는 이가 아무도 없는 소년들을 위하여 '오라토리오'라 부르는 기숙사를 세워 의식주를 마련해 주고, 일자리를 얻는 데 필요한 기술과 공부를 가르쳐주는 일을 시작합니다.",
  "그의 보살핌을 받는 소년들의 숫자가 점점 늘어나자 보스코 신부는 많은 평신도들을 영입하여 자신의 일을 돕게 합니다. 특히 보살핌을 받고 있는 소년들 가운데서 보다 성숙한 젊은이들이 보스코 신부를 적극적으로 도왔으며, 이들을 주축으로 하여 수도회를 창설하기에 이릅니다.",
  "초창기 오라토리오의 600명이 넘는 소년들은 모두가 자신이 보스코 신부의 각별한 사랑을 받고 있다는 것을 절실히 느끼고 있었습니다. 이와 같이 느껴지는 각별한 사랑의 신비감으로 인하여 소년들은 보스코 신부를 부르면서 자신의 삶을 의지하였습니다. 그래서 많은 젊은이들이 이는 수도자가 된 것이 무엇을 의미하는지를 깊이 파악하지도 않고 단지 돈보스코와 함께 일하는 것이라면 기꺼이 일생을 바칠 수 있다고 하면서 참여하였고, 이렇게 해서 1859년 살레시오 수도회는 탄생하여 1869년 교황청의 정식 승인을 받습니다.",
  "보스코 신부는 살레시오 수도회에 이어 '살레시오 수녀회'와 평신도 단체인 '살레시오 협력자회'를 창설하여 남녀 청소년들을 위한 교육 사도직의 기틀을 확고히 다졌습니다. 청소년들, 특히 가난한 청소년들을 위하여 학교, 기숙사, 기술학교, 주일학교, 야간학교 등 다양한 교육기회를 제공한 요한 보스코 신부는 19세기의 가장 훌륭한 교육자이며, 동시에 수천 권이 넘는 책을 집필한 경이로운 작가이자 사회변혁의 순간에 교회를 적극적으로 옹호한 호교론자이며, 청소년 교육이라는 새로운 영성을 교회 안에 심은 대영성가이기도 합니다.",
  "'나는 청소년 여러분을 위하여 일하며, 공부하고, 나의 생의 모든 것을 바칠 각오가 되어 있습니다.'라는 확신처럼 돈 보스코는 자신의 모든 것을 청소년, 특히 보다 가난한 청소년을 위해 다 내어주고 1888년 1월 31일에 선종합니다. 그리고 1934년 부활절, 교황 비오 11세에 의해 성인으로 반포되어 '청소년들의 아버지요 스승'이라는 칭호를 받습니다.",
] as const

export default async function SalesiansPage() {
  return (
    <>
      <SubLanding
        title=""
        sectionLabel="구로3동 성당"
        currentLabel="살레시오회"
      />

      <section className="mx-auto w-full max-w-[1220px] px-5 py-10 md:px-8 md:py-14">
        <div className="space-y-16">
          <article className="space-y-7">
            <header className="space-y-2">
              <h2 className="text-[30px] font-semibold tracking-[-0.03em] text-[#252629]">
                살레시오회
              </h2>
            </header>

            <div className="grid gap-7 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
              <div className="flex min-h-[260px] items-center justify-center p-2 md:min-h-[320px]">
                <div className="flex h-[310px] w-full max-w-[360px] items-center justify-center bg-neutral-100">
                  <div className="relative h-[230px] w-[230px]">
                    <Image
                      src="/images/salesians-emblem.png"
                      alt="살레시오회 엠블럼"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-[15px] leading-8 text-neutral-700">
                {salesianSpiritIntro.map((paragraph) => (
                  <p key={paragraph.toString()}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="space-y-4 text-[15px] leading-8 text-neutral-700">
              {salesianSpiritBody.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>

          <div className="border-t border-neutral-200" />

          <article className="space-y-7">
            <header className="space-y-2">
              <h2 className="text-[30px] font-semibold tracking-[-0.03em] text-[#252629]">
                돈 보스코 성인
              </h2>
            </header>

            <div className="grid gap-7 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
              <div className="flex min-h-[260px] items-center justify-center p-2 md:min-h-[320px]">
                <div className="flex h-[310px] w-full max-w-[360px] items-center justify-center bg-neutral-100">
                  <div className="relative h-[260px] w-[210px]">
                    <Image
                      src="/images/don-bosco-portrait.png"
                      alt="돈 보스코 성인 초상화"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-[15px] leading-8 text-neutral-700">
                {donBoscoParagraphs.slice(0, 3).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="space-y-4 text-[15px] leading-8 text-neutral-700">
              {donBoscoParagraphs.slice(3).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        </div>
      </section>
    </>
  )
}
