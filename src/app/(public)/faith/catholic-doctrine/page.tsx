import Image from "next/image"

import { SubLanding } from "@/components/SubLanding"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type DoctrineBlock = {
  readonly heading?: string
  readonly paragraphs?: readonly string[]
  readonly bullets?: readonly string[]
  readonly note?: string
}

type DoctrineSection = {
  readonly id: string
  readonly title: string
  readonly imageSrc: string
  readonly imageAlt: string
  readonly blocks: readonly DoctrineBlock[]
}

const doctrineSections: readonly DoctrineSection[] = [
  {
    id: "catholic-intro",
    title: "가톨릭(Catholic) 소개",
    imageSrc: "/images/faith/faith-doctrine-catholic-intro.webp",
    imageAlt: "가톨릭 교회를 상징하는 성당 내부 이미지",
    blocks: [
      {
        paragraphs: [
          "가톨릭(Catholic)이라는 말은 라틴어 Catholicus에서 유래한 말로, ‘보편된’, ‘온 세상을 향한’이라는 뜻을 가지고 있습니다.",
          "가톨릭 교회는 특정한 민족이나 계층만을 위한 종교가 아니라, 세상의 모든 사람을 향해 열려 있는 신앙 공동체입니다.",
          "인종과 문화, 빈부와 학식의 차이를 넘어 누구나 하느님의 사랑을 깨닫고 참된 신앙 안에서 살아가도록 초대합니다.",
          "또한 가톨릭 교회는 예수 그리스도의 가르침을 바탕으로 오랜 역사 속에서 이어져 온 신앙과 전통을 통해 인간의 삶과 구원에 대한 보편적인 진리를 전하고 있습니다.",
          "이처럼 모든 사람에게 열려 있고, 온 세상에 복음을 전하고자 하는 사명을 지닌 교회이기에 우리는 이를 ‘가톨릭 교회’, 곧 보편된 교회라고 부릅니다.",
        ],
      },
    ],
  },
  {
    id: "mary",
    title: "교회의 어머니요 모범이신 성모 마리아",
    imageSrc: "/images/faith/faith-doctrine-mary.webp",
    imageAlt: "성모 마리아 성화 이미지",
    blocks: [
      {
        heading: "구약에 예언된 마리아",
        paragraphs: [
          "성서는 인류의 구원 계획에 있어서 구세주의 어머니인 한 여자의 모습과 그 역할을 제시하고 있다.",
          "창세기에는 죄에 떨어진 원조에게 주어진 뱀에 대한 승리의 약속이 그 여자에게 암시되어 있다.",
          "또 예언서에는 그 여자가 아들을 잉태하여 낳을 동정녀이며 그 아들은 ‘임마누엘’이라고 불릴 것이라는 예언이 있다.",
        ],
      },
      {
        heading: "구원의 협조자이신 마리아",
        paragraphs: [
          "하느님은 여자(하와)가 죽음을 가져왔던 것처럼 여자(마리아)가 영원한 생명에 이바지하기를 원하셨다.",
          "그리하여 천사 가브리엘을 처녀 마리아에게 보내시어 이 뜻을 전하자, 마리아는 절대적인 신뢰와 순종으로 이에 응답했다.",
          "마리아는 이 세상에 예수님을 낳으심으로 하느님의 구원사업에 동참하셨고, 또한 예수님의 십자가 죽음의 자리를 지켜며 함께 고통을 당하시고, 세상을 떠나는 마지막 순간까지 함께 계심으로써 하느님의 구원 계획의 협조자가 되셨다.",
        ],
      },
      {
        heading: "구세주의 어머니, 우리의 어머니",
        paragraphs: [
          "마리아는 예수님의 어머니이시다. 그런데 예수님은 인간인 동시에 하느님이시기에 마리아는 또한 하느님의 어머니도 되신다.",
          "예수께서는 십자가에서 숨을 거두시기 직전에 당신의 어머니와 제자 요한 사이에 모자(母子)관계를 맺어 주셨다.",
          "“예수께서는 어머니에게 ‘어머니, 이 사람이 어머니의 아들입니다.’하고 말씀하셨다. 이때부터 그 제자는 마리아를 자기 집에 모셨다.”",
          "이로써 예수의 사랑을 받은 모든 그리스도인은 마리아의 자녀가 되고 마리아는 어머니가 되신다.",
        ],
      },
      {
        heading: "교회의 모범인 마리아",
        paragraphs: [
          "마리아는 구세주의 어머니요 우리의 어머니시며, 인류 구원을 위한 하느님의 협조자로서 당신의 은혜와 역할을 세상 끝날까지 계속하신다.",
          "그러므로 교회는 마리아의 성덕을 본받아 이 세상에 복음을 전하며 세상사로서 새 자녀를 낳아준다.",
          "하느님께서는 인간인 마리아를 통하여 큰 일을 하셨으므로 교회는 마리아를 통하여 하느님께 찬미와 영광을 드리는 것이다.",
        ],
      },
      {
        heading: "마리아를 공경하는 이유",
        paragraphs: [
          "예수님이 사시던 곳과 활동하시던 곳을 성지(聖地)라 한다면 예수님을 낳으신 어머니를 성모(聖母)라 부르는 것은 당연한 일이다.",
          " 성서에 나타난 마리아는 하느님의 뜻을 단순하고 완전한 신앙으로 받아들여 예수님 어머니가 될 것을 수락하셨고, 온 인간에게 인간이신 예수님을 낳아주셨다.",
          "마리아의 생애는 침묵 속에 숨겨졌지만, 성서에서는 인간을 그리스도께 다가가도록 하는 데 중요한 역할을 수행하셨음을 찾아볼 수 있다.",
          "우리가 예수님을 구세주로 받아들인다면 그분을 낳으신 어머니도 마땅히 공경해야 할 것이다. ",
          "그러나 ‘마리아에게 드리는 기도와 하느님께 드리는 기도는 그 내용이 분명히 다르다.’ 하느님께 기도할 때는 직접 무엇을 해달라고 청하지만 마리아께는 우리와 함께 우리가 원하는 바를 하느님께 전구해 달라고 청하는 것이다.",
          "그러므로 마리아께 기도할 때는 항상 ‘저희를 위하여 빌어주소서.’라고 한다.",
        ],
      },
    ],
  },
  {
    id: "christ",
    title: "그리스도(Christus)",
    imageSrc: "/images/faith/faith-doctrine-christ.webp",
    imageAlt: "예수 그리스도 성화 이미지",
    blocks: [
      {
        paragraphs: [
          "그리스도는 ‘기름으로 발려진 사람’이란 뜻이다.",
          "구약법에 의하면 사제가 될 때(출애 28,41; 레위 4,3), 왕이 될 때(Ⅰ열왕 19,16), 또는 예언자들의 사명을 가지기 위해서(이사 61,1) 기름을 발랐다.",
          "그리스도란 말은 하나의 고유명사가 아니고 칭호다.",
          "하느님의 아들을 그리스도라 하는 것은 그분이 왕직, 사제직, 예언직의 세 가지 임무를 띠신 분이라는 뜻이다.",
        ],
      },
    ],
  },
  {
    id: "prayer",
    title: "기도",
    imageSrc: "/images/faith/faith-doctrine-prayer.webp",
    imageAlt: "기도하는 손 이미지",
    blocks: [
      {
        paragraphs: [
          "기도는 하느님과 인간의 인격적 만남이요 대화로서, 자신의 정신과 마음과 몸을 하느님께로 향하여 그분의 말씀을 듣고 생활을 통해서 응답하는 그리스도인의 신앙행위이다.",
          "인간 육신 생명이 살아가기 위해 음식을 먹어야 하듯이 그리스도인으로 살아가기 위한 영혼의 양식이 곧 기도이므로 매일 매 순간 기도하는 생활을 해야 한다.",
        ],
      },
      {
        heading: "기도의 자세",
        bullets: [
          "1. 고요한 마음가짐을 지녀야 한다.",
          "- 머리 속의 온갖 근심, 걱정 등 잡념을 버려야 한다.",
          "2. 살아계신 하느님, 전능하신 하느님께 전적으로 의탁하라.",
          "- 항구한 신뢰심을 가져라.",
          "3. 하느님의 현존을 느껴라.",
          "- 지금 이 자리에 나와 함께 하신다는 믿음으로 자신의 마음을 열어라.",
          "4. 하느님의 뜻을 찾아라.",
          "- 자신의 필요한 바에 매달리지 말라.",
          "5. 항구한 마음으로 구하라.",
          "- 하느님 안에 실망이란 것은 없다는 것을 믿어라.",
        ],
      },
      {
        heading: "기도의 목적",
        bullets: [
          "1. 흠숭 : 절대자이신 하느님께만 드리는 찬미의 행위이다.",
          "2. 감사 : 은혜를 베풀어 주심에 감사하라. - 작은 일에도...",
          "3. 용서 : 생각과 말과 행동으로 잘못한 죄에 대해 뉘우치고 용서를 빌어야 한다.",
          "4. 간구 : 구원을 위하여, 진리를 위하여 현세적으로 필요한 것들을 성인을 통하여 청한다.",
        ],
      },
      {
        heading: "기도의 종류",
        bullets: [
          "1. 소리(염경)기도 : 어떤 기도문의 뜻을 마음 속으로 생각하며 기도문을 정성되이 소리내어 외는 것으로, 개인적으로 또는 여럿이 공동으로 하는 것. (예 : 미사경본, 기도서, 묵주기도)",
          "2. 마음(묵상)기도 : 주님께서 내 앞에 현존하심과 그 앞에 자신의 마음 깊은 곳에서, 영신 사정에 대해 관찰하면서, 주님의 말씀과 진리를 알고자 깊이 생각하면서 자신을 성찰하고 주님과 대화하는 가운데 일치하는 것. (묵상재료는 자연, 성서의 말씀, 교회의 가르침)",
        ],
        note: "* 출처 : 명동대성당",
      },
    ],
  },
]

