"use client"

import { useState } from "react"

import { PrayerPageView } from "./PrayerPageView"
import {
  PRAYER_ENTRIES,
  PRAYER_TABS,
  type PrayerEntry,
  type PrayerTabId,
} from "./prayer.data"

function filterEntries(entries: PrayerEntry[], activeTab: PrayerTabId) {
  if (activeTab === "all") {
    return entries
  }

  return entries.filter((entry) => entry.id === activeTab)
}

export function PrayerPageContainer() {
  const [activeTab, setActiveTab] = useState<PrayerTabId>("all")

  return (
    <PrayerPageView
      activeTab={activeTab}
      tabs={PRAYER_TABS}
      entries={filterEntries(PRAYER_ENTRIES, activeTab)}
      onTabChange={setActiveTab}
    />
  )
}
