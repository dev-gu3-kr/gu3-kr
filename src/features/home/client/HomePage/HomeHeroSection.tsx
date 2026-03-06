import type { HomeQuickLinkItem } from "@/features/home/isomorphic"

type HomeHeroSectionProps = {
  readonly quickLinks: readonly HomeQuickLinkItem[]
}

export function HomeHeroSection({ quickLinks }: HomeHeroSectionProps) {
  return (
    <section className="relative min-h-[760px] overflow-hidden bg-[#130f0e] text-white md:min-h-[860px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,217,163,0.18),_transparent_28%),linear-gradient(180deg,_rgba(17,12,10,0.10)_0%,_rgba(17,12,10,0.18)_30%,_rgba(17,12,10,0.78)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,_rgba(255,241,214,0.92)_0%,_rgba(231,214,189,0.58)_32%,_rgba(124,82,48,0.34)_57%,_rgba(31,18,12,0.78)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-[56%] bg-[repeating-linear-gradient(90deg,_rgba(85,50,27,0.12)_0,_rgba(85,50,27,0.12)_2px,_transparent_2px,_transparent_64px)] opacity-60" />
      <div className="absolute inset-x-[8%] top-[12%] h-[26%] rounded-[50%] border border-white/10 bg-white/5 blur-3xl" />

      <div className="relative mx-auto flex min-h-[760px] w-full max-w-[1920px] items-end px-5 pb-0 pt-28 md:min-h-[860px] md:px-8">
        <div className="w-full">
          <div className="max-w-xl pb-16 md:pb-20">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.4em] text-white/70">
              Cathedral Home
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
              구로3동성당의
              <br />
              일상과 전례를 담는
              <br />첫 화면
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/78 md:text-base">
              메인 비주얼, 빠른 이동, 일정, 행사, 알림을 한 화면 안에서 읽을 수
              있도록 Figma 레이아웃을 정적 구조로 먼저 옮긴 버전입니다.
            </p>
          </div>

          <div className="rounded-t-[28px] border-t border-white/10 bg-[rgba(37,38,41,0.84)] px-4 py-6 backdrop-blur-sm md:px-10 md:py-7">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
              {quickLinks.map((item, index) => {
                const Icon = item.icon
                const isEmphasized = index === 0

                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`flex min-h-30 flex-col items-center justify-center rounded-2xl border text-center transition-transform hover:-translate-y-0.5 ${
                      isEmphasized
                        ? "border-white/25 bg-white/14"
                        : "border-white/8 bg-white/4"
                    }`}
                  >
                    <Icon className="mb-3 size-7" strokeWidth={1.8} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
