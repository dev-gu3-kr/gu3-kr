import type { HomeNavItem } from "@/features/home/isomorphic"

type HomeHeaderProps = {
  readonly navItems: readonly HomeNavItem[]
}

export function HomeHeader({ navItems }: HomeHeaderProps) {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex h-22 w-full max-w-[1380px] items-center justify-between px-5 text-white md:px-8">
        <div className="flex items-center gap-4">
          <div className="grid size-12 place-items-center rounded-full border border-white/40 bg-white/90 text-[10px] font-bold tracking-[0.24em] text-[#7a1418]">
            G3
          </div>
          <div className="leading-tight">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/70">
              Catholic Cathedral
            </p>
            <p className="text-sm font-semibold md:text-base">
              천주교 서울대교구 구로3동성당
            </p>
          </div>
        </div>
        <nav className="hidden w-[960px] items-center justify-between pl-6 text-sm font-semibold lg:flex">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className="w-[100px] cursor-default text-center transition-opacity hover:opacity-70"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
