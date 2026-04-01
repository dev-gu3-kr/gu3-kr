import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import Image from "next/image"
import { AppLink as Link } from "@/components/AppLink"
import {
  buildIntroPostEditPath,
  getIntroPostContentPreview,
  getIntroPostSectionConfig,
  type IntroPostListItemDto,
  type IntroPostSectionKey,
} from "@/features/intro-posts/isomorphic"

type IntroPostListViewProps = {
  section: IntroPostSectionKey
  items: IntroPostListItemDto[]
  isLoading: boolean
  isError: boolean
}

export function IntroPostListView({
  section,
  items,
  isLoading,
  isError,
}: IntroPostListViewProps) {
  const config = getIntroPostSectionConfig(section)

  if (isLoading && items.length === 0) {
    return (
      <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {["intro-sk-1", "intro-sk-2", "intro-sk-3"].map((key) => (
          <li key={key} className="overflow-hidden rounded-lg border bg-white">
            <div className="aspect-video animate-pulse bg-neutral-200" />
            <div className="space-y-3 p-4">
              <div className="h-6 w-2/3 animate-pulse rounded bg-neutral-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-neutral-200" />
              <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200" />
            </div>
          </li>
        ))}
      </ul>
    )
  }

  if (isError && items.length === 0) {
    return (
      <p className="text-sm text-red-600">
        {config.menuLabel} 목록을 불러오지 못했습니다.
      </p>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-white p-8 text-center text-sm text-neutral-500">
        {config.adminEmptyMessage}
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {items.map((item) => {
        const preview = getIntroPostContentPreview(item.content)

        return (
          <li key={item.id}>
            <Link
              href={buildIntroPostEditPath(section, item.id)}
              className="block overflow-hidden rounded-lg border bg-white transition-colors hover:bg-neutral-50"
            >
              <div className="relative aspect-video bg-neutral-100">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                    대표 이미지 없음
                  </div>
                )}
              </div>

              <div className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                    정렬 {item.sortOrder}
                  </span>
                  <span
                    className={
                      item.isPublished
                        ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
                        : "rounded-full bg-neutral-200 px-2 py-1 text-xs font-medium text-neutral-600"
                    }
                  >
                    {item.isPublished ? "공개" : "비공개"}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-neutral-900">
                  {item.title}
                </h2>

                <p className="line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                  {preview || "내용이 없습니다."}
                </p>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
