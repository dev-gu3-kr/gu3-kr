import { ChevronLeft, ChevronRight } from "lucide-react"

import type { HomeSchedulerItem } from "@/features/home/isomorphic"

type HomeSchedulerSectionProps = {
  readonly monthLabel: string
  readonly items: readonly HomeSchedulerItem[]
}

export function HomeSchedulerSection({
  monthLabel,
  items,
}: HomeSchedulerSectionProps) {
  return (
    <section className="bg-[#f5f6f8] px-5 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-[1220px]">
        <div className="mb-10 flex items-center justify-center gap-4">
          <button
            type="button"
            className="grid size-11 place-items-center rounded-xl bg-white text-[#252629] shadow-sm ring-1 ring-black/5"
          >
            <ChevronLeft className="size-5" />
          </button>
          <h2 className="min-w-42 text-center text-2xl font-semibold text-[#252629] md:text-[26px]">
            {monthLabel}
          </h2>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-xl bg-white text-[#252629] shadow-sm ring-1 ring-black/5"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
          {items.map((item) => (
            <article
              key={`${item.dayLabel}-${item.dayNumber}`}
              className="text-center"
            >
              <div
                className={`mx-auto grid size-[86px] place-items-center rounded-full ${
                  item.isActive
                    ? "bg-white shadow-sm ring-1 ring-black/5"
                    : "bg-[#ebecf0]"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-[#8c8e93]">
                    {item.dayLabel}
                  </p>
                  <p
                    className={`mt-1 text-xl font-bold ${
                      item.isActive ? "text-[#bd2125]" : "text-[#252629]"
                    }`}
                  >
                    {item.dayNumber}
                  </p>
                </div>
              </div>
              <div className="mt-4 min-h-12">
                {item.events.length > 0 ? (
                  <div className="space-y-1">
                    <div className="mx-auto size-2 rounded-full bg-[#bd2125]" />
                    {item.events.map((event) => (
                      <p
                        key={event}
                        className="text-xs leading-4 text-[#252629] md:text-[13px]"
                      >
                        {event}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="pt-2 text-xs text-[#a1a4aa]">예정 없음</div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
