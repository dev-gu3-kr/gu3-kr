import { Plus } from "lucide-react"
import Image from "next/image"

import type {
  HomeBoardColumn,
  HomeShortcutCard,
} from "@/features/home/isomorphic"

type HomeBoardsSectionProps = {
  readonly boardColumns: readonly HomeBoardColumn[]
  readonly shortcutCards: readonly HomeShortcutCard[]
}

export function HomeBoardsSection({
  boardColumns,
  shortcutCards,
}: HomeBoardsSectionProps) {
  return (
    <section className="bg-white px-5 py-20 md:px-8">
      <div className="mx-auto max-w-[1220px]">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-semibold text-[#252629]">알림 마당</h2>
          <p className="mt-3 text-sm text-[#6d6f74]">
            본당의 새로운 소식을 확인해 보세요.
          </p>
        </div>

        <div className="grid gap-10 overflow-x-hidden lg:grid-cols-3">
          {boardColumns.map((column) => (
            <section key={column.title} className="min-w-0">
              <div className="mb-4 flex items-start justify-between border-b border-[#252629] pb-3">
                <h3 className="text-base font-semibold text-[#252629]">
                  {column.title}
                </h3>
                <button type="button" className="text-[#252629]">
                  <Plus className="size-4" />
                </button>
              </div>
              <ul className="space-y-3">
                {column.items.map((item, index) => (
                  <li
                    key={`${column.title}-${item.title}-${item.date}-${index}`}
                    className="min-w-0 overflow-hidden"
                  >
                    <button
                      type="button"
                      className="flex min-w-0 w-full items-center justify-between gap-3 overflow-hidden text-sm text-[#4a4d53] transition-colors hover:text-[#252629]"
                    >
                      <span className="min-w-0 flex-1 truncate pr-2 text-left">
                        {item.title}
                      </span>
                      <span className="ml-3 w-[72px] shrink-0 text-right text-xs tabular-nums text-[#9ea1a8]">
                        {item.date}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {shortcutCards.map((card) => (
            <button
              key={card.title}
              type="button"
              className={`group relative min-h-[120px] overflow-hidden rounded-xl bg-gradient-to-br ${card.accentClassName} p-5 text-left text-white`}
            >
              {card.thumbnailUrl ? (
                <Image
                  src={card.thumbnailUrl}
                  alt={card.title}
                  fill
                  sizes="(min-width: 1280px) 180px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(12,13,15,0.22))]" />
              <div className="relative">
                <p className="text-lg font-semibold">{card.title}</p>
                <p className="mt-2 text-xs leading-5 text-white/82">
                  {card.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
