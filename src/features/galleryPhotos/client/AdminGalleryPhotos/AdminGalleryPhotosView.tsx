import { Loader2, UploadCloud } from "lucide-react"
import Image from "next/image"
import type { FieldErrors, UseFormRegister } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type {
  AdminGalleryPhotoDto,
  GalleryUploadItemDto,
} from "@/features/galleryPhotos/isomorphic"
import type { GalleryUploadJob } from "./AdminGalleryPhotosContainer"

type EditValues = {
  caption: string
  altText: string
  status: "PUBLISHED" | "HIDDEN"
}
type Props = {
  postId: string
  items: AdminGalleryPhotoDto[]
  totalCount: number
  jobs: GalleryUploadJob[]
  serverJobs: GalleryUploadItemDto[]
  status: string
  onStatusChange: (value: string) => void
  bulkStatus: "PUBLISHED" | "HIDDEN"
  onBulkStatusChange: (value: "PUBLISHED" | "HIDDEN") => void
  onBulkSubmit: () => void
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onToggleVisible: () => void
  selectedPhoto: AdminGalleryPhotoDto | null
  onSelectPhoto: (photo: AdminGalleryPhotoDto | null) => void
  editRegistration: UseFormRegister<EditValues>
  editErrors: FieldErrors<EditValues>
  editStatus: "PUBLISHED" | "HIDDEN"
  onEditStatusChange: (value: "PUBLISHED" | "HIDDEN") => void
  onSavePhoto: () => void
  onDeletePhoto: () => void
  isUploading: boolean
  isMutating: boolean
  isRetrying: boolean
  onFilesSelected: (files: File[]) => void
  onUpload: () => void
  onClearJobs: () => void
  onRetryJob: (id: string) => void
  isLoading: boolean
  isError: boolean
  onRetryList: () => void
  hasMore: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
}

const statusLabels: Record<GalleryUploadItemDto["status"], string> = {
  WAITING: "전송 대기",
  UPLOADING: "원본 전송 중",
  QUEUED: "변환 대기",
  PROCESSING: "사진 처리 중",
  COMPLETED: "등록 완료",
  FAILED: "실패",
  CANCELLED: "취소됨",
}

