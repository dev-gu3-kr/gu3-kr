import Image from "next/image"
import { AppLink as Link } from "@/components/AppLink"
import type { HomeQuickLinkItem } from "@/features/home/isomorphic"

type HomeHeroSectionProps = {
  readonly quickLinks: readonly HomeQuickLinkItem[]
}

export function HomeHeroSection({ quickLinks }: HomeHeroSectionProps) {
  return (
    <section className="relative min-h-[640px] overflow-hidden bg-[#130f0e] text-white md:min-h-[860px]">
      <Image
        src="/images/home-hero-visual.webp"
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

      <div className="relative mx-auto flex min-h-[640px] w-full max-w-[1380px] items-end px-5 pb-[148px] pt-28 md:min-h-[860px] md:px-8">
        <div className="w-full" />
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-[rgba(37,38,41,0.86)]">
        <div className="mx-auto px-5 py-4 md:max-w-[1380px] md:px-8 md:py-[14px]">
          <div className="mx-auto md:hidden">
            <div className="-mx-5 overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-hidden">
              <div className="flex min-w-max gap-4 px-5">
                {quickLinks.map((item) => {
                  const Icon = item.icon

                  const className =
                    "group flex h-[92px] w-[92px] shrink-0 basis-[92px] flex-col items-center justify-center rounded-xl bg-transparent text-center transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-white/14"

                  const content = (
                    <>
                      <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-transparent transition-colors group-hover:bg-white/6">
                        <Icon className="size-9 shrink-0 transition-opacity group-hover:opacity-90" />
                      </div>
                      <span className="text-[13px] font-medium tracking-[-0.02em] text-white">
                        {item.label}
                      </span>
                    </>
                  )

                  if (item.href) {
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={className}
                      >
                        {content}
                      </Link>
                    )
                  }

                  return (
                    <button
                      key={item.label}
                      type="button"
                      className={className}
                    >
                      {content}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mx-auto hidden md:flex md:flex-nowrap md:items-stretch md:justify-between md:gap-2 xl:gap-7">
            {quickLinks.map((item) => {
              const Icon = item.icon

              const className =
                "group flex min-h-[92px] min-w-0 flex-1 flex-col items-center justify-center rounded-xl bg-transparent px-2 text-center transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-white/14 xl:min-h-[120px] xl:min-w-[112px] xl:px-0"

              const content = (
                <>
                  <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-transparent transition-colors group-hover:bg-white/6 xl:size-[60px]">
                    <Icon className="size-9 shrink-0 transition-opacity group-hover:opacity-90 xl:size-10" />
                  </div>
                  <span className="text-[13px] font-medium leading-tight tracking-[-0.02em] text-white xl:text-sm">
                    {item.label}
                  </span>
                </>
              )

              if (item.href) {
                return (
                  <Link key={item.label} href={item.href} className={className}>
                    {content}
                  </Link>
                )
              }

              return (
                <button key={item.label} type="button" className={className}>
                  {content}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
