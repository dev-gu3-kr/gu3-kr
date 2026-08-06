"use client"

import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  formatPastoralCouncilDisplayName,
  getPastoralCouncilPlaceholderImageSrc,
  isPastoralCouncilPositionVisible,
  type PastoralCouncilListItemDto,
  type PastoralCouncilPositionTreeNodeDto,
} from "@/features/pastoral-council/isomorphic"
import { cn } from "@/lib/utils"

function PersonSummary({
  position,
  member,
  imageSrc,
  displayName,
  eager,
  alignStart,
}: {
  position: PastoralCouncilPositionTreeNodeDto
  member: PastoralCouncilListItemDto | null
  imageSrc: string
  displayName: string
  eager: boolean
  alignStart: boolean
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-fit max-w-full min-w-0 items-center justify-center gap-2.5 px-1",
        alignStart && "mx-0 justify-start",
      )}
    >
      <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted">
        <Image
          src={imageSrc}
          alt={
            member
              ? `${displayName} 프로필 사진`
              : `${position.title} 공석 대체 이미지`
          }
          fill
          sizes="40px"
          priority={eager}
          className="object-cover"
        />
      </div>
      <div className="min-w-0 max-w-40">
        {member ? (
          <>
            <p
              className="truncate text-sm font-semibold leading-5 tracking-tight"
              title={member.name}
            >
              {member.name}
            </p>
            {member.baptismalName ? (
              <p
                className="truncate text-xs leading-4 text-muted-foreground"
                title={member.baptismalName}
              >
                {member.baptismalName}
              </p>
            ) : null}
          </>
        ) : (
          <p className="truncate text-sm font-semibold leading-5 tracking-tight text-muted-foreground">
            공석
          </p>
        )}
      </div>
    </div>
  )
}

function PersonItem({
  position,
  member,
  eager = false,
  alignStart = false,
}: {
  position: PastoralCouncilPositionTreeNodeDto
  member: PastoralCouncilListItemDto | null
  eager?: boolean
  alignStart?: boolean
}) {
  const displayName = member ? formatPastoralCouncilDisplayName(member) : "공석"
  const imageSrc =
    member?.imageUrl ??
    getPastoralCouncilPlaceholderImageSrc(
      member?.placeholderImageType ?? position.defaultPlaceholderImageType,
    )
  const summary = (
    <PersonSummary
      position={position}
      member={member}
      imageSrc={imageSrc}
      displayName={displayName}
      eager={eager}
      alignStart={alignStart}
    />
  )

  return (
    <article
      className={cn(
        "relative z-10 mx-auto flex min-h-24 w-[calc(100%-0.5rem)] max-w-56 min-w-0 flex-col justify-center gap-2 bg-background px-1 py-1.5 text-left text-foreground",
        alignStart && "mx-0 min-h-16 w-full max-w-sm gap-0",
      )}
    >
      {!alignStart ? (
        <p
          className="w-full truncate rounded-full bg-muted px-3 py-1 text-center text-xs font-semibold leading-4 text-foreground"
          title={position.title}
        >
          {position.title}
        </p>
      ) : null}
      {member ? (
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className={cn(
                "mx-auto block max-w-full cursor-pointer rounded-xl py-1 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                alignStart && "mx-0",
              )}
              aria-label={`${displayName} ${position.title} 상세 보기`}
            >
              {summary}
            </button>
          </DialogTrigger>
          <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-md overflow-y-auto rounded-3xl border-0 bg-background p-5 sm:p-6">
            <div className="flex flex-col gap-5">
              <DialogTitle
                className="w-full truncate rounded-full bg-muted px-10 py-2.5 text-center text-base font-semibold text-foreground"
                title={position.title}
              >
                {position.title}
              </DialogTitle>
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-muted">
                <Image
                  src={imageSrc}
                  alt={`${displayName} 프로필 사진 크게 보기`}
                  fill
                  sizes="(max-width: 640px) calc(100vw - 4rem), 400px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-xl font-semibold tracking-tight">
                  {member.name}
                </p>
                {member.baptismalName ? (
                  <p className="text-base text-muted-foreground">
                    {member.baptismalName}
                  </p>
                ) : null}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        summary
      )}
    </article>
  )
}

