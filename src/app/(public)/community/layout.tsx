import type { ReactNode } from "react"

import { HomeFooter, HomeHeader, homePageMock } from "@/features/home/client"

type SubLayout = {
  children: ReactNode
}

export default async function SubLayout({ children }: SubLayout) {
  const { navItems, massTimes } = homePageMock

  return (
    <main className="flex min-h-screen flex-col bg-white text-[#252629]">
      <div className="relative">
        <HomeHeader navItems={navItems} />
      </div>

      <section className="flex-1">{children}</section>

      <HomeFooter massTimes={massTimes} />
    </main>
  )
}
