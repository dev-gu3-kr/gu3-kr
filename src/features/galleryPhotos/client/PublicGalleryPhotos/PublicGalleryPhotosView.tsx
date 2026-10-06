import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import type {
  GalleryPhotoDetailDto,
  GalleryPhotoDto,
} from "@/features/galleryPhotos/isomorphic"

type Props = {
  items: GalleryPhotoDto[]
  totalCount: number
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  hasMore: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
  isViewerOpen: boolean
  detail: GalleryPhotoDetailDto | null
  isViewerLoading: boolean
  isViewerError: boolean
  onSelectPhoto: (id: string) => void
  onClose: () => void
  onRetryDetail: () => void
}

export function PublicGalleryPhotosView(props: Props) {
  // 기존 게시글에 행사 사진이 없으면 빈 앨범 영역을 표시하지 않는다.
  if (
    !props.isLoading &&
    !props.isError &&
    !props.totalCount &&
    !props.isViewerOpen
  )
    return null
  return (
    <section
      className="my-8 border-b border-neutral-200 pb-8"
      aria-label="행사 사진 모아보기"
    >
      <header className="mb-5 flex items-baseline gap-3">
        <h3 className="text-xl font-semibold">행사 사진</h3>
        <span className="text-sm text-neutral-500">
          총 {props.totalCount}장
        </span>
      </header>
      {props.isLoading ? (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {["a", "b", "c", "d"].map((key) => (
            <div
              key={key}
              className="aspect-[4/3] animate-pulse rounded-lg bg-neutral-100"
            />
          ))}
        </div>
      ) : props.isError ? (
        <div role="alert" className="py-8 text-center">
          <p className="mb-3 text-sm text-neutral-600">
            행사 사진을 불러오지 못했습니다.
          </p>
          <Button type="button" variant="outline" onClick={props.onRetry}>
            다시 시도
          </Button>
        </div>
      ) : (
        <ul className="columns-2 gap-2 md:columns-3 lg:columns-4">
          {props.items.map((photo) => (
            <li
              key={photo.id}
              className="mb-2 break-inside-avoid overflow-hidden rounded-lg bg-neutral-100"
            >
              <button
                type="button"
                onClick={() => props.onSelectPhoto(photo.id)}
                aria-label={`${photo.altText} 크게 보기`}
                className="block w-full overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Image
                  src={photo.thumbnailUrl}
                  alt={photo.altText}
                  width={photo.width}
                  height={photo.height}
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="h-auto w-full transition hover:brightness-90 motion-reduce:transition-none"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
      {props.hasMore ? (
        <Button
          type="button"
          variant="outline"
          className="mt-5 w-full"
          disabled={props.isLoadingMore}
          onClick={props.onLoadMore}
        >
          {props.isLoadingMore ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}{" "}
          사진 더 보기
        </Button>
      ) : null}
      <Dialog
        open={props.isViewerOpen}
        onOpenChange={(open) => {
          if (!open) props.onClose()
        }}
      >
        <DialogContent className="flex h-[85dvh] w-[calc(100vw-1rem)] max-w-none flex-col overflow-hidden bg-neutral-950 p-0 text-white sm:max-w-[min(1200px,95vw)]">
          <DialogTitle className="sr-only">행사 사진 크게 보기</DialogTitle>
          <DialogDescription className="sr-only">
            이전·다음 버튼이나 좌우 화살표 키로 행사 사진을 이어서 볼 수
            있습니다.
          </DialogDescription>
          <div className="relative min-h-0 flex-1">
            {props.isViewerLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2
                  aria-label="사진을 불러오는 중"
                  className="size-8 animate-spin"
                />
              </div>
            ) : props.isViewerError ? (
              <div
                role="alert"
                className="flex h-full flex-col items-center justify-center gap-3 px-5 text-center"
              >
                <p>사진을 찾을 수 없거나 공개되지 않았습니다.</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={props.onRetryDetail}
                >
                  다시 시도
                </Button>
              </div>
            ) : props.detail ? (
              <Image
                src={props.detail.item.displayUrl}
                alt={props.detail.item.altText}
                fill
                priority
                sizes="95vw"
                className="object-contain p-3 md:p-8"
              />
            ) : null}
            <button
              type="button"
              aria-label="이전 사진"
              disabled={!props.detail?.previousId || props.isViewerLoading}
              onClick={() => {
                if (props.detail?.previousId)
                  props.onSelectPhoto(props.detail.previousId)
              }}
              className="absolute left-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 disabled:invisible md:left-5"
            >
              <ChevronLeft className="size-7" />
            </button>
            <button
              type="button"
              aria-label="다음 사진"
              disabled={!props.detail?.nextId || props.isViewerLoading}
              onClick={() => {
                if (props.detail?.nextId)
                  props.onSelectPhoto(props.detail.nextId)
              }}
              className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 disabled:invisible md:right-5"
            >
              <ChevronRight className="size-7" />
            </button>
          </div>
          {props.detail ? (
            <footer className="border-t border-white/10 px-5 py-4">
              <p className="text-sm font-medium">
                {props.detail.position} / {props.detail.totalCount}
              </p>
              {props.detail.item.caption ? (
                <p className="mt-2 text-sm leading-6 text-white/70">
                  {props.detail.item.caption}
                </p>
              ) : null}
            </footer>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  )
}
