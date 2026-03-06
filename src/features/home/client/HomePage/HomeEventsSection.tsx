import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

import type { HomeEventCard } from "@/features/home/isomorphic"

type HomeEventsSectionProps = {
  readonly cards: readonly HomeEventCard[]
}

export function HomeEventsSection({ cards }: HomeEventsSectionProps) {
  return (
    <section className="bg-white px-5 py-20 md:px-8">
      <div className="mx-auto max-w-[1360px]">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold text-[#252629]">
            본당 행사 안내
          </h2>
          <p className="mt-3 text-sm text-[#6d6f74]">
            본당의 다양한 행사에 참여해 보세요.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="hidden size-11 shrink-0 place-items-center rounded-full bg-[#eaebef] text-[#7f848c] md:grid"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div className="grid flex-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <article
                key={card.title}
                className={`group overflow-hidden rounded-[20px] bg-gradient-to-br ${card.accentClassName} p-[1px] shadow-[0_16px_28px_rgba(0,0,0,0.12)]`}
              >
                <div className="relative flex h-[210px] flex-col justify-end rounded-[19px] overflow-hidden p-6 text-white">
                  {card.thumbnailUrl ? (
                    <Image
                      src={card.thumbnailUrl}
                      alt={card.title}
                      fill
                      sizes="(min-width: 1280px) 282px, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(17,18,20,0.7))]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_35%)]" />
                  <div className="relative">
                    <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/65">
                      Parish Event
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/76">
                      {card.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="hidden size-11 shrink-0 place-items-center rounded-full bg-[#252629] text-white md:grid"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <span className="h-3 w-10 rounded-full bg-[#bd2125]" />
          <span className="size-3 rounded-full bg-[#d9d9d9]" />
          <span className="size-3 rounded-full bg-[#d9d9d9]" />
        </div>
      </div>
    </section>
  )
}
