"use client"

import { UsersRound } from "lucide-react"
import Image from "next/image"
import { useLayoutEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type CouncilLeader = {
  readonly role: string
  readonly name: string
  readonly note?: string
  readonly imageUrl?: string
  readonly fallbackImageUrl: string
}

type CouncilBranch = {
  readonly role: string
  readonly name: string
  readonly imageUrl?: string
  readonly fallbackImageUrl: string
}

type ExecutiveLeaders = {
  readonly parishPriest: CouncilLeader
  readonly leftWing: CouncilLeader
  readonly rightWing: CouncilLeader
  readonly chair: CouncilLeader
  readonly viceChair: CouncilLeader
  readonly secretary: CouncilLeader
  readonly districtChief: CouncilLeader
}

type PastoralCouncilPageViewProps = {
  readonly executiveLeaders: ExecutiveLeaders
  readonly departmentBranches: readonly CouncilBranch[]
  readonly districtBranches: readonly CouncilBranch[]
}

type MobileTreeNode = {
  readonly id: string
  readonly kind: "leader" | "branch"
  readonly leader?: CouncilLeader
  readonly branch?: CouncilBranch
  readonly showImage?: boolean
  readonly children?: readonly MobileTreeNode[]
}

type MobileTreeLineLayout = {
  readonly childAnchors: readonly {
    readonly x: number
    readonly y: number
  }[]
  readonly lineX: number
  readonly parentY: number
  readonly stemBottomY: number
}

type BoardLine = {
  readonly x1: number
  readonly y1: number
  readonly x2: number
  readonly y2: number
  readonly dashed?: boolean
}

type CouncilBoardNodeKey =
  | "parishPriest"
  | "leftWing"
  | "rightWing"
  | "chair"
  | "viceChair"
  | "secretary"
  | "districtChief"
  | `department-${number}`
  | `district-${number}`

type CouncilBoardNodeRect = {
  readonly bottom: number
  readonly centerX: number
  readonly centerY: number
  readonly left: number
  readonly right: number
  readonly top: number
}

function getStackBottom(params: {
  readonly top: number
  readonly cardHeight: number
  readonly gap: number
  readonly count: number
  readonly bottomPadding: number
}) {
  if (params.count === 0) {
    return 0
  }

  return (
    params.top +
    params.count * params.cardHeight +
    Math.max(0, params.count - 1) * params.gap +
    params.bottomPadding
  )
}

function toBoardNodeRect(
  boardRect: DOMRect,
  element: HTMLDivElement,
): CouncilBoardNodeRect {
  const rect = element.getBoundingClientRect()

  return {
    bottom: Math.round(rect.bottom - boardRect.top),
    centerX: Math.round(rect.left - boardRect.left + rect.width / 2),
    centerY: Math.round(rect.top - boardRect.top + rect.height / 2),
    left: Math.round(rect.left - boardRect.left),
    right: Math.round(rect.right - boardRect.left),
    top: Math.round(rect.top - boardRect.top),
  }
}

function buildCouncilBoardLines({
  boardWidth,
  departmentRects,
  districtChiefRect,
  districtRects,
  leftWingRect,
  parishPriestRect,
  rightWingRect,
  chairRect,
  secretaryRect,
  viceChairRect,
}: {
  readonly boardWidth: number
  readonly departmentRects: readonly CouncilBoardNodeRect[]
  readonly districtChiefRect: CouncilBoardNodeRect
  readonly districtRects: readonly CouncilBoardNodeRect[]
  readonly leftWingRect: CouncilBoardNodeRect
  readonly parishPriestRect: CouncilBoardNodeRect
  readonly rightWingRect: CouncilBoardNodeRect
  readonly chairRect: CouncilBoardNodeRect
  readonly secretaryRect: CouncilBoardNodeRect
  readonly viceChairRect: CouncilBoardNodeRect
}): readonly BoardLine[] {
  const columnGap = Math.max(32, Math.round(boardWidth * 0.05))
  const cardTouchOverlap = Math.max(10, Math.round(boardWidth * 0.008))
  const districtBridgeLift = Math.max(24, Math.round(boardWidth * 0.025))
  const leftTrunkX = departmentRects[0].right + columnGap
  const rightTrunkX = districtRects[0].left - columnGap
  const topRowY = leftWingRect.centerY
  const middleRowY = viceChairRect.centerY
  const districtBridgeY = districtChiefRect.top - districtBridgeLift

  return [
    {
      x1: chairRect.centerX,
      y1: parishPriestRect.bottom,
      x2: chairRect.centerX,
      y2: districtChiefRect.centerY,
    },
    {
      x1: leftWingRect.right - cardTouchOverlap,
      y1: topRowY,
      x2: rightWingRect.left + cardTouchOverlap,
      y2: topRowY,
    },
    {
      x1: viceChairRect.right - cardTouchOverlap,
      y1: middleRowY,
      x2: secretaryRect.left + cardTouchOverlap,
      y2: middleRowY,
    },
    {
      x1: leftTrunkX,
      y1: departmentRects[0].centerY,
      x2: leftTrunkX,
      y2: departmentRects[departmentRects.length - 1].centerY,
    },
    {
      x1: rightTrunkX,
      y1: districtRects[0].centerY,
      x2: rightTrunkX,
      y2: districtRects[districtRects.length - 1].centerY,
    },
    {
      x1: leftTrunkX,
      y1: districtBridgeY,
      x2: chairRect.centerX,
      y2: districtBridgeY,
    },
    {
      x1: districtChiefRect.right - cardTouchOverlap,
      y1: districtChiefRect.centerY,
      x2: rightTrunkX,
      y2: districtChiefRect.centerY,
    },
    ...departmentRects.map((rect) => ({
      x1: rect.right - cardTouchOverlap,
      y1: rect.centerY,
      x2: leftTrunkX,
      y2: rect.centerY,
    })),
    ...districtRects.map((rect) => ({
      x1: rightTrunkX,
      y1: rect.centerY,
      x2: rect.left + cardTouchOverlap,
      y2: rect.centerY,
    })),
  ]
}

function useCouncilBoardLines({
  departmentCount,
  districtCount,
}: {
  readonly departmentCount: number
  readonly districtCount: number
}) {
  const boardRef = useRef<HTMLDivElement | null>(null)
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [lines, setLines] = useState<readonly BoardLine[]>([])

  useLayoutEffect(() => {
    const measure = () => {
      const board = boardRef.current

      if (!board) {
        return
      }

      const boardRect = board.getBoundingClientRect()

      if (boardRect.width === 0 || boardRect.height === 0) {
        setLines([])
        return
      }

      const parishPriestNode = nodeRefs.current.parishPriest
      const leftWingNode = nodeRefs.current.leftWing
      const rightWingNode = nodeRefs.current.rightWing
      const chairNode = nodeRefs.current.chair
      const viceChairNode = nodeRefs.current.viceChair
      const secretaryNode = nodeRefs.current.secretary
      const districtChiefNode = nodeRefs.current.districtChief

      if (
        !parishPriestNode ||
        !leftWingNode ||
        !rightWingNode ||
        !chairNode ||
        !viceChairNode ||
        !secretaryNode ||
        !districtChiefNode
      ) {
        return
      }

      const departmentNodes = Array.from(
        { length: departmentCount },
        (_, index) => nodeRefs.current[`department-${index}`],
      )
      const districtNodes = Array.from(
        { length: districtCount },
        (_, index) => nodeRefs.current[`district-${index}`],
      )

      if (
        departmentNodes.some((node) => !node) ||
        districtNodes.some((node) => !node)
      ) {
        return
      }

      const safeDepartmentNodes = departmentNodes.filter(
        (node): node is HTMLDivElement => node !== null,
      )
      const safeDistrictNodes = districtNodes.filter(
        (node): node is HTMLDivElement => node !== null,
      )

      const departmentRects = safeDepartmentNodes.map((node) =>
        toBoardNodeRect(boardRect, node),
      )
      const districtRects = safeDistrictNodes.map((node) =>
        toBoardNodeRect(boardRect, node),
      )

      setLines(
        buildCouncilBoardLines({
          boardWidth: Math.round(boardRect.width),
          departmentRects,
          districtChiefRect: toBoardNodeRect(boardRect, districtChiefNode),
          districtRects,
          leftWingRect: toBoardNodeRect(boardRect, leftWingNode),
          parishPriestRect: toBoardNodeRect(boardRect, parishPriestNode),
          rightWingRect: toBoardNodeRect(boardRect, rightWingNode),
          chairRect: toBoardNodeRect(boardRect, chairNode),
          secretaryRect: toBoardNodeRect(boardRect, secretaryNode),
          viceChairRect: toBoardNodeRect(boardRect, viceChairNode),
        }),
      )
    }

    const animationFrameId = requestAnimationFrame(measure)
    const resizeObserver = new ResizeObserver(() => {
      measure()
    })

    if (boardRef.current) {
      resizeObserver.observe(boardRef.current)
    }

    Object.values(nodeRefs.current).forEach((node) => {
      if (node) {
        resizeObserver.observe(node)
      }
    })

    window.addEventListener("resize", measure)

    return () => {
      cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [departmentCount, districtCount])

  const registerNode =
    (key: CouncilBoardNodeKey) => (element: HTMLDivElement | null) => {
      nodeRefs.current[key] = element
    }

  return {
    boardRef,
    lines,
    registerNode,
  }
}

function CouncilBoardLines({
  lines,
}: {
  readonly lines: readonly BoardLine[]
}) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
    >
      {lines.map((line, index) => (
        <line
          key={`${line.x1}-${line.y1}-${line.x2}-${line.y2}-${index}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="square"
          strokeDasharray={line.dashed ? "4 4" : undefined}
          className="text-border"
        />
      ))}
    </svg>
  )
}

function CouncilNode({
  leader,
  compact = false,
  fixedImageSize = false,
  showIcon = true,
  showImage = false,
  className,
}: {
  readonly leader: CouncilLeader
  readonly compact?: boolean
  readonly fixedImageSize?: boolean
  readonly showIcon?: boolean
  readonly showImage?: boolean
  readonly className?: string
}) {
  return (
    <article
      data-tree-surface
      className={cn(
        "relative h-[156px] overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[0_18px_50px_-30px_rgba(15,23,42,0.45)]",
        compact &&
          "h-[128px] rounded-2xl shadow-[0_14px_34px_-24px_rgba(15,23,42,0.38)]",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex h-full items-center gap-4 p-5",
          compact && "gap-3 p-3.5",
          !showIcon && !showImage && "justify-center",
        )}
      >
        {showImage ? (
          <div
            className={cn(
              "relative h-[96px] w-[78px] shrink-0 overflow-hidden rounded-[12px] border border-border/70 bg-secondary",
              compact && !fixedImageSize && "h-[64px] w-[52px] rounded-[10px]",
            )}
          >
            <Image
              src={leader.imageUrl ?? leader.fallbackImageUrl}
              alt={`${leader.name} 프로필 사진`}
              fill
              sizes={compact && !fixedImageSize ? "52px" : "78px"}
              className="object-cover"
            />
          </div>
        ) : null}
        {showIcon ? (
          <div
            className={cn(
              "flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border/70 shadow-inner",
              compact && "size-10 rounded-xl",
              "bg-secondary text-muted-foreground",
            )}
          >
            <UsersRound className={cn("size-6", compact && "size-[18px]")} />
          </div>
        ) : null}
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col justify-center gap-2",
            compact && "gap-1.5",
          )}
        >
          <Badge
            variant="secondary"
            className={cn(
              "inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em]",
              compact && "px-2 py-0.5 text-[10px]",
              !showIcon && !showImage ? "self-center" : "self-start",
              "bg-secondary text-muted-foreground",
            )}
          >
            {leader.role}
          </Badge>
          <div
            className={cn(
              "space-y-1",
              !showIcon && !showImage && "text-center",
            )}
          >
            <p
              className={cn(
                "text-lg font-semibold tracking-[-0.02em]",
                compact && "text-sm leading-5",
                "text-foreground",
              )}
            >
              {leader.name}
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}

function BranchNode({
  branch,
  compact = false,
  fixedImageSize = false,
}: {
  readonly branch: CouncilBranch
  readonly compact?: boolean
  readonly fixedImageSize?: boolean
}) {
  return (
    <article
      data-tree-surface
      className={cn(
        "h-[156px] rounded-2xl border border-border/70 bg-card px-5 py-4 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.38)]",
        compact &&
          "h-[128px] rounded-xl px-3.5 py-3 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)]",
      )}
    >
      <div className={cn("flex h-full items-center gap-4", compact && "gap-3")}>
        <div
          className={cn(
            "relative h-[96px] w-[78px] shrink-0 overflow-hidden rounded-[12px] border border-border/70 bg-secondary",
            compact && !fixedImageSize && "h-[64px] w-[52px] rounded-[10px]",
          )}
        >
          <Image
            src={branch.imageUrl ?? branch.fallbackImageUrl}
            alt={`${branch.role} ${branch.name} 프로필 사진`}
            fill
            sizes={compact && !fixedImageSize ? "52px" : "78px"}
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-[15px] font-semibold tracking-[-0.02em] text-muted-foreground",
              compact && "text-[13px] leading-5",
            )}
          >
            {branch.role}
          </p>
          <p
            className={cn(
              "mt-1 text-sm leading-6 text-foreground",
              compact && "text-[13px] leading-5",
            )}
          >
            {branch.name}
          </p>
        </div>
      </div>
    </article>
  )
}

function MobileSectionTitle({ title }: { readonly title: string }) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold tracking-[-0.02em] text-[#252629]">
        {title}
      </h3>
      <div className="h-px bg-border/70" />
    </div>
  )
}

function MobileTreeItem({
  node,
  isRoot = false,
  depth = 1,
}: {
  readonly node: MobileTreeNode
  readonly isRoot?: boolean
  readonly depth?: number
}) {
  const children = node.children ?? []
  const isThirdDepthOrDeeper = depth >= 3
  const containerRef = useRef<HTMLDivElement | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const childItemRefs = useRef<Array<HTMLDivElement | null>>([])
  const [lineLayout, setLineLayout] = useState<MobileTreeLineLayout | null>(
    null,
  )

  useLayoutEffect(() => {
    if (!children.length) {
      setLineLayout(null)
      return
    }

    const childIndentX = 17
    const nestedStemInsetX = 12

    const measure = () => {
      const container = containerRef.current
      const card = cardRef.current

      if (!container || !card) {
        return
      }

      const containerRect = container.getBoundingClientRect()
      const cardRect = card.getBoundingClientRect()
      const lineX = isRoot ? childIndentX : childIndentX + nestedStemInsetX
      const parentY = Math.round(
        isRoot
          ? cardRect.top - containerRect.top + cardRect.height / 2
          : cardRect.bottom - containerRect.top,
      )

      const childAnchors = childItemRefs.current
        .slice(0, children.length)
        .map((childItem) => {
          const childCard = childItem?.querySelector<HTMLElement>(
            "[data-tree-surface]",
          )

          if (!childCard) {
            return null
          }

          const childRect = childCard.getBoundingClientRect()

          return {
            x: Math.round(childRect.left - containerRect.left),
            y: Math.round(
              childRect.top - containerRect.top + childRect.height / 2,
            ),
          }
        })
        .filter(
          (
            value,
          ): value is {
            readonly x: number
            readonly y: number
          } => value !== null,
        )

      if (childAnchors.length !== children.length) {
        return
      }

      const nextLayout = {
        childAnchors,
        lineX,
        parentY,
        stemBottomY: childAnchors[childAnchors.length - 1].y,
      } satisfies MobileTreeLineLayout

      setLineLayout((previousLayout) => {
        if (
          previousLayout &&
          previousLayout.lineX === nextLayout.lineX &&
          previousLayout.parentY === nextLayout.parentY &&
          previousLayout.stemBottomY === nextLayout.stemBottomY &&
          previousLayout.childAnchors.length ===
            nextLayout.childAnchors.length &&
          previousLayout.childAnchors.every(
            (value, index) =>
              value.x === nextLayout.childAnchors[index]?.x &&
              value.y === nextLayout.childAnchors[index]?.y,
          )
        ) {
          return previousLayout
        }

        return nextLayout
      })
    }

    measure()

    const resizeObserver = new ResizeObserver(() => {
      measure()
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    if (cardRef.current) {
      resizeObserver.observe(cardRef.current)
    }

    childItemRefs.current.forEach((childItem) => {
      if (childItem) {
        resizeObserver.observe(childItem)
      }
    })

    window.addEventListener("resize", measure)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [children.length, isRoot])

  return (
    <div ref={containerRef} className="relative">
      {children.length && lineLayout ? (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
        >
          <path
            d={`M${lineLayout.lineX} ${lineLayout.parentY} V ${lineLayout.stemBottomY}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-border/70"
          />

          {lineLayout.childAnchors.map((childAnchor, index) => (
            <path
              key={`${node.id}-${index}-${childAnchor.x}-${childAnchor.y}`}
              d={`M${lineLayout.lineX} ${childAnchor.y} H ${childAnchor.x}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-border/70"
            />
          ))}
        </svg>
      ) : null}

      <div
        ref={cardRef}
        data-tree-card
        className={cn("relative z-10", !isRoot && "ml-[17px] mt-3")}
      >
        {node.kind === "leader" && node.leader ? (
          <CouncilNode
            leader={node.leader}
            compact={!isRoot}
            fixedImageSize
            showIcon={!node.showImage}
            showImage={node.showImage}
            className={cn(
              "w-full",
              isThirdDepthOrDeeper && "ml-auto w-[calc(100%-17px)]",
            )}
          />
        ) : null}

        {node.kind === "branch" && node.branch ? (
          <div
            className={cn(
              isThirdDepthOrDeeper && "ml-auto w-[calc(100%-17px)]",
            )}
          >
            <BranchNode branch={node.branch} compact fixedImageSize />
          </div>
        ) : null}
      </div>

      {children.length ? (
        <div className="ml-[17px]">
          {children.map((child, index) => (
            <div
              key={child.id}
              ref={(element) => {
                childItemRefs.current[index] = element
              }}
              className="relative"
            >
              <MobileTreeItem node={child} depth={depth + 1} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function PastoralCouncilPageView({
  executiveLeaders,
  departmentBranches,
  districtBranches,
}: PastoralCouncilPageViewProps) {
  const desktopMinHeight = Math.max(
    1640,
    getStackBottom({
      top: 560,
      cardHeight: 156,
      gap: 16,
      count: departmentBranches.length,
      bottomPadding: 48,
    }),
    getStackBottom({
      top: 560,
      cardHeight: 156,
      gap: 16,
      count: districtBranches.length,
      bottomPadding: 48,
    }),
    940 + 156 + 48,
  )
  const tabletMinHeight = Math.max(
    1560,
    getStackBottom({
      top: 452,
      cardHeight: 128,
      gap: 12,
      count: departmentBranches.length,
      bottomPadding: 48,
    }),
    getStackBottom({
      top: 452,
      cardHeight: 128,
      gap: 12,
      count: districtBranches.length,
      bottomPadding: 48,
    }),
    720 + 128 + 48,
  )
  const desktopBoard = useCouncilBoardLines({
    departmentCount: departmentBranches.length,
    districtCount: districtBranches.length,
  })
  const tabletBoard = useCouncilBoardLines({
    departmentCount: departmentBranches.length,
    districtCount: districtBranches.length,
  })

  const mobileTree: MobileTreeNode = {
    id: "parish-priest",
    kind: "leader",
    leader: executiveLeaders.parishPriest,
    showImage: true,
    children: [
      {
        id: "assistant-priest",
        kind: "leader",
        leader: executiveLeaders.leftWing,
        showImage: true,
      },
      {
        id: "religious",
        kind: "leader",
        leader: executiveLeaders.rightWing,
        showImage: true,
      },
      {
        id: "chair",
        kind: "leader",
        leader: executiveLeaders.chair,
        showImage: true,
        children: [
          {
            id: "vice-chair",
            kind: "leader",
            leader: executiveLeaders.viceChair,
            showImage: true,
          },
          {
            id: "secretary",
            kind: "leader",
            leader: executiveLeaders.secretary,
            showImage: true,
          },
        ],
      },
    ],
  }
  const mobileDistrictTree: MobileTreeNode = {
    id: "district-chief",
    kind: "leader",
    leader: executiveLeaders.districtChief,
    showImage: true,
    children: districtBranches.map((branch) => ({
      id: `district-${branch.role}`,
      kind: "branch" as const,
      branch,
    })),
  }

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 pb-10 md:px-8 md:pb-14">
      <div className="space-y-10">
        <div className="hidden xl:block">
          <div
            ref={desktopBoard.boardRef}
            className="relative"
            style={{ minHeight: `${desktopMinHeight}px` }}
          >
            <CouncilBoardLines lines={desktopBoard.lines} />

            <div
              ref={desktopBoard.registerNode("parishPriest")}
              className="absolute left-1/2 top-0 w-[280px] -translate-x-1/2"
            >
              <CouncilNode
                leader={executiveLeaders.parishPriest}
                showIcon={false}
                showImage
              />
            </div>

            <div
              ref={desktopBoard.registerNode("leftWing")}
              className="absolute left-[24px] top-[150px] w-[280px]"
            >
              <CouncilNode
                leader={executiveLeaders.leftWing}
                showIcon={false}
                showImage
              />
            </div>

            <div
              ref={desktopBoard.registerNode("chair")}
              className="absolute left-1/2 top-[258px] w-[280px] -translate-x-1/2"
            >
              <CouncilNode
                leader={executiveLeaders.chair}
                showIcon={false}
                showImage
              />
            </div>

            <div
              ref={desktopBoard.registerNode("rightWing")}
              className="absolute right-[24px] top-[150px] w-[280px]"
            >
              <CouncilNode
                leader={executiveLeaders.rightWing}
                showIcon={false}
                showImage
              />
            </div>

            <div
              ref={desktopBoard.registerNode("viceChair")}
              className="absolute left-[88px] top-[376px] w-[280px]"
            >
              <CouncilNode
                leader={executiveLeaders.viceChair}
                showIcon={false}
                showImage
              />
            </div>

            <div
              ref={desktopBoard.registerNode("secretary")}
              className="absolute right-[88px] top-[376px] w-[280px]"
            >
              <CouncilNode
                leader={executiveLeaders.secretary}
                showIcon={false}
                showImage
              />
            </div>

            <div className="absolute left-0 top-[560px] w-[280px] space-y-4">
              {departmentBranches.map((branch, index) => (
                <div
                  key={branch.role}
                  ref={desktopBoard.registerNode(`department-${index}`)}
                >
                  <BranchNode branch={branch} />
                </div>
              ))}
            </div>

            <div
              ref={desktopBoard.registerNode("districtChief")}
              className="absolute left-[57%] top-[940px] w-[280px] -translate-x-1/2"
            >
              <CouncilNode
                leader={executiveLeaders.districtChief}
                showIcon={false}
                showImage
              />
            </div>

            <div className="absolute right-0 top-[560px] w-[280px] space-y-4">
              {districtBranches.map((branch, index) => (
                <div
                  key={branch.role}
                  ref={desktopBoard.registerNode(`district-${index}`)}
                >
                  <BranchNode branch={branch} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden md:block xl:hidden">
          <div
            ref={tabletBoard.boardRef}
            className="relative"
            style={{ minHeight: `${tabletMinHeight}px` }}
          >
            <CouncilBoardLines lines={tabletBoard.lines} />

            <div
              ref={tabletBoard.registerNode("parishPriest")}
              className="absolute left-1/2 top-0 w-[192px] -translate-x-1/2"
            >
              <CouncilNode
                leader={executiveLeaders.parishPriest}
                compact
                showIcon={false}
                showImage
              />
            </div>

            <div
              ref={tabletBoard.registerNode("leftWing")}
              className="absolute left-0 top-[116px] w-[192px]"
            >
              <CouncilNode
                leader={executiveLeaders.leftWing}
                compact
                showIcon={false}
                showImage
              />
            </div>

            <div
              ref={tabletBoard.registerNode("chair")}
              className="absolute left-1/2 top-[210px] w-[192px] -translate-x-1/2"
            >
              <CouncilNode
                leader={executiveLeaders.chair}
                compact
                showIcon={false}
                showImage
              />
            </div>

            <div
              ref={tabletBoard.registerNode("rightWing")}
              className="absolute right-0 top-[116px] w-[192px]"
            >
              <CouncilNode
                leader={executiveLeaders.rightWing}
                compact
                showIcon={false}
                showImage
              />
            </div>

            <div
              ref={tabletBoard.registerNode("viceChair")}
              className="absolute left-[16px] top-[296px] w-[192px]"
            >
              <CouncilNode
                leader={executiveLeaders.viceChair}
                compact
                showIcon={false}
                showImage
              />
            </div>

            <div
              ref={tabletBoard.registerNode("secretary")}
              className="absolute right-[16px] top-[296px] w-[192px]"
            >
              <CouncilNode
                leader={executiveLeaders.secretary}
                compact
                showIcon={false}
                showImage
              />
            </div>

            <div className="absolute left-0 top-[452px] w-[192px] space-y-3">
              {departmentBranches.map((branch, index) => (
                <div
                  key={branch.role}
                  ref={tabletBoard.registerNode(`department-${index}`)}
                >
                  <BranchNode branch={branch} compact />
                </div>
              ))}
            </div>

            <div
              ref={tabletBoard.registerNode("districtChief")}
              className="absolute left-[55%] top-[720px] w-[192px] -translate-x-1/2"
            >
              <CouncilNode
                leader={executiveLeaders.districtChief}
                compact
                showIcon={false}
                showImage
              />
            </div>

            <div className="absolute right-0 top-[452px] w-[192px] space-y-3">
              {districtBranches.map((branch, index) => (
                <div
                  key={branch.role}
                  ref={tabletBoard.registerNode(`district-${index}`)}
                >
                  <BranchNode branch={branch} compact />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:hidden">
          <div className="space-y-8">
            <MobileTreeItem node={mobileTree} isRoot />

            <section className="space-y-4">
              <MobileSectionTitle title="분과 담당" />
              <div className="space-y-3">
                {departmentBranches.map((branch) => (
                  <BranchNode key={branch.role} branch={branch} />
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <MobileSectionTitle title="구역/지역 담당" />
              <MobileTreeItem node={mobileDistrictTree} isRoot />
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}