function MobilePositionNode({
  position,
  connected = false,
  isLast = false,
}: {
  position: PastoralCouncilPositionTreeNodeDto
  connected?: boolean
  isLast?: boolean
}) {
  const members = position.members.length > 0 ? position.members : [null]
  const children = position.children.filter(isPastoralCouncilPositionVisible)

  return (
    <li
      className={cn(
        "relative min-w-0",
        connected &&
          "before:absolute before:top-4 before:-left-5 before:h-px before:w-5 before:bg-foreground/20 after:absolute after:-left-5 after:w-px after:bg-foreground/20",
        connected && isLast && "after:-top-2 after:h-6",
        connected && !isLast && "after:-top-2 after:-bottom-2",
      )}
    >
      <div className="flex min-h-8 items-center gap-2">
        <span
          aria-hidden="true"
          className="size-2 rounded-full bg-foreground"
        />
        <h3 className="truncate text-sm font-semibold">{position.title}</h3>
        <span className="text-sm text-muted-foreground">
          {position.members.length > 0
            ? `${position.members.length}명`
            : "공석"}
        </span>
      </div>
      <div className="ml-4 space-y-0.5">
        {members.map((member) => (
          <PersonItem
            key={member?.id ?? `${position.id}-vacant`}
            position={position}
            member={member}
            alignStart
          />
        ))}
      </div>
      {children.length > 0 ? (
        <ol className="relative mt-1 ml-5 space-y-2 pl-5">
          {children.map((child, index) => (
            <MobilePositionNode
              key={child.id}
              position={child}
              connected
              isLast={index === children.length - 1}
            />
          ))}
        </ol>
      ) : null}
    </li>
  )
}

function PositionPeople({
  position,
  connectedFromParent,
  connectsToChildren,
}: {
  position: PastoralCouncilPositionTreeNodeDto
  connectedFromParent: boolean
  connectsToChildren: boolean
}) {
  const members = position.members.length > 0 ? position.members : [null]
  const columns = Math.min(4, members.length)
  const grouped = members.length > 1

  return (
    <div
      className={cn(
        "relative mx-auto grid w-full max-w-6xl items-stretch gap-y-2",
        grouped && connectedFromParent && "pt-5",
        grouped && connectsToChildren && "pb-5",
      )}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {grouped && connectedFromParent ? (
        <>
          <span
            aria-hidden="true"
            className="absolute top-0 left-1/2 h-2.5 w-px -translate-x-1/2 bg-foreground/20"
          />
          <span
            aria-hidden="true"
            className="absolute top-2.5 h-px bg-foreground/20"
            style={{
              left: `${50 / columns}%`,
              right: `${50 / columns}%`,
            }}
          />
        </>
      ) : null}
      {grouped && connectsToChildren ? (
        <>
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-1/2 h-2.5 w-px -translate-x-1/2 bg-foreground/20"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-2.5 h-px bg-foreground/20"
            style={{
              left: `${50 / columns}%`,
              right: `${50 / columns}%`,
            }}
          />
        </>
      ) : null}
      {members.map((member, index) => (
        <div
          key={member?.id ?? `${position.id}-vacant`}
          className={cn(
            "relative min-w-0",
            grouped &&
              connectedFromParent &&
              "before:absolute before:-top-2.5 before:left-1/2 before:h-2.5 before:w-px before:-translate-x-1/2 before:bg-foreground/20",
            grouped &&
              connectsToChildren &&
              "after:absolute after:-bottom-2.5 after:left-1/2 after:h-2.5 after:w-px after:-translate-x-1/2 after:bg-foreground/20",
          )}
        >
          <PersonItem
            position={position}
            member={member}
            eager={!connectedFromParent && index === 0}
          />
        </div>
      ))}
    </div>
  )
}

function chunkChildren(
  children: readonly PastoralCouncilPositionTreeNodeDto[],
  columns: number,
) {
  const rows: PastoralCouncilPositionTreeNodeDto[][] = []
  for (let index = 0; index < children.length; index += columns) {
    rows.push(children.slice(index, index + columns))
  }
  return rows
}

