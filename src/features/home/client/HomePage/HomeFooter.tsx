import type { HomeFooterMassTime } from "@/features/home/isomorphic"

type HomeFooterProps = {
  readonly massTimes: readonly HomeFooterMassTime[]
}

export function HomeFooter({ massTimes }: HomeFooterProps) {
  return (
    <footer className="bg-[#252629] px-5 py-12 text-white md:px-8">
      <div className="mx-auto grid max-w-[1220px] gap-10 md:grid-cols-[1.1fr_1.3fr]">
        <section>
          <h2 className="text-xl font-semibold">
            천주교 서울대교구 구로3동성당
          </h2>
          <div className="mt-5 space-y-2 text-sm text-[#b6b9c2]">
            <p>전화번호 02-857-8541</p>
            <p>이메일 contact@gu3.kr</p>
          </div>
          <p className="mt-10 text-xs text-[#95989f]">
            Copyrightⓒ 2026 Guro3dong Catholic Cathedral. All rights reserved.
          </p>
          <div className="mt-6 flex gap-3">
            <div className="grid size-8 place-items-center rounded-full bg-[#3f4043] text-xs">
              ●
            </div>
            <div className="grid size-8 place-items-center rounded-full bg-[#3f4043] text-xs">
              ▶
            </div>
          </div>
        </section>

        <section>
          <h2 className="border-b border-[#434448] pb-3 text-lg font-semibold">
            미사 안내
          </h2>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            {massTimes.map((massTime) => (
              <div key={massTime.title}>
                <h3 className="mb-3 text-sm font-semibold text-white">
                  {massTime.title}
                </h3>
                <div className="space-y-1.5 text-sm leading-6 text-[#b6b9c2]">
                  {massTime.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </footer>
  )
}
