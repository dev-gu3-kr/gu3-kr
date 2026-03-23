"use client"

import { Plus } from "lucide-react"
import Image from "next/image"
import * as React from "react"

import { AppLink as Link } from "@/components/AppLink"
import type {
  HomeBoardColumn,
  HomeBoardItem,
  HomeShortcutCard,
} from "@/features/home/isomorphic"
import { cn } from "@/lib/utils"

type HomeBoardsSectionProps = {
  readonly boardColumns: readonly HomeBoardColumn[]
  readonly shortcutCards: readonly HomeShortcutCard[]
}

type ShortcutCardTileProps = {
  readonly card: HomeShortcutCard
  readonly mobileCentered?: boolean
}

type BoardItemsListProps = {
  readonly column: HomeBoardColumn
  readonly compactHeader?: boolean
}

function ShortcutCardTile({
  card,
  mobileCentered = false,
}: ShortcutCardTileProps) {
  const className = cn(
    "group relative overflow-hidden rounded-xl bg-gradient-to-br text-left text-white",
    mobileCentered
      ? "flex h-[87px] w-[130px] shrink-0 basis-[130px]"
      : "flex min-h-[120px] p-5",
    card.accentClassName,
  )

  const content = (
    <>
      {card.thumbnailUrl ? (
        <Image
          src={card.thumbnailUrl}
          alt={card.title}
          fill
          sizes={
            mobileCentered
              ? "(max-width: 767px) 282px, 100vw"
              : "(min-width: 1280px) 180px, (min-width: 640px) 50vw, 100vw"
          }
          className="object-cover"
        />
      ) : null}
      <div
        className={cn(
          "absolute inset-0",
          mobileCentered
            ? "bg-[linear-gradient(180deg,rgba(12,13,15,0.18),rgba(12,13,15,0.34))]"
            : "bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(12,13,15,0.22))]",
        )}
      />
      <div
        className={cn(
          "relative h-full",
          mobileCentered
            ? "flex w-full items-center justify-center p-3 text-center"
            : "p-5 text-left",
        )}
      >
        <div className={mobileCentered ? "w-full" : undefined}>
          <p
            className={cn(
              "font-semibold whitespace-normal break-keep",
              mobileCentered
                ? "mx-auto max-w-[92px] text-center text-[14px] leading-[1.2]"
                : "text-lg",
            )}
          >
            {card.title}
          </p>
          {mobileCentered ? null : (
            <p className="mt-2 text-xs leading-5 text-white/82">
              {card.subtitle}
            </p>
          )}
        </div>
      </div>
    </>
  )

  if (card.href) {
    return (
      <Link href={card.href} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" className={className}>
      {content}
    </button>
  )
}

function BoardListItem({
  columnTitle,
  item,
}: {
  readonly columnTitle: string
  readonly item: HomeBoardItem
}) {
  const content = (
    <>
      <span className="min-w-0 flex-1 truncate pr-2 text-left">
        {item.title}
      </span>
      <span className="ml-3 w-[72px] shrink-0 text-right text-xs tabular-nums text-[#9ea1a8]">
        {item.date}
      </span>
    </>
  )

  if (item.href) {
    return (
      <Link
        href={item.href}
        className="flex min-w-0 w-full items-center justify-between gap-3 overflow-hidden text-sm text-[#4a4d53] transition-colors hover:text-[#252629]"
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      className="flex min-w-0 w-full items-center justify-between gap-3 overflow-hidden text-sm text-[#4a4d53] transition-colors hover:text-[#252629]"
      aria-label={`${columnTitle} 항목 열기`}
    >
      {content}
    </button>
  )
}

function BoardItemsList({
  column,
  compactHeader = false,
}: BoardItemsListProps) {
  return (
    <section className="min-w-0">
      <div className="mb-4 flex items-start justify-between border-b border-[#252629] pb-3">
        <h3
          className={
            compactHeader
              ? "text-[18px] font-semibold text-[#252629]"
              : "text-base font-semibold text-[#252629]"
          }
        >
          {column.title}
        </h3>
        {column.href ? (
          <Link
            href={column.href}
            className={
              compactHeader
                ? "inline-flex items-center gap-1 text-[14px] font-medium text-[#252629] transition-colors hover:text-[#bd2125]"
                : "-mr-2 inline-flex h-4 w-10 items-center justify-center rounded-md text-[#252629] transition-colors hover:bg-[#f3f4f6]"
            }
            aria-label={`${column.title} 더보기`}
          >
            <Plus className="size-4" />
            {compactHeader ? <span>더보기</span> : null}
          </Link>
        ) : (
          <button
            type="button"
            className={
              compactHeader
                ? "inline-flex items-center gap-1 text-[14px] font-medium text-[#252629] transition-colors hover:text-[#bd2125]"
                : "-mr-2 inline-flex h-4 w-10 items-center justify-center rounded-md text-[#252629] transition-colors hover:bg-[#f3f4f6]"
            }
            aria-label={`${column.title} 더보기`}
          >
            <Plus className="size-4" />
            {compactHeader ? <span>더보기</span> : null}
          </button>
        )}
      </div>
      <ul className="space-y-3">
        {column.items.map((item) => (
          <li
            key={`${column.title}-${item.href ?? item.title}-${item.date}`}
            className="min-w-0 overflow-hidden"
          >
            <BoardListItem columnTitle={column.title} item={item} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export function HomeBoardsSection({
  boardColumns,
  shortcutCards,
}: HomeBoardsSectionProps) {
  const [selectedBoardTitle, setSelectedBoardTitle] = React.useState(
    () => boardColumns[0]?.title ?? "",
  )

  // API 응답이 바뀌어도 모바일 탭은 항상 유효한 게시판을 가리키도록 맞춘다.
  React.useEffect(() => {
    if (!boardColumns.some((column) => column.title === selectedBoardTitle)) {
      setSelectedBoardTitle(boardColumns[0]?.title ?? "")
    }
  }, [boardColumns, selectedBoardTitle])

  const selectedBoard =
    boardColumns.find((column) => column.title === selectedBoardTitle) ??
    boardColumns[0] ??
    null

  return (
    <section className="border-t border-[#eceef2] bg-white px-5 pb-20 pt-12 md:border-t-0 md:px-8 md:py-20">
      <div className="mx-auto max-w-[1220px]">
        <div className="mb-10 text-center md:mb-14">
          <h2 className="text-3xl font-semibold text-[#252629]">알림 마당</h2>
          <p className="mt-3 text-sm text-[#6d6f74]">
            본당의 새로운 소식을 확인해 보세요.
          </p>
        </div>

        <div className="md:hidden">
          <div
            className="mb-6 grid grid-cols-3 gap-2 md:mb-8"
            role="tablist"
            aria-label="알림 마당 게시판 탭"
          >
            {boardColumns.map((column) => {
              const isSelected = column.title === selectedBoard?.title

              return (
                <button
                  key={column.title}
                  type="button"
                  role="tab"
                  id={`home-board-tab-${column.title}`}
                  aria-selected={isSelected}
                  aria-controls={`home-board-panel-${column.title}`}
                  className={
                    isSelected
                      ? "min-w-0 whitespace-nowrap rounded-full border border-[#bd2125] px-0 py-3.5 text-[16px] font-semibold leading-none text-[#bd2125]"
                      : "min-w-0 whitespace-nowrap rounded-full border border-[#d8dbe2] px-0 py-3.5 text-[16px] font-semibold leading-none text-[#8a8f99]"
                  }
                  onClick={() => setSelectedBoardTitle(column.title)}
                >
                  {column.title}
                </button>
              )
            })}
          </div>

          {selectedBoard ? (
            <div
              role="tabpanel"
              id={`home-board-panel-${selectedBoard.title}`}
              aria-labelledby={`home-board-tab-${selectedBoard.title}`}
            >
              <BoardItemsList column={selectedBoard} compactHeader />
            </div>
          ) : null}
        </div>

        <div className="hidden gap-10 overflow-x-hidden md:grid lg:grid-cols-3">
          {boardColumns.map((column) => (
            <BoardItemsList key={column.title} column={column} />
          ))}
        </div>

        <div className="mt-12 md:hidden">
          <div className="snap-x snap-proximity overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth scrollbar-hidden touch-pan-x [-webkit-overflow-scrolling:touch]">
            <div className="flex min-w-max gap-3 pl-5 pr-5 py-1">
              {shortcutCards.map((card) => (
                <div key={card.title} className="snap-start">
                  <ShortcutCardTile card={card} mobileCentered />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 hidden gap-4 sm:grid-cols-2 md:grid xl:mt-14 xl:grid-cols-6">
          {shortcutCards.map((card) => (
            <ShortcutCardTile key={card.title} card={card} />
          ))}
        </div>
      </div>
    </section>
  )
}