function DesktopChildren({
  position,
  nodes,
  narrow,
}: {
  position: PastoralCouncilPositionTreeNodeDto
  nodes: readonly PastoralCouncilPositionTreeNodeDto[]
  narrow: boolean
}) {
  const requestedColumns = Math.max(
    1,
    Math.min(position.childrenColumns, nodes.length, 4),
  )
  const layout =
    position.childrenLayout === "AUTO"
      ? narrow && nodes.length > 1
        ? "GRID"
        : nodes.length <= 4
          ? "ROW"
          : "GRID"
      : position.childrenLayout
  const columns =
    layout === "COLUMN"
      ? 1
      : layout === "ROW"
        ? Math.min(4, nodes.length)
        : position.childrenLayout === "AUTO" && narrow
          ? Math.min(2, nodes.length)
          : requestedColumns
  const rows = chunkChildren(nodes, columns)

  return (
    <div className="relative w-full pt-7">
      <span
        aria-hidden="true"
        className="absolute top-0 left-1/2 h-7 w-px -translate-x-1/2 bg-foreground/20"
      />
      <div className="relative space-y-8">
        {rows.map((row, rowIndex) => (
          <div
            key={row.map((child) => child.id).join("-")}
            className="relative grid items-start"
            style={{
              gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
            }}
          >
            {rowIndex < rows.length - 1 ? (
              <span
                aria-hidden="true"
                className="absolute top-0 -bottom-[33px] left-1/2 w-px -translate-x-1/2 bg-foreground/20"
              />
            ) : null}
            {row.length > 1 ? (
              <span
                aria-hidden="true"
                className="absolute top-0 h-px bg-foreground/20"
                style={{
                  left: `${50 / row.length}%`,
                  right: `${50 / row.length}%`,
                }}
              />
            ) : null}
            {row.map((child) => (
              <div
                key={child.id}
                className="relative min-w-0 pt-5 before:absolute before:top-0 before:left-1/2 before:h-5 before:w-px before:-translate-x-1/2 before:bg-foreground/20"
              >
                <DesktopPositionNode
                  position={child}
                  connectedFromParent
                  narrow={narrow || row.length > 1}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function DesktopPositionNode({
  position,
  connectedFromParent = false,
  narrow = false,
}: {
  position: PastoralCouncilPositionTreeNodeDto
  connectedFromParent?: boolean
  narrow?: boolean
}) {
  const children = position.children.filter(isPastoralCouncilPositionVisible)

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center">
      <PositionPeople
        position={position}
        connectedFromParent={connectedFromParent}
        connectsToChildren={children.length > 0}
      />
      {children.length > 0 ? (
        <DesktopChildren position={position} nodes={children} narrow={narrow} />
      ) : null}
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
  const visibleRoots = roots.filter(isPastoralCouncilPositionVisible)

  if (visibleRoots.length === 0) {
    return (
      <div className="mt-8 rounded-3xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        표시할 사목협의회 구성원이 없습니다.
      </div>
    )
  }

  return (
    <section
      className={cn(
        "mx-auto mt-8 w-full max-w-[1600px] px-5 pb-16 md:px-8 md:pb-24",
        compact && "mt-0 px-0 pb-0 md:px-0 md:pb-0",
      )}
      aria-labelledby="pastoral-council-tree-title"
    >
      <h2 id="pastoral-council-tree-title" className="sr-only">
        사목협의회 조직도
      </h2>
      <ol
        className="space-y-4 lg:hidden"
        aria-label="사목협의회 직책 계층 구조"
      >
        {visibleRoots.map((root) => (
          <MobilePositionNode key={root.id} position={root} />
        ))}
      </ol>

      <div
        role="tree"
        className="mx-auto hidden min-w-0 max-w-6xl space-y-12 lg:block"
        aria-label="사목협의회 직책 계층 구조"
      >
        {visibleRoots.map((root) => (
          <DesktopPositionNode key={root.id} position={root} />
        ))}
      </div>
    </section>
  )
}
