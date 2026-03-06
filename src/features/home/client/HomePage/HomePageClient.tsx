"use client"

import * as React from "react"
import { useHomePageQuery } from "@/features/home/isomorphic"
import { HomeBoardsSection } from "./HomeBoardsSection"
import { HomeEventsSection } from "./HomeEventsSection"
import { HomeFooter } from "./HomeFooter"
import { HomeHeader } from "./HomeHeader"
import { HomeHeroSection } from "./HomeHeroSection"
import { HomeSchedulerSection } from "./HomeSchedulerSection"
import { homePageMock } from "./home.mock"

function formatMonthKey(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0")

  return `${date.getFullYear()}-${month}`
}

function shiftMonth(monthKey: string, offset: number) {
  const [year, month] = monthKey.split("-").map(Number)
  return formatMonthKey(new Date(year, month - 1 + offset, 1))
}

export function HomePageClient() {
  const [schedulerMonthKey, setSchedulerMonthKey] = React.useState(() =>
    formatMonthKey(new Date()),
  )
  const [schedulerResetMode, setSchedulerResetMode] = React.useState<
    "active" | "start" | "end"
  >("active")
  const { data, isFetching } = useHomePageQuery(schedulerMonthKey)

  const viewModel = data
    ? {
        ...homePageMock,
        schedulerMonthLabel: data.schedulerMonthLabel,
        schedulerItems: data.schedulerItems,
        eventCards: data.eventCards,
        boardColumns: data.boardColumns,
      }
    : homePageMock

  const handleRequestPreviousMonth = React.useCallback(() => {
    setSchedulerResetMode("end")
    setSchedulerMonthKey((currentMonthKey) => shiftMonth(currentMonthKey, -1))
  }, [])

  const handleRequestNextMonth = React.useCallback(() => {
    setSchedulerResetMode("start")
    setSchedulerMonthKey((currentMonthKey) => shiftMonth(currentMonthKey, 1))
  }, [])

  return (
    <main className="min-h-screen bg-white text-[#252629]">
      <div className="relative">
        <HomeHeader navItems={viewModel.navItems} />
        <HomeHeroSection quickLinks={viewModel.quickLinks} />
      </div>
      <HomeSchedulerSection
        monthLabel={viewModel.schedulerMonthLabel}
        items={viewModel.schedulerItems}
        pageResetMode={schedulerResetMode}
        isNavigatingMonth={isFetching}
        onRequestPreviousMonth={handleRequestPreviousMonth}
        onRequestNextMonth={handleRequestNextMonth}
      />
      <HomeEventsSection cards={viewModel.eventCards} />
      <HomeBoardsSection
        boardColumns={viewModel.boardColumns}
        shortcutCards={viewModel.shortcutCards}
      />
      <HomeFooter massTimes={viewModel.massTimes} />
    </main>
  )
}
