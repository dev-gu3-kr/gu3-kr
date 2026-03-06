import Image from "next/image"
import type { HomeQuickLinkItem } from "@/features/home/isomorphic"

type HomeHeroSectionProps = {
  readonly quickLinks: readonly HomeQuickLinkItem[]
}

export function HomeHeroSection({ quickLinks }: HomeHeroSectionProps) {
  return (
    <section className="relative min-h-[760px] overflow-hidden bg-[#130f0e] text-white md:min-h-[860px]">
      <Image
        src="/images/visual01 1.jpg"
        alt="구로3동성당 메인 비주얼"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,217,163,0.12),_transparent_28%),linear-gradient(180deg,_rgba(17,12,10,0.08)_0%,_rgba(17,12,10,0.12)_30%,_rgba(17,12,10,0.74)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,_rgba(255,241,214,0.32)_0%,_rgba(231,214,189,0.20)_32%,_rgba(124,82,48,0.14)_57%,_rgba(31,18,12,0.52)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-[56%] bg-[repeating-linear-gradient(90deg,_rgba(85,50,27,0.10)_0,_rgba(85,50,27,0.10)_2px,_transparent_2px,_transparent_64px)] opacity-60" />
      <div className="absolute inset-x-[8%] top-[12%] h-[26%] rounded-[50%] border border-white/10 bg-white/5 blur-3xl" />

      <div className="relative mx-auto flex min-h-[760px] w-full max-w-[1380px] items-end px-5 pb-[148px] pt-28 md:min-h-[860px] md:px-8">
        <div className="w-full" />
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-[rgba(37,38,41,0.86)]">
        <div className="mx-auto px-5 py-4 md:max-w-[1380px] md:px-8 md:py-[14px]">
          <div className="mx-auto grid max-w-[792px] grid-cols-3 gap-x-4 gap-y-3 md:grid-cols-3 xl:grid-cols-6 xl:gap-x-7 xl:gap-y-0">
            {quickLinks.map((item, index) => {
              const Icon = item.icon
              const isEmphasized = index === 0

              return (
                <button
                  key={item.label}
                  type="button"
                  className={`group flex min-h-[84px] flex-col items-center justify-center rounded-xl text-center transition-transform hover:-translate-y-0.5 md:min-h-[92px] xl:min-h-[120px] ${
                    isEmphasized
                      ? "bg-white/14 xl:min-w-[112px]"
                      : "bg-transparent"
                  }`}
                >
                  <div
                    className={`mb-2 flex size-11 items-center justify-center overflow-hidden rounded-xl md:size-12 xl:size-[60px] ${
                      isEmphasized ? "bg-white/6" : "bg-transparent"
                    }`}
                  >
                    <Icon
                      className="size-6 text-white transition-opacity group-hover:opacity-90 md:size-7"
                      strokeWidth={1.6}
                    />
                  </div>
                  <span className="text-[13px] font-medium tracking-[-0.02em] text-white md:text-sm">
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
