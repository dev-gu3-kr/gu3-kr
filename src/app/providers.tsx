"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { Suspense } from "react"
import { Toaster } from "sonner"
import { getQueryClient } from "@/lib/react-query"
import { RouteProgress } from "./RouteProgress"

type Props = {
  children: React.ReactNode
}

export function Providers({ children }: Props) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <RouteProgress />
      </Suspense>
      {children}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  )
}
