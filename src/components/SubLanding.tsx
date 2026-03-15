import { Home } from "lucide-react"
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
}

export function SubLanding({
  title,
  sectionLabel,
  currentLabel,
  imageUrl,
}: SubLandingProps) {
  const resolvedImageUrl =
    imageUrl ??
    sectionImageMap[sectionLabel] ??
    "/images/sub-landing-default.webp"

  return (
    <section className="relative h-[280px] overflow-hidden md:h-[320px]">
      <Image
        src={resolvedImageUrl}
        alt={`${title} 서브 비주얼`}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,14,0.50)_0%,rgba(8,10,14,0.22)_38%,rgba(8,10,14,0.40)_100%)]" />

      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto flex w-full max-w-[1380px] items-end justify-between px-5 pb-7 md:px-8">
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-white md:text-[34px]">
            {title}
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
  )
}
