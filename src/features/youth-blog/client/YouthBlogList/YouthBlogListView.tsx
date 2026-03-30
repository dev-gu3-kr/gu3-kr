import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { Loader2, Search } from "lucide-react"
import Image from "next/image"
import { AppLink as Link } from "@/components/AppLink"
import { InfiniteSentinel } from "@/components/InfiniteSentinel"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type {
  YouthBlogListItemDto,
  YouthBlogPublishFilterDto,
} from "@/features/youth-blog/isomorphic"

type YouthBlogListViewProps = {
  queryInput: string
  status: YouthBlogPublishFilterDto
  items: YouthBlogListItemDto[]
  isLoading: boolean
  isError: boolean
  isFilterFetching: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  loadedImageIds: Set<string>
  failedImageIds: Set<string>
  onQueryInputChange: (value: string) => void
  onStatusChange: (value: YouthBlogPublishFilterDto) => void
  onLoadMore: () => Promise<void>
  onImageLoad: (id: string) => void
  onImageError: (id: string) => void
}

function getContentPreview(content: string) {
  return content
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*([-*+]|\d+\.)\s+/gm, "")
    .replace(/[>*_~|]/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function YouthBlogListView({
  queryInput,
  status,
  items,
  isLoading,
  isError,
  isFilterFetching,
  isFetchingNextPage,
  hasNextPage,
  loadedImageIds,
  failedImageIds,
  onQueryInputChange,
  onStatusChange,
  onLoadMore,
  onImageLoad,
  onImageError,
}: YouthBlogListViewProps) {
  return (
    <div className="space-y-3">
      <section className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={status}
            onValueChange={(value) => {
              if (
                value === "all" ||
                value === "published" ||
                value === "draft"
              ) {
                onStatusChange(value)
              }
            }}
            className="justify-start"
          >
            <ToggleGroupItem value="all" aria-label="전체">
              전체
            </ToggleGroupItem>
            <ToggleGroupItem value="published" aria-label="공개">
              공개
            </ToggleGroupItem>
            <ToggleGroupItem value="draft" aria-label="비공개">
              비공개
            </ToggleGroupItem>
          </ToggleGroup>

          {isFilterFetching || isFetchingNextPage ? (
            <p className="inline-flex items-center gap-1 text-xs text-neutral-500 sm:hidden">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              불러오는 중
            </p>
          ) : null}
        </div>

        <div className="relative sm:max-w-sm sm:flex-1">
          <input
            value={queryInput}
            onChange={(event) => onQueryInputChange(event.target.value)}
            placeholder="검색"
            className="w-full rounded-md border px-3 py-2 pr-10 text-sm"
          />
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        </div>

        {isFilterFetching || isFetchingNextPage ? (
          <p className="hidden items-center gap-1 text-xs text-neutral-500 sm:inline-flex">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            불러오는 중
          </p>
        ) : null}
      </section>

      {isLoading && items.length === 0 ? (
        <ul className="grid grid-cols-1 gap-3">
          {["yb-sk-1", "yb-sk-2", "yb-sk-3", "yb-sk-4"].map((key) => (
            <li
              key={key}
              className="animate-pulse overflow-hidden rounded-md border"
            >
              <div className="space-y-3 p-4 pb-3">
                <div className="h-5 w-3/5 rounded bg-neutral-200" />
              </div>
              <div className="aspect-video bg-neutral-200" />
              <div className="space-y-2 p-4 pt-3">
                <div className="h-4 w-full rounded bg-neutral-200" />
                <div className="h-4 w-5/6 rounded bg-neutral-200" />
                <div className="h-3 w-32 rounded bg-neutral-200" />
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {isError && items.length === 0 ? (
        <p className="text-sm text-red-600">
          청소년 블로그 목록을 불러오지 못했습니다.
        </p>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-md border p-4 text-sm text-neutral-500">
          검색 결과가 없습니다.
        </div>
      ) : (
        <ul
          className={
            isFilterFetching
              ? "pointer-events-none grid grid-cols-1 gap-3 opacity-60"
              : "grid grid-cols-1 gap-3"
          }
        >
          {items.map((notice, index) => {
            const preview = getContentPreview(notice.content)

            return (
              <li
                key={notice.id}
                className="overflow-hidden rounded-md border transition-colors hover:bg-neutral-50"
              >
                <Link href={`/admin/youth-blog/${notice.id}`} className="block">
                  <div className="p-4 pb-3">
                    <p className="line-clamp-2 text-base font-medium">
                      {notice.title}
                    </p>
                  </div>
                  <div className="relative aspect-video bg-neutral-100">
                    {notice.thumbnailUrl && !failedImageIds.has(notice.id) ? (
                      <>
                        {!loadedImageIds.has(notice.id) ? (
                          <div className="absolute inset-0 animate-pulse bg-neutral-200" />
                        ) : null}
                        <Image
                          src={notice.thumbnailUrl}
                          alt=""
                          fill
                          priority={index < 2}
                          sizes="100vw"
                          className={
                            loadedImageIds.has(notice.id)
                              ? "object-cover opacity-100 transition-opacity duration-200"
                              : "object-cover opacity-0 transition-opacity duration-200"
                          }
                          onLoad={() => onImageLoad(notice.id)}
                          onError={() => onImageError(notice.id)}
                        />
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                        썸네일 없음
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 p-4 pt-3">
                    <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-neutral-600">
                      {preview || "본문 미리보기가 없습니다."}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {notice.isPublished ? "공개" : "비공개"} ·{" "}
                      {formatDistanceToNow(new Date(notice.createdAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      <InfiniteSentinel
        hasMore={Boolean(hasNextPage)}
        onLoadMore={onLoadMore}
        disabled={isFetchingNextPage}
      />
    </div>
  )
}
