"use client"

import { useEffect, useRef } from "react"

type InfiniteSentinelProps = {
  hasMore: boolean
  disabled?: boolean
  onLoadMore: () => Promise<void> | void
  className?: string
}

export function InfiniteSentinel({
  hasMore,
  disabled = false,
  onLoadMore,
  className,
}: InfiniteSentinelProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current || !hasMore || disabled) return

    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting || disabled) return
        await onLoadMore()
      },
      { rootMargin: "240px 0px" },
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [hasMore, disabled, onLoadMore])

  return (
    <div className={className}>
      <div ref={ref} className="h-1" />

      {hasMore ? (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => void onLoadMore()}
            disabled={disabled}
            className="w-full rounded-md border px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {disabled ? "불러오는 중..." : "더 보기"}
          </button>
        </div>
      ) : null}
    </div>
  )
}
