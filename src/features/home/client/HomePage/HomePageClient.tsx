"use client"

import { useHomePageQuery } from "@/features/home/isomorphic"
import { HomeBoardsSection } from "./HomeBoardsSection"
import { HomeEventsSection } from "./HomeEventsSection"
import { HomeFooter } from "./HomeFooter"
import { HomeHeader } from "./HomeHeader"
import { HomeHeroSection } from "./HomeHeroSection"
import { HomeSchedulerSection } from "./HomeSchedulerSection"
import { homePageMock } from "./home.mock"

export function HomePageClient() {
  const { data } = useHomePageQuery()

  const viewModel = data
    ? {
        ...homePageMock,
        schedulerMonthLabel: data.schedulerMonthLabel,
        schedulerItems: data.schedulerItems,
        eventCards: data.eventCards,
        boardColumns: data.boardColumns,
      }
    : homePageMock

  return (
    <main className="min-h-screen bg-white text-[#252629]">
      <div className="relative">
        <HomeHeader navItems={viewModel.navItems} />
        <HomeHeroSection quickLinks={viewModel.quickLinks} />
      </div>
      <HomeSchedulerSection
        monthLabel={viewModel.schedulerMonthLabel}
        items={viewModel.schedulerItems}
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
