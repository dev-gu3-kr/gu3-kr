import { ChevronLeft, ChevronRight, Images, Loader2 } from "lucide-react"
import Image from "next/image"
import { InfiniteSentinel } from "@/components/InfiniteSentinel"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import type { PublicArchivePhotoDto } from "@/features/photoArchive/isomorphic"

type Props = {
  items: PublicArchivePhotoDto[]
  years: number[]
  year: number | null
  selectedPhoto: PublicArchivePhotoDto | null
  selectedIndex: number
  isLoading: boolean
  isError: boolean
  isFetching: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  onYearChange: (year: number | null) => void
  onSelectPhoto: (photoId: string) => void
  onCloseViewer: () => void
  onPrevious: () => void
  onNext: () => void
  onLoadMore: () => Promise<void>
}

export function PublicPhotoArchivePageView(props: Props) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-5 md:px-8 md:py-14">
      <header className="mb-8 flex flex-col gap-3 border-b border-neutral-200 pb-7 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-neutral-900 md:text-4xl">
            사진 아카이브
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 md:text-base">
            본당의 다양한 순간을 연도별로 살펴보세요. 사진을 선택하면 큰
            화면으로 이어서 볼 수 있습니다.
          </p>
        </div>
        {props.isFetching ? (
          <p className="inline-flex items-center gap-2 text-sm text-neutral-500">
            <Loader2 className="size-4 animate-spin" /> 불러오는 중
          </p>
        ) : null}
      </header>

      <nav
        aria-label="연도별 사진 필터"
        className="mb-6 flex gap-2 overflow-x-auto pb-2"
      >
        <Button
          type="button"
          variant={props.year === null ? "default" : "outline"}
          className="shrink-0"
          onClick={() => props.onYearChange(null)}
        >
          전체
        </Button>
        {props.years.map((itemYear) => (
          <Button
            key={itemYear}
            type="button"
            variant={props.year === itemYear ? "default" : "outline"}
            className="shrink-0"
            onClick={() => props.onYearChange(itemYear)}
          >
            {itemYear}년
          </Button>
        ))}
      </nav>

      {props.isLoading ? (
        <div className="columns-2 gap-2 md:columns-3 lg:columns-4 xl:columns-5">
          {["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"].map(
            (key, index) => (
              <div
                key={key}
                className={`mb-2 animate-pulse break-inside-avoid rounded-lg bg-neutral-200 ${index % 3 === 0 ? "aspect-[3/4]" : "aspect-[4/3]"}`}
              />
            ),
          )}
        </div>
      ) : props.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-12 text-center text-sm text-red-700">
          사진 아카이브를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </div>
      ) : props.items.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 text-neutral-500">
          <Images className="mb-3 size-9" />
          <p className="text-sm">공개된 사진이 아직 없습니다.</p>
        </div>
      ) : (
        <ul className="columns-2 gap-2 md:columns-3 lg:columns-4 xl:columns-5">
          {props.items.map((photo, index) => (
            <li
              key={photo.id}
              className="mb-2 break-inside-avoid overflow-hidden rounded-lg bg-neutral-100"
            >
              <button
                type="button"
                className="group relative block w-full overflow-hidden text-left outline-none focus-visible:ring-4 focus-visible:ring-[#a0242b]/35"
                onClick={() => props.onSelectPhoto(photo.id)}
              >
                <Image
                  src={photo.displayUrl}
                  alt={photo.altText}
                  width={photo.width}
                  height={photo.height}
                  priority={index < 6}
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="h-auto w-full transition duration-300 group-hover:scale-[1.025] group-hover:brightness-90"
                />
                <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-8 text-xs font-medium text-white transition-transform group-hover:translate-y-0 group-focus-visible:translate-y-0">
                  {photo.year}년
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <InfiniteSentinel
        hasMore={props.hasNextPage}
        disabled={props.isFetchingNextPage}
        onLoadMore={props.onLoadMore}
        className="mt-6"
      />

      <Dialog
        open={Boolean(props.selectedPhoto)}
        onOpenChange={(open) => {
          if (!open) props.onCloseViewer()
        }}
      >
        {props.selectedPhoto ? (
          <DialogContent className="flex h-[min(82dvh,800px)] w-[calc(100vw-2rem)] max-w-none flex-col overflow-hidden rounded-xl bg-neutral-950 p-0 text-white md:w-[min(88vw,1200px)]">
            <DialogTitle className="sr-only">
              {props.selectedPhoto.year}년 사진
            </DialogTitle>
            <DialogDescription className="sr-only">
              좌우 화살표 키 또는 화면의 이전, 다음 버튼으로 사진을 이동할 수
              있습니다.
            </DialogDescription>
            <div className="relative min-h-0 flex-1">
              <Image
                src={props.selectedPhoto.displayUrl}
                alt={props.selectedPhoto.altText}
                fill
                priority
                sizes="100vw"
                className="object-contain p-3 md:p-8"
              />
              <button
                type="button"
                aria-label="이전 사진"
                disabled={props.selectedIndex <= 0}
                onClick={props.onPrevious}
                className="absolute left-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/75 disabled:invisible md:left-5 md:size-12"
              >
                <ChevronLeft className="size-7" />
              </button>
              <button
                type="button"
                aria-label="다음 사진"
                disabled={
                  props.selectedIndex < 0 ||
                  props.selectedIndex >= props.items.length - 1
                }
                onClick={props.onNext}
                className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/75 disabled:invisible md:right-5 md:size-12"
              >
                <ChevronRight className="size-7" />
              </button>
            </div>
            <footer className="border-t border-white/10 bg-black/40 px-5 py-4 pr-12 md:px-8">
              <p className="text-sm font-semibold">
                {props.selectedPhoto.year}년
              </p>
              {props.selectedPhoto.caption ? (
                <p className="mt-1 max-w-3xl text-sm leading-6 text-white/70">
                  {props.selectedPhoto.caption}
                </p>
              ) : null}
            </footer>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  )
}
