import { ChevronRight, Home } from "lucide-react"
import Image from "next/image"

type SubLandingProps = {
  readonly title: string
  readonly sectionLabel: string
  readonly currentLabel: string
  readonly imageUrl?: string
}

const sectionImageMap: Record<string, string> = {
  본당알림: "/images/sub-landing-notice.webp",
  본당업무: "/images/office/office-landing-hero.webp",
  "공동체 마당": "/images/community/community-landing-hero.webp",
  "청소년 마당": "/images/youth/youth-landing-hero.webp",
  신앙생활: "/images/faith/faith-landing-hero.webp",
}

export function SubLanding({
  title,
  sectionLabel,
  currentLabel,
  imageUrl,
}: SubLandingProps) {
  // 기존 호출부의 빈 title도 현재 메뉴명을 대표 제목과 이미지 설명으로 사용한다.
  const resolvedTitle = title.trim() || currentLabel
  const resolvedImageUrl =
    imageUrl ??
    sectionImageMap[sectionLabel] ??
    "/images/sub-landing-default.webp"

  return (
    <>
      <section className="relative h-[280px] overflow-hidden md:h-[320px]">
        <Image
          src={resolvedImageUrl}
          alt={`${resolvedTitle} 서브 비주얼`}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,14,0.50)_0%,rgba(8,10,14,0.22)_38%,rgba(8,10,14,0.40)_100%)]" />

        <div className="absolute inset-x-0 bottom-0 hidden md:block">
          <div className="mx-auto flex w-full max-w-[1380px] items-end justify-between px-5 pb-7 md:px-8">
            <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-white md:text-[34px]">
              {resolvedTitle}
            </h1>

            <div className="inline-flex items-center gap-1.5 text-xs text-white/90 md:text-sm">
              <Home className="size-3.5 md:size-4" />
              <span>{sectionLabel}</span>
              <span aria-hidden>›</span>
              <span className="font-medium text-white">{currentLabel}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="border-b border-[#eceef2] bg-white md:hidden">
        <div className="mx-auto flex w-full max-w-[1380px] items-center gap-2 px-5 py-6 text-[#252629]">
          <Home className="size-[22px] shrink-0" strokeWidth={2.4} />
          <span className="text-[18px] font-semibold tracking-[-0.02em]">
            {sectionLabel}
          </span>
          <ChevronRight
            className="size-[20px] shrink-0 text-[#252629]"
            strokeWidth={2.1}
          />
          <span className="text-[18px] font-semibold tracking-[-0.02em]">
            {currentLabel}
          </span>
        </div>
      </div>
    </>
  )
}
