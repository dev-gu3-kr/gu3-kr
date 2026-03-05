"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { Toaster } from "sonner"
import { RouteProgress } from "./RouteProgress"

type Props = {
  children: React.ReactNode
}

export function Providers({ children }: Props) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <RouteProgress />
      {children}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  )
}
