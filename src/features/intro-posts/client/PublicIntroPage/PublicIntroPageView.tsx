import Image from "next/image"
import { ReactMarkdownViewer } from "@/components/ReactMarkdownViewer"
import {
  getIntroPostSectionConfig,
  type IntroPostListItemDto,
  type IntroPostSectionKey,
} from "@/features/intro-posts/isomorphic"

type PublicIntroPageViewProps = {
  section: IntroPostSectionKey
  items: IntroPostListItemDto[]
  isLoading: boolean
  isError: boolean
}

export function PublicIntroPageView({
  section,
  items,
  isLoading,
  isError,
}: PublicIntroPageViewProps) {
  const config = getIntroPostSectionConfig(section)

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-5 md:px-8 md:py-14">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#252629] md:text-3xl">
          {config.publicPageTitle}
        </h2>
      </div>

      {isLoading && items.length === 0 ? (
        <div className="mt-10 space-y-16 md:space-y-20">
          {["public-intro-sk-1", "public-intro-sk-2"].map((key) => (
            <article
              key={key}
              className="space-y-6 lg:grid lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:items-start lg:gap-12 lg:space-y-0"
            >
              <div className="aspect-video animate-pulse overflow-hidden rounded-[28px] bg-[#eceff3]" />
              <div className="max-w-3xl space-y-3 pt-1">
                <div className="h-8 w-56 animate-pulse rounded bg-[#eceff3]" />
                <div className="h-4 w-full animate-pulse rounded bg-[#eceff3]" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-[#eceff3]" />
                <div className="h-4 w-4/6 animate-pulse rounded bg-[#eceff3]" />
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {isError && items.length === 0 ? (
        <div className="mt-10 text-sm text-[#777]">
          {config.publicPageTitle} 목록을 불러오지 못했습니다.
        </div>
      ) : null}

      {!isLoading && !isError && items.length === 0 ? (
        <div className="mt-10 text-sm text-[#777]">
          {config.publicEmptyMessage}
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="mt-10 space-y-16 md:mt-12 md:space-y-20">
          {items.map((item) => (
            <article
              key={item.id}
              className="space-y-6 lg:grid lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:items-start lg:gap-12 lg:space-y-0"
            >
              <div className="relative aspect-video overflow-hidden rounded-[28px] bg-[#f3f4f6]">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1280px) 520px, (min-width: 1024px) 44vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                    대표 이미지 없음
                  </div>
                )}
              </div>

              <div className="max-w-3xl space-y-4 pt-1">
                <h3 className="text-2xl font-semibold tracking-[-0.02em] text-[#252629] md:text-3xl">
                  {item.title}
                </h3>
                <ReactMarkdownViewer content={item.content} />
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
