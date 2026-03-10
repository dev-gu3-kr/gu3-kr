import type { ComponentType, SVGProps } from "react"

export type HomeNavItem = {
  readonly label: string
  readonly href?: string
}

export type HomeQuickLinkItem = {
  readonly label: string
  readonly href?: string
  readonly icon: ComponentType<SVGProps<SVGSVGElement>>
}

export type HomeSchedulerItem = {
  readonly dateIso: string
  readonly dayLabel: string
  readonly dayNumber: number
  readonly isActive?: boolean
  readonly events: readonly string[]
}

export type HomeSchedulerMonthDataDto = {
  readonly schedulerMonthLabel: string
  readonly schedulerItems: readonly HomeSchedulerItem[]
}

export type HomeEventCard = {
  readonly title: string
  readonly description: string
  readonly accentClassName: string
  readonly thumbnailUrl?: string | null
}

export type HomeBoardItem = {
  readonly title: string
  readonly date: string
}

export type HomeBoardColumn = {
  readonly title: string
  readonly href?: string
  readonly items: readonly HomeBoardItem[]
}

export type HomeShortcutCard = {
  readonly title: string
  readonly subtitle: string
  readonly accentClassName: string
  readonly thumbnailUrl?: string | null
}

export type HomeFooterMassTime = {
  readonly title: string
  readonly lines: readonly string[]
}

export type HomePageViewModel = {
  readonly navItems: readonly HomeNavItem[]
  readonly quickLinks: readonly HomeQuickLinkItem[]
  readonly schedulerMonthLabel: string
  readonly schedulerItems: readonly HomeSchedulerItem[]
  readonly eventCards: readonly HomeEventCard[]
  readonly boardColumns: readonly HomeBoardColumn[]
  readonly shortcutCards: readonly HomeShortcutCard[]
  readonly massTimes: readonly HomeFooterMassTime[]
}

export type HomePageDataDto = Pick<
  HomePageViewModel,
  "schedulerMonthLabel" | "schedulerItems" | "eventCards" | "boardColumns"
> & {
  readonly schedulerByMonth: Readonly<Record<string, HomeSchedulerMonthDataDto>>
}

export type HomePageResponseDto = {
  readonly ok: boolean
} & HomePageDataDto
