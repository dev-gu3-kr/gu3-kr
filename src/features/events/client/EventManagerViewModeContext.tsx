"use client"

import { createContext, useContext, useMemo, useState } from "react"

type EventViewMode = "scheduler" | "list"

type EventManagerViewModeContextValue = {
  viewMode: EventViewMode
  setViewMode: (next: EventViewMode) => void
}

// 일정관리 하위 페이지 간 탭 상태를 유지하기 위한 컨텍스트다.
const EventManagerViewModeContext =
  createContext<EventManagerViewModeContextValue | null>(null)

export function EventManagerViewModeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [viewMode, setViewMode] = useState<EventViewMode>("scheduler")

  const value = useMemo(() => ({ viewMode, setViewMode }), [viewMode])

  return (
    <EventManagerViewModeContext.Provider value={value}>
      {children}
    </EventManagerViewModeContext.Provider>
  )
}

export function useEventManagerViewMode() {
  const context = useContext(EventManagerViewModeContext)
  if (!context) {
    throw new Error(
      "useEventManagerViewMode must be used within EventManagerViewModeProvider",
    )
  }
  return context
}
