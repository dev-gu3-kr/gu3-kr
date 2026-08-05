"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  formatPastoralCouncilDisplayName,
  getPastoralCouncilPlaceholderImageSrc,
  type PastoralCouncilListItemDto,
  type PastoralCouncilPositionTreeNodeDto,
} from "@/features/pastoral-council/isomorphic"
import { cn } from "@/lib/utils"

const MIN_HORIZONTAL_BRANCH_WIDTH = 240
const HORIZONTAL_BRANCH_GAP = 16
const MIN_DESCENDANT_GROUP_WIDTH = 480

type PositionCardNode = {
  readonly key: string
  readonly position: PastoralCouncilPositionTreeNodeDto
  readonly member: PastoralCouncilListItemDto | null
  readonly memberIndex: number
  readonly isLastForPosition: boolean
}

function toPositionCardNodes(
  positions: readonly PastoralCouncilPositionTreeNodeDto[],
): PositionCardNode[] {
  return positions.flatMap((position) => {
    const members = position.members.length > 0 ? position.members : [null]

    return members.map((member, memberIndex) => ({
      key: member?.id ?? `${position.id}-vacant`,
      position,
      member,
      memberIndex,
      isLastForPosition: memberIndex === members.length - 1,
    }))
  })
}

function PositionCard({
  position,
  member,
  eager = false,
  featured = false,
  centered = false,
  uniform = false,
}: {
  position: PastoralCouncilPositionTreeNodeDto
  member: PastoralCouncilListItemDto | null
  eager?: boolean
  featured?: boolean
  centered?: boolean
  uniform?: boolean
}) {
  const displayName = member ? formatPastoralCouncilDisplayName(member) : "공석"
  const placeholderType =
    member?.placeholderImageType ?? position.defaultPlaceholderImageType

  return (
    <article
      className={cn(
        "relative z-10 flex min-h-30 w-full max-w-96 min-w-0 flex-col justify-center rounded-2xl bg-card p-4 shadow-[0_4px_18px_rgba(0,0,0,0.07)] ring-1 ring-foreground/5",
        (featured || centered) && "mx-auto",
        (uniform || (centered && !featured)) && "max-w-80",
        uniform && "h-full",
        featured &&
          "min-h-38 max-w-sm p-5 shadow-[0_8px_28px_rgba(0,0,0,0.09)]",
      )}
    >
      <div
        className={cn("flex min-w-0 items-center gap-3", uniform && "flex-1")}
      >
        <div
          className={cn(
            "relative aspect-square min-h-20 min-w-20 shrink-0 self-stretch overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/5",
            featured && "min-h-24 min-w-24",
          )}
        >
          <Image
            src={
              member?.imageUrl ??
              getPastoralCouncilPlaceholderImageSrc(placeholderType)
            }
            alt={
              member
                ? `${displayName} 프로필 사진`
                : `${position.title} 공석 대체 이미지`
            }
            fill
            sizes={featured ? "80px" : "56px"}
            loading={eager ? "eager" : "lazy"}
            className="object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-col items-start gap-2">
          <Badge variant="secondary" className="max-w-full rounded-full">
            <span className="truncate">{position.title}</span>
          </Badge>
          <p
            className={cn(
              "min-w-0 break-keep font-semibold tracking-tight",
              featured && "text-xl",
              !member && "text-muted-foreground",
            )}
          >
            {displayName}
          </p>
        </div>
      </div>
    </article>
  )
}

function PositionCardGroup({
  position,
  featured = false,
  centered = false,
  uniform = false,
}: {
  position: PastoralCouncilPositionTreeNodeDto
  featured?: boolean
  centered?: boolean
  uniform?: boolean
}) {
  const members = position.members.length > 0 ? position.members : [null]

  return (
    <div
      data-position-card-group={position.id}
      className={cn(
        "flex w-full min-w-0 flex-col gap-3",
        centered && "mx-auto",
      )}
    >
      {members.map((member, index) => (
        <PositionCard
          key={member?.id ?? `${position.id}-vacant`}
          position={position}
          member={member}
          eager={featured && index === 0}
          featured={featured}
          centered={centered}
          uniform={uniform}
        />
      ))}
    </div>
  )
}

function useObservedWidth() {
  const elementRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const updateWidth = () => {
      const nextWidth = Math.round(element.clientWidth)
      setWidth((previous) => (previous === nextWidth ? previous : nextWidth))
    }

    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return { elementRef, width }
}

function OrganizationNode({
  position,
  featured = false,
  centered = false,
}: {
  position: PastoralCouncilPositionTreeNodeDto
  featured?: boolean
  centered?: boolean
}) {
  return (
    <div className="w-full min-w-0">
      <PositionCardGroup
        position={position}
        featured={featured}
        centered={centered}
      />
      <ChildrenLayout positions={position.children} />
    </div>
  )
}