export function AdminGalleryPhotosView(props: Props) {
  const inputId = `gallery-photo-files-${props.postId}`
  const pending = props.serverJobs.filter((item) =>
    ["QUEUED", "PROCESSING", "FAILED", "UPLOADING", "WAITING"].includes(
      item.status,
    ),
  )
  return (
    <section
      className="space-y-5 rounded-xl border bg-background p-4 md:p-6"
      aria-label="행사 사진 관리"
    >
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-xl font-semibold">
            행사 사진{" "}
            <span className="text-sm font-normal text-muted-foreground">
              {props.totalCount}장
            </span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            이 행사에 소속된 사진을 관리합니다. 새 사진은 숨김 상태로
            등록됩니다.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button">
              <UploadCloud className="size-4" /> 사진 업로드
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>행사 사진 업로드</DialogTitle>
              <DialogDescription>
                여러 사진을 선택하거나 끌어놓아 등록하세요.
              </DialogDescription>
            </DialogHeader>
            <button
              type="button"
              disabled={props.isUploading}
              onClick={() => document.getElementById(inputId)?.click()}
              onDragOver={(event) => {
                event.preventDefault()
                event.dataTransfer.dropEffect = "copy"
              }}
              onDrop={(event) => {
                event.preventDefault()
                props.onFilesSelected(Array.from(event.dataTransfer.files))
              }}
              className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-muted/30 p-6 text-center hover:bg-muted/60 disabled:opacity-50"
            >
              <UploadCloud className="size-8" />
              <span className="font-medium">
                사진을 끌어놓거나 클릭해서 선택하세요
              </span>
              <span className="text-xs text-muted-foreground">
                JPG, PNG, TIFF, WebP · 한 번에 100장 · 파일당 100MB · 전체 2GB
              </span>
            </button>
            <input
              id={inputId}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/tiff,image/webp"
              className="sr-only"
              disabled={props.isUploading}
              onChange={(event) => {
                props.onFilesSelected(Array.from(event.target.files ?? []))
                event.target.value = ""
              }}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                onClick={props.onUpload}
                disabled={
                  props.isUploading ||
                  !props.jobs.some((job) =>
                    ["WAITING", "FAILED"].includes(job.status),
                  )
                }
              >
                {props.isUploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}{" "}
                업로드 시작 / 실패 재시도
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={props.onClearJobs}
                disabled={props.isUploading}
              >
                목록 비우기
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {props.jobs.length}장 선택 ·{" "}
              {Math.round(
                props.jobs.reduce((sum, job) => sum + job.file.size, 0) /
                  1024 /
                  1024,
              )}
              MB · 행사 전체 사진 장수에는 제한이 없습니다.
            </p>
            <ul
              className="max-h-60 space-y-2 overflow-y-auto"
              aria-live="polite"
            >
              {props.jobs.map((job) => (
                <li
                  key={job.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm"
                >
                  <span className="min-w-0 flex-1 truncate">
                    {job.file.name}
                  </span>
                  <span
                    className={
                      job.status === "FAILED"
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }
                  >
                    {statusLabels[job.status]}
                  </span>
                  {job.message ? (
                    <p className="w-full text-xs text-destructive">
                      {job.message}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </DialogContent>
        </Dialog>
      </header>

      {pending.length ? (
        <details className="rounded-lg border p-3">
          <summary className="cursor-pointer text-sm">
            최근 업로드 작업 · 대기/실패 {pending.length}장
          </summary>
          <ul className="mt-3 max-h-60 space-y-2 overflow-y-auto">
            {pending.map((job) => (
              <li
                key={job.id}
                className="flex flex-wrap items-center gap-2 text-sm"
              >
                <span className="min-w-0 flex-1 truncate">
                  {job.originalName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {statusLabels[job.status]}
                </span>
                {job.status === "FAILED" && !job.needsFile ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={props.isRetrying}
                    onClick={() => props.onRetryJob(job.id)}
                  >
                    재시도
                  </Button>
                ) : null}
                {job.error ? (
                  <p className="w-full text-xs text-destructive">{job.error}</p>
                ) : null}
                {job.status === "WAITING" ? (
                  <p className="w-full text-xs text-muted-foreground">
                    전송이 끝나지 않았습니다. 업로드 창에서 파일을 다시 선택해
                    주세요.
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Select value={props.status} onValueChange={props.onStatusChange}>
          <SelectTrigger className="w-32" aria-label="행사 사진 공개 상태 필터">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체 상태</SelectItem>
            <SelectItem value="PUBLISHED">공개</SelectItem>
            <SelectItem value="HIDDEN">숨김</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          onClick={props.onToggleVisible}
          disabled={!props.items.length}
        >
          현재 사진 전체 선택 / 해제
        </Button>
        <span className="text-sm">{props.selectedIds.size}장 선택</span>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            props.onBulkSubmit()
          }}
        >
          <Select
            value={props.bulkStatus}
            onValueChange={(value) =>
              props.onBulkStatusChange(value as "PUBLISHED" | "HIDDEN")
            }
          >
            <SelectTrigger className="w-24" aria-label="사진 일괄 공개 상태">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLISHED">공개</SelectItem>
              <SelectItem value="HIDDEN">숨김</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="submit"
            disabled={!props.selectedIds.size || props.isMutating}
          >
            상태 변경
          </Button>
        </form>
      </div>

      {props.isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          사진을 불러오는 중입니다.
        </p>
      ) : props.isError ? (
        <div role="alert" className="py-8 text-center">
          <p className="text-sm text-destructive">
            사진 목록을 불러오지 못했습니다.
          </p>
          <Button type="button" variant="outline" onClick={props.onRetryList}>
            다시 시도
          </Button>
        </div>
      ) : !props.items.length ? (
        <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          등록된 사진이 없거나 선택한 상태의 사진이 없습니다.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {props.items.map((photo) => (
            <li
              key={photo.id}
              className={`overflow-hidden rounded-lg border ${props.selectedIds.has(photo.id) ? "ring-2 ring-primary" : ""}`}
            >
              <button
                type="button"
                className="relative block aspect-[4/3] w-full"
                onClick={() => props.onSelectPhoto(photo)}
                aria-label={`${photo.originalName} 정보 수정`}
              >
                <Image
                  src={photo.thumbnailUrl}
                  alt={photo.altText}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </button>
              <div className="space-y-2 p-3">
                <p className="truncate text-xs">{photo.originalName}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {photo.status === "PUBLISHED" ? "공개" : "숨김"}
                  </span>
                  <Checkbox
                    checked={props.selectedIds.has(photo.id)}
                    onCheckedChange={() => props.onToggle(photo.id)}
                    aria-label={`${photo.originalName} 선택`}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {props.hasMore ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={props.isLoadingMore}
          onClick={props.onLoadMore}
        >
          {props.isLoadingMore ? "불러오는 중…" : "사진 더 보기"}
        </Button>
      ) : null}

      <Dialog
        open={Boolean(props.selectedPhoto)}
        onOpenChange={(open) => {
          if (!open) props.onSelectPhoto(null)
        }}
      >
        {props.selectedPhoto ? (
          <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>사진 정보 수정</DialogTitle>
              <DialogDescription>
                {props.selectedPhoto.originalName}
              </DialogDescription>
            </DialogHeader>
            <div className="relative h-56">
              <Image
                src={props.selectedPhoto.displayUrl}
                alt={props.selectedPhoto.altText}
                fill
                sizes="640px"
                className="object-contain"
              />
            </div>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault()
                props.onSavePhoto()
              }}
            >
              <div className="space-y-2">
                <label htmlFor="gallery-photo-caption" className="text-sm">
                  사진 설명
                </label>
                <Textarea
                  id="gallery-photo-caption"
                  {...props.editRegistration("caption", {
                    maxLength: {
                      value: 2000,
                      message: "설명은 2000자 이하여야 합니다.",
                    },
                  })}
                  aria-invalid={Boolean(props.editErrors.caption)}
                  className={
                    props.editErrors.caption ? "border-destructive" : ""
                  }
                />
                {props.editErrors.caption ? (
                  <p className="text-xs text-destructive">
                    {props.editErrors.caption.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <label htmlFor="gallery-photo-alt" className="text-sm">
                  대체 텍스트
                </label>
                <Input
                  id="gallery-photo-alt"
                  {...props.editRegistration("altText", {
                    maxLength: {
                      value: 300,
                      message: "대체 텍스트는 300자 이하여야 합니다.",
                    },
                  })}
                  aria-invalid={Boolean(props.editErrors.altText)}
                  className={
                    props.editErrors.altText ? "border-destructive" : ""
                  }
                />
                {props.editErrors.altText ? (
                  <p className="text-xs text-destructive">
                    {props.editErrors.altText.message}
                  </p>
                ) : null}
              </div>
              <Select
                value={props.editStatus}
                onValueChange={(value) =>
                  props.onEditStatusChange(value as "PUBLISHED" | "HIDDEN")
                }
              >
                <SelectTrigger aria-label="사진 공개 상태">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLISHED">공개</SelectItem>
                  <SelectItem value="HIDDEN">숨김</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-between gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  disabled={props.isMutating}
                  onClick={props.onDeletePhoto}
                >
                  사진 삭제
                </Button>
                <Button type="submit" disabled={props.isMutating}>
                  저장
                </Button>
              </div>
            </form>
          </DialogContent>
        ) : null}
      </Dialog>
    </section>
  )
}
