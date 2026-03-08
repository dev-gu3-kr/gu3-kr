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

          <div className="mt-10 flex items-center gap-2">
            <p className="text-xs text-[#95989f]">
              Copyrightⓒ 2026 Guro3dong Catholic Cathedral. All rights reserved.
            </p>

            <div className="ml-4 flex items-center gap-3">
              <a
                href="https://www.youtube.com/@guro3cc"
                aria-label="유튜브"
                target="_blank"
                rel="noreferrer"
                className="grid size-[30px] place-items-center rounded-full bg-[#4a4d54] text-white/90"
              >
                <span className="sr-only">유튜브</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-4"
                  role="img"
                  aria-labelledby="footer-youtube-icon-title"
                >
                  <title id="footer-youtube-icon-title">유튜브</title>
                  <path d="M21.58 7.19a2.88 2.88 0 0 0-2.03-2.04C17.8 4.67 12 4.67 12 4.67s-5.8 0-7.55.48A2.88 2.88 0 0 0 2.42 7.2C1.94 8.95 1.94 12 1.94 12s0 3.05.48 4.8a2.88 2.88 0 0 0 2.03 2.04c1.75.48 7.55.48 7.55.48s5.8 0 7.55-.48a2.88 2.88 0 0 0 2.03-2.04c.48-1.75.48-4.8.48-4.8s0-3.05-.48-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" />
                </svg>
              </a>

              <a
                href="mailto:contact@gu3.kr"
                aria-label="이메일"
                className="grid size-[30px] place-items-center rounded-full bg-[#4a4d54] text-white/90"
              >
                <span className="sr-only">이메일</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-4"
                  role="img"
                  aria-labelledby="footer-mail-icon-title"
                >
                  <title id="footer-mail-icon-title">이메일</title>
                  <path d="M20 4H4a2 2 0 0 0-2 2v.4l10 6.25L22 6.4V6a2 2 0 0 0-2-2Zm2 4.75-9.47 5.92a1 1 0 0 1-1.06 0L2 8.75V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.75Z" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        <section className="hidden md:block">
          <h2 className="border-b border-[#434448] pb-3 text-lg font-semibold">
            미사 안내
          </h2>
          <div className="mt-5 grid gap-7 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            {massTimes.map((massTime) => (
              <div key={massTime.title} className="min-w-0">
                <h3 className="mb-2 text-[13px] font-semibold text-white/90">
                  {massTime.title}
                </h3>
                <div className="space-y-1 text-[13px] leading-[1.55] text-[#b6b9c2]">
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