function HorizontalChildren({
  positions,
  width,
}: {
  positions: readonly PastoralCouncilPositionTreeNodeDto[]
  width: number
}) {
  const cards = toPositionCardNodes(positions)
  const descendants = positions.filter(
    (position) => position.children.length > 0,
  )
  const columnWidth =
    (width - (cards.length - 1) * HORIZONTAL_BRANCH_GAP) / cards.length
  const descendantColumnWidth =
    descendants.length > 0
      ? (width - (descendants.length - 1) * HORIZONTAL_BRANCH_GAP) /
        descendants.length
      : 0

  return (
    <>
      <ol
        data-layout="horizontal"
        className="relative flex items-stretch gap-4 before:absolute before:top-0 before:left-1/2 before:h-4 before:w-px before:-translate-x-1/2 before:bg-border"
      >
        {cards.map((card, index) => (
          <li
            key={card.key}
            className={cn(
              "relative flex min-w-0 flex-1 flex-col pt-8 before:absolute before:top-4 before:left-1/2 before:h-4 before:w-px before:-translate-x-1/2 before:bg-border",
              index > 0 &&
                "after:absolute after:top-4 after:right-1/2 after:-left-2 after:h-px after:bg-border",
            )}
          >
            {index < cards.length - 1 ? (
              <span
                aria-hidden="true"
                className="absolute top-4 -right-2 left-1/2 h-px bg-border"
              />
            ) : null}
            <PositionCard
              position={card.position}
              member={card.member}
              centered
              uniform
            />
          </li>
        ))}
      </ol>

      {descendants.length > 0 ? (
        <div>
          <svg
            aria-hidden="true"
            className="block h-10 w-full text-border"
            viewBox={`0 0 ${width} 40`}
            preserveAspectRatio="none"
            shapeRendering="crispEdges"
          >
            {descendants.map((position, descendantIndex) => {
              const sourceIndexes = cards.flatMap((card, cardIndex) =>
                card.position.id === position.id ? [cardIndex] : [],
              )
              const firstSourceIndex = sourceIndexes[0] ?? 0
              const lastSourceIndex =
                sourceIndexes[sourceIndexes.length - 1] ?? firstSourceIndex
              const sourceX =
                ((firstSourceIndex + lastSourceIndex) / 2) *
                  (columnWidth + HORIZONTAL_BRANCH_GAP) +
                columnWidth / 2
              const targetX =
                descendantIndex *
                  (descendantColumnWidth + HORIZONTAL_BRANCH_GAP) +
                descendantColumnWidth / 2

              return (
                <path
                  key={position.id}
                  d={`M ${sourceX} 0 V 16 H ${targetX} V 40`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              )
            })}
          </svg>
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${descendants.length}, minmax(0, 1fr))`,
            }}
          >
            {descendants.map((position) => (
              <ChildrenLayout key={position.id} positions={position.children} />
            ))}
          </div>
        </div>
      ) : null}
    </>
  )
}

function LeafColumnChildren({
  positions,
  width,
  columnCount,
}: {
  positions: readonly PastoralCouncilPositionTreeNodeDto[]
  width: number
  columnCount: number
}) {
  const cards = toPositionCardNodes(positions)
  const rows = Array.from(
    { length: Math.ceil(cards.length / columnCount) },
    (_, rowIndex) =>
      cards.slice(rowIndex * columnCount, (rowIndex + 1) * columnCount),
  )
  const columnWidth =
    (width - (columnCount - 1) * HORIZONTAL_BRANCH_GAP) / columnCount

  return (
    <ol data-layout="columns" data-columns={columnCount} className="space-y-4">
      {rows.map((row, rowIndex) => {
        const rowWidth =
          row.length * columnWidth +
          Math.max(0, row.length - 1) * HORIZONTAL_BRANCH_GAP
        const rowLeft = (width - rowWidth) / 2
        const firstCardCenter = rowLeft + columnWidth / 2
        const lastCardCenter = rowLeft + rowWidth - columnWidth / 2
        const isLastRow = rowIndex === rows.length - 1

        return (
          <li
            key={row[0]?.key ?? `row-${rowIndex}`}
            className="relative grid gap-4 pt-8"
            style={{
              gridTemplateColumns: `repeat(${row.length}, minmax(0, ${columnWidth}px))`,
              justifyContent: "center",
            }}
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-0 left-1/2 w-px -translate-x-1/2 bg-border",
                isLastRow ? "h-4" : "-bottom-4",
              )}
            />
            <span
              aria-hidden="true"
              className="absolute top-4 h-px bg-border"
              style={{
                left: `${firstCardCenter}px`,
                width: `${lastCardCenter - firstCardCenter}px`,
              }}
            />
            {row.map((card) => (
              <div
                key={card.key}
                className="relative min-w-0 before:absolute before:-top-4 before:left-1/2 before:h-4 before:w-px before:-translate-x-1/2 before:bg-border"
              >
                <PositionCard
                  position={card.position}
                  member={card.member}
                  uniform
                />
              </div>
            ))}
          </li>
        )
      })}
    </ol>
  )
}

function VerticalChildren({
  positions,
}: {
  positions: readonly PastoralCouncilPositionTreeNodeDto[]
}) {
  const cards = toPositionCardNodes(positions)

  return (
    <>
      <div
        data-connector="vertical"
        aria-hidden="true"
        className="relative h-8"
      >
        <span className="absolute top-0 left-1/2 h-4 w-px -translate-x-1/2 bg-border" />
        <span className="absolute top-4 right-1/2 left-4 h-px bg-border" />
        <span className="absolute top-4 left-4 h-4 w-px bg-border" />
      </div>
      <ol data-layout="vertical" className="ml-4 space-y-3 pt-4 pl-5">
        {cards.map((card, index) => (
          <li key={card.key} className="relative min-w-0">
            <span
              aria-hidden="true"
              className="absolute -top-4 -left-5 h-12 w-px bg-border"
            />
            <span
              aria-hidden="true"
              className="absolute top-8 -left-5 h-px w-5 bg-border"
            />
            {index < cards.length - 1 ? (
              <span
                aria-hidden="true"
                className="absolute top-8 -bottom-3 -left-5 w-px bg-border"
              />
            ) : null}
            <PositionCard position={card.position} member={card.member} />
            {card.isLastForPosition ? (
              <ChildrenLayout positions={card.position.children} />
            ) : null}
          </li>
        ))}
      </ol>
    </>
  )
}

function SingleChild({ card }: { card: PositionCardNode }) {
  return (
    <div data-layout="single">
      <span aria-hidden="true" className="mx-auto block h-8 w-px bg-border" />
      <PositionCard position={card.position} member={card.member} centered />
      <ChildrenLayout positions={card.position.children} />
    </div>
  )
}

function ChildrenLayout({
  positions,
}: {
  positions: readonly PastoralCouncilPositionTreeNodeDto[]
}) {
  const { elementRef, width } = useObservedWidth()

  if (positions.length === 0) return null

  const cards = toPositionCardNodes(positions)
  const descendantCount = positions.filter(
    (position) => position.children.length > 0,
  ).length
  const requiredRowWidth =
    cards.length * MIN_HORIZONTAL_BRANCH_WIDTH +
    (cards.length - 1) * HORIZONTAL_BRANCH_GAP
  const requiredDescendantWidth =
    descendantCount * MIN_DESCENDANT_GROUP_WIDTH +
    Math.max(0, descendantCount - 1) * HORIZONTAL_BRANCH_GAP
  const canUseHorizontalRow =
    cards.length > 1 &&
    width >= requiredRowWidth &&
    (descendantCount <= 1 || width >= requiredDescendantWidth)
  const allLeaves = positions.every(
    (position) => position.children.length === 0,
  )
  const leafColumnCount = Math.max(
    1,
    Math.min(
      4,
      cards.length,
      Math.floor(
        (width + HORIZONTAL_BRANCH_GAP) /
          (MIN_HORIZONTAL_BRANCH_WIDTH + HORIZONTAL_BRANCH_GAP),
      ),
    ),
  )

  return (
    <div ref={elementRef} className="w-full min-w-0">
      {width === 0 ? (
        <VerticalChildren positions={positions} />
      ) : cards.length === 1 ? (
        <SingleChild card={cards[0]} />
      ) : canUseHorizontalRow ? (
        <HorizontalChildren positions={positions} width={width} />
      ) : allLeaves ? (
        <LeafColumnChildren
          positions={positions}
          width={width}
          columnCount={leafColumnCount}
        />
      ) : (
        <VerticalChildren positions={positions} />
      )}
    </div>
  )
}

export function PastoralCouncilPageView({
  roots,
  compact = false,
}: {
  roots: readonly PastoralCouncilPositionTreeNodeDto[]
  compact?: boolean
}) {
  if (roots.length === 0) {
    return (
      <div className="mt-8 rounded-3xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        공개 중인 사목협의회 직책이 없습니다.
      </div>
    )
  }

  return (
    <div
      className={cn(
        "mx-auto mt-8 w-full max-w-[1200px] px-5 pb-16 md:px-8 md:pb-24",
        compact && "mt-0 pb-0 md:pb-0",
      )}
    >
      <h2 className="sr-only">사목협의회 조직도</h2>

      <ol
        className="mx-auto w-full space-y-6"
        aria-label="사목협의회 직책 연결 구조"
      >
        {roots.map((root) => (
          <li key={root.id} className="w-full">
            <OrganizationNode position={root} featured={!compact} centered />
          </li>
        ))}
      </ol>
    </div>
  )
}
