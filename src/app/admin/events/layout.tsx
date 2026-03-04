import { EventManagerViewModeProvider } from "@/features/events/client"

export default function AdminEventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <EventManagerViewModeProvider>{children}</EventManagerViewModeProvider>
}