export default function Page() {
  return (
    <>
      <SubLanding title="" sectionLabel="신앙생활" currentLabel="가톨릭 교리" />

      <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#252629] md:text-3xl">
              가톨릭 교리
            </h2>
          </div>

          <Accordion
            type="multiple"
            defaultValue={doctrineSections.map((section) => section.id)}
            className="space-y-4"
          >
            {doctrineSections.map((section) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="overflow-hidden rounded-none border-b-0 bg-white"
              >
                <AccordionTrigger className="px-0 py-0 hover:no-underline">
                  <div className="flex w-full items-center justify-between px-0 py-0">
                    <span className="text-left text-[17px] font-semibold text-[#252629] md:text-[19px]">
                      {section.title}
                    </span>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pt-4 pb-0">
                  <div className="bg-[#f6f6f6] px-4 py-4 md:px-5 md:py-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start">
                      <div className="relative mx-auto h-[144px] w-[130px] shrink-0 overflow-hidden rounded-[10px] md:mx-0">
                        <Image
                          src={section.imageSrc}
                          alt={section.imageAlt}
                          fill
                          sizes="130px"
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-5 text-[14px] font-medium leading-[1.4] text-[#252629]">
                        {section.blocks.map((block) => (
                          <div
                            key={`${section.id}-${block.heading ?? block.paragraphs?.[0] ?? "block"}`}
                            className="space-y-2"
                          >
                            {block.heading ? (
                              <h3 className="text-[14px] font-semibold leading-[1.4] text-[#252629]">
                                {block.heading}
                              </h3>
                            ) : null}

                            {block.paragraphs?.map((paragraph) => (
                              <p key={paragraph} className={"leading-[1.4]"}>
                                {paragraph}
                              </p>
                            ))}

                            {block.bullets ? (
                              <div className="space-y-1.5">
                                {block.bullets.map((bullet) => (
                                  <p key={bullet} className="leading-[1.4]">
                                    {bullet}
                                  </p>
                                ))}
                              </div>
                            ) : null}

                            {block.note ? (
                              <p className="pt-1 text-[13px] text-[#5f636b]">
                                {block.note}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  )
}
