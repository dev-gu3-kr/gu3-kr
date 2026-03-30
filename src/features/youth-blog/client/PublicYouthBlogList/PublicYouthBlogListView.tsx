import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { AppLink as Link } from "@/components/AppLink"
import { InfiniteSentinel } from "@/components/InfiniteSentinel"
import type { YouthBlogListItemDto } from "@/features/youth-blog/isomorphic"
import { cn } from "@/lib/utils"

type PublicYouthBlogListViewProps = {
  items: YouthBlogListItemDto[]
  isLoading?: boolean
  isError?: boolean
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => Promise<void>
}

function buildDetailHref(id: string) {
  return `/youth/blog/${id}`
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

export function PublicYouthBlogListView({
  items,
  isLoading = false,
  isError = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
}: PublicYouthBlogListViewProps) {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-5 md:px-8 md:py-14">
      <h2 className="text-[30px] font-semibold tracking-[-0.02em] text-[#252629]">
        청소년 블로그
      </h2>

      {isLoading && items.length === 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {["public-yb-sk-1", "public-yb-sk-2", "public-yb-sk-3"].map(
            (key, index) => (
              <article
                key={key}
                className={cn(
                  "animate-pulse overflow-hidden rounded-md border border-[#e5e7eb] bg-white",
                  index === 0 && "md:col-span-2 lg:col-span-1",
                )}
              >
                <div className="aspect-video bg-[#f3f4f6]" />
                <div className="space-y-3 p-4">
                  <div className="h-6 w-3/5 rounded bg-[#eceff3]" />
                  <div className="h-4 w-full rounded bg-[#eceff3]" />
                  <div className="h-4 w-5/6 rounded bg-[#eceff3]" />
                  <div className="h-3 w-24 rounded bg-[#eceff3]" />
                </div>
              </article>
            ),
          )}
        </div>
      ) : null}

      {isError && items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[#ececec] py-16 text-center text-sm text-[#777]">
          청소년 블로그 목록을 불러오지 못했습니다.
        </div>
      ) : null}

      {!isLoading && !isError && items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[#ececec] py-16 text-center text-sm text-[#777]">
          등록된 청소년 블로그가 없습니다.
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {items.map((item, index) => {
            const preview = getContentPreview(item.content)

            return (
              <Link
                key={item.id}
                href={buildDetailHref(item.id)}
                className={cn(
                  "block",
                  index === 0 && "md:col-span-2 lg:col-span-1",
                )}
              >
                <article className="overflow-hidden rounded-md border border-[#e5e7eb] bg-white transition-colors hover:bg-neutral-50">
                  <div className="relative aspect-video bg-[#f3f4f6]">
                    {item.thumbnailUrl ? (
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.title}
                        fill
                        sizes={
                          index === 0
                            ? "(min-width: 1024px) 50vw, (min-width: 768px) 100vw, 100vw"
                            : "(min-width: 768px) 50vw, 100vw"
                        }
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                        썸네일 없음
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 p-4">
                    <p className="line-clamp-2 text-base font-medium text-[#252629]">
                      {item.title}
                    </p>
                    <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[#5f6672]">
                      {preview || "본문 미리보기가 없습니다."}
                    </p>
                    <p className="text-xs text-[#7f8590]">
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </p>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>
      ) : null}

      <div className="mt-10 space-y-6 md:mt-8">
        {items.length > 0 ? (
          <div className="space-y-3">
            {isError ? (
              <p className="text-sm text-[#b42318]">
                추가 목록을 불러오지 못했습니다. 다시 시도해 주세요.
              </p>
            ) : null}

            {isFetchingNextPage ? (
              <p className="inline-flex items-center gap-2 text-sm text-[#7f8590]">
                <Loader2 className="h-4 w-4 animate-spin" />더 불러오는 중
              </p>
            ) : null}

            <InfiniteSentinel
              hasMore={hasNextPage}
              disabled={isFetchingNextPage}
              onLoadMore={onLoadMore ?? (async () => {})}
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}
