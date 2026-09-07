import { Check, ImageOff, Loader2, Pencil, UploadCloud, X } from "lucide-react"
import Image from "next/image"
import type { DragEvent } from "react"
import type { UseFormRegisterReturn } from "react-hook-form"
import { InfiniteSentinel } from "@/components/InfiniteSentinel"
import { Badge } from "@/components/ui/badge"
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import type {
  AdminArchivePhotoDto,
  ArchivePhotoAdminFilterDto,
  ArchivePhotoStatusDto,
} from "@/features/photoArchive/isomorphic"
import { cn } from "@/lib/utils"
import { PhotoArchiveDetailFormContainer } from "../PhotoArchiveDetailForm"
import type { ArchiveUploadJob } from "./AdminPhotoArchivePageContainer"

type Props = {
  items: AdminArchivePhotoDto[]
  years: number[]
  year: number | null
  status: ArchivePhotoAdminFilterDto
  jobs: ArchiveUploadJob[]
  isUploading: boolean
  isDraggingFiles: boolean
  isBulkUpdating: boolean
  isLoading: boolean
  isError: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  selectedPhotoIds: Set<string>
  selectedPhoto: AdminArchivePhotoDto | null
  bulkStatus: ArchivePhotoStatusDto
  uploadYearRegistration: UseFormRegisterReturn<"year">
  uploadYearError?: string
  bulkYearRegistration: UseFormRegisterReturn<"year">
  bulkYearError?: string
  onYearFilterChange: (year: number | null) => void
  onStatusFilterChange: (status: ArchivePhotoAdminFilterDto) => void
  onFilesSelected: (files: File[]) => void
  onFilesDropped: (files: File[]) => void
  onDragEnter: () => void
  onDragLeave: () => void
  onUploadDialogOpenChange: (open: boolean) => void
  onUpload: () => void
  onClearJobs: () => void
  onTogglePhoto: (id: string) => void
  onToggleVisiblePhotos: (checked: boolean) => void
  onSelectPhoto: (photo: AdminArchivePhotoDto | null) => void
  onClearSelection: () => void
  onBulkStatusChange: (status: ArchivePhotoStatusDto) => void
  onBulkStatusSubmit: () => void
  onBulkYearChange: () => void
  onLoadMore: () => Promise<void>
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${bytes}B`
}

function getStatusLabel(status: ArchivePhotoStatusDto) {
  return status === "PUBLISHED" ? "공개" : "숨김"
}

function openFilePicker() {
  document.getElementById("photo-archive-files")?.click()
}

export function AdminPhotoArchivePageView(props: Props) {
  const totalBytes = props.jobs.reduce((sum, job) => sum + job.file.size, 0)
  const selectedCount = props.selectedPhotoIds.size
  const allVisibleSelected =
    props.items.length > 0 &&
    props.items.every((photo) => props.selectedPhotoIds.has(photo.id))
  const someVisibleSelected = props.items.some((photo) =>
    props.selectedPhotoIds.has(photo.id),
  )

  function preventDragDefault(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
  }

  return (
    <main className="flex flex-col gap-6">
      <Dialog onOpenChange={props.onUploadDialogOpenChange}>
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              사진 아카이브 관리
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              원본을 보존하고 연도별로 검토한 뒤 공개합니다. 새 사진은 숨김
              상태로 등록됩니다.
            </p>
          </div>
          <DialogTrigger asChild>
            <Button type="button" className="w-full sm:w-auto">
              <UploadCloud data-icon="inline-start" />
              사진 업로드
            </Button>
          </DialogTrigger>
        </header>

        <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-3xl overflow-y-auto p-0">
          <DialogHeader className="px-5 pt-5 pr-12">
            <DialogTitle>사진 업로드</DialogTitle>
            <DialogDescription>
              여러 사진을 선택하거나 끌어놓고 촬영 연도를 설정해 등록합니다.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              props.onUpload()
            }}
            className="flex flex-col gap-4 px-5 pb-5"
            noValidate
          >
            <button
              type="button"
              disabled={props.isUploading}
              aria-label="사진 파일 선택 또는 드래그앤드롭"
              onClick={props.isUploading ? undefined : openFilePicker}
              onDragEnter={(event) => {
                event.preventDefault()
                props.onDragEnter()
              }}
              onDragOver={preventDragDefault}
              onDragLeave={(event) => {
                event.preventDefault()
                props.onDragLeave()
              }}
              onDrop={(event) => {
                event.preventDefault()
                props.onFilesDropped(Array.from(event.dataTransfer.files))
              }}
              className={cn(
                "flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-muted/30 px-5 py-8 text-center outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                props.isDraggingFiles && "border-primary bg-primary/5",
                props.isUploading && "cursor-not-allowed opacity-60",
              )}
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-background shadow-sm">
                <UploadCloud className="size-6" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1">
                <p className="font-medium">
                  {props.isDraggingFiles
                    ? "여기에 사진을 놓아주세요"
                    : "사진을 끌어놓거나 클릭해서 선택하세요"}
                </p>
                <p className="text-sm text-muted-foreground">
                  JPG, PNG, TIFF, WebP · 최대 100장 · 파일당 100MB
                </p>
              </div>
            </button>
            <input
              id="photo-archive-files"
              type="file"
              accept="image/jpeg,image/png,image/tiff,image/webp"
              multiple
              className="sr-only"
              disabled={props.isUploading}
              onChange={(event) => {
                props.onFilesSelected(Array.from(event.target.files ?? []))
                event.target.value = ""
              }}
            />

            <FieldGroup className="gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <Field
                  data-invalid={Boolean(props.uploadYearError)}
                  className="sm:w-36"
                >
                  <FieldLabel htmlFor="photo-archive-upload-year">
                    촬영 연도 <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    type="number"
                    min={1800}
                    max={new Date().getFullYear()}
                    aria-invalid={Boolean(props.uploadYearError)}
                    {...props.uploadYearRegistration}
                    id="photo-archive-upload-year"
                  />
                  <FieldError>{props.uploadYearError}</FieldError>
                </Field>
                <Button
                  type="submit"
                  disabled={props.jobs.length === 0 || props.isUploading}
                >
                  {props.isUploading ? (
                    <Loader2
                      data-icon="inline-start"
                      className="animate-spin"
                    />
                  ) : (
                    <UploadCloud data-icon="inline-start" />
                  )}
                  업로드 시작
                </Button>
                {props.jobs.length > 0 && !props.isUploading ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={props.onClearJobs}
                  >
                    목록 비우기
                  </Button>
                ) : null}
              </div>
            </FieldGroup>

            {props.jobs.length > 0 ? (
              <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3">
                <p className="text-sm font-medium">
                  {props.jobs.length}장 · {formatBytes(totalBytes)}
                </p>
                <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto text-sm">
                  {props.jobs.map((job) => (
                    <li
                      key={job.id}
                      className="flex items-center gap-2 rounded-md bg-background px-3 py-2"
                    >
                      {job.status === "UPLOADING" ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : job.status === "SUCCESS" ? (
                        <Check className="size-4 text-foreground" />
                      ) : job.status === "FAILED" ? (
                        <X className="size-4 text-destructive" />
                      ) : (
                        <span className="size-4 rounded-full border" />
                      )}
                      <span className="min-w-0 flex-1 truncate">
                        {job.file.name}
                      </span>
                      <span className="max-w-48 truncate text-xs text-muted-foreground">
                        {job.message ?? formatBytes(job.file.size)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </form>
        </DialogContent>
      </Dialog>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Button
              size="sm"
              variant={props.year === null ? "default" : "outline"}
              onClick={() => props.onYearFilterChange(null)}
            >
              전체 연도
            </Button>
            {props.years.map((itemYear) => (
              <Button
                key={itemYear}
                size="sm"
                variant={props.year === itemYear ? "default" : "outline"}
                onClick={() => props.onYearFilterChange(itemYear)}
              >
                {itemYear}
              </Button>
            ))}
          </div>
          <Select
            value={props.status}
            onValueChange={(value) =>
              props.onStatusFilterChange(value as ArchivePhotoAdminFilterDto)
            }
          >
            <SelectTrigger
              className="w-full lg:w-40"
              aria-label="공개 상태 필터"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ALL">전체 상태</SelectItem>
                <SelectItem value="PUBLISHED">공개</SelectItem>
                <SelectItem value="HIDDEN">숨김</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {props.items.length > 0 ? (
          <div className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-h-9 items-center gap-3">
              <Checkbox
                id="photo-archive-select-visible"
                checked={
                  allVisibleSelected
                    ? true
                    : someVisibleSelected
                      ? "indeterminate"
                      : false
                }
                onCheckedChange={(checked) =>
                  props.onToggleVisiblePhotos(checked === true)
                }
                aria-label="현재 불러온 사진 전체 선택"
              />
              <label
                htmlFor="photo-archive-select-visible"
                className="cursor-pointer text-sm font-medium"
              >
                {selectedCount > 0
                  ? `${selectedCount}장 선택됨`
                  : "현재 사진 전체 선택"}
              </label>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start">
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  props.onBulkStatusSubmit()
                }}
              >
                <Select
                  value={props.bulkStatus}
                  onValueChange={(value) =>
                    props.onBulkStatusChange(value as ArchivePhotoStatusDto)
                  }
                  disabled={props.isBulkUpdating}
                >
                  <SelectTrigger
                    className="min-w-28 flex-1"
                    aria-label="일괄 변경 상태"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="PUBLISHED">공개</SelectItem>
                      <SelectItem value="HIDDEN">숨김</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button
                  type="submit"
                  size="sm"
                  disabled={selectedCount === 0 || props.isBulkUpdating}
                >
                  상태 변경
                </Button>
              </form>
              <form
                className="flex items-start gap-2"
                noValidate
                onSubmit={(event) => {
                  event.preventDefault()
                  props.onBulkYearChange()
                }}
              >
                <Field data-invalid={Boolean(props.bulkYearError)}>
                  <Input
                    type="number"
                    min={1800}
                    max={new Date().getFullYear()}
                    aria-label="일괄 변경 연도"
                    aria-invalid={Boolean(props.bulkYearError)}
                    className="h-8 w-24"
                    {...props.bulkYearRegistration}
                  />
                  <FieldError className="max-w-40 text-xs">
                    {props.bulkYearError}
                  </FieldError>
                </Field>
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  disabled={selectedCount === 0 || props.isBulkUpdating}
                >
                  연도 변경
                </Button>
              </form>
              {selectedCount > 0 ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={props.onClearSelection}
                  disabled={props.isBulkUpdating}
                >
                  선택 해제
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}

        {props.isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {[
              "archive-skeleton-1",
              "archive-skeleton-2",
              "archive-skeleton-3",
              "archive-skeleton-4",
              "archive-skeleton-5",
              "archive-skeleton-6",
              "archive-skeleton-7",
              "archive-skeleton-8",
            ].map((key) => (
              <Skeleton key={key} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : props.isError ? (
          <div className="rounded-xl border border-destructive/30 p-6 text-sm text-destructive">
            사진 목록을 불러오지 못했습니다.
          </div>
        ) : props.items.length === 0 ? (
          <Empty className="min-h-48 border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ImageOff />
              </EmptyMedia>
              <EmptyTitle>사진이 없습니다</EmptyTitle>
              <EmptyDescription>
                조건에 맞는 사진이 없거나 아직 등록되지 않았습니다.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {props.items.map((photo) => (
              <li
                key={photo.id}
                className={cn(
                  "group relative overflow-hidden rounded-xl border bg-muted",
                  props.selectedPhotoIds.has(photo.id) &&
                    "border-primary ring-2 ring-primary/20",
                )}
              >
                <button
                  type="button"
                  onClick={() => props.onTogglePhoto(photo.id)}
                  className="relative block aspect-square w-full cursor-pointer overflow-hidden outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50"
                  aria-pressed={props.selectedPhotoIds.has(photo.id)}
                  aria-label={`${photo.originalName} ${
                    props.selectedPhotoIds.has(photo.id) ? "선택 해제" : "선택"
                  }`}
                >
                  <Image
                    src={photo.displayUrl}
                    alt={photo.altText || `${photo.year}년 기록 사진`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform group-hover:scale-[1.02] motion-reduce:transition-none"
                  />
                </button>
                <div className="flex flex-col gap-2 bg-background p-2">
                  <span className="truncate text-xs">{photo.originalName}</span>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 gap-1">
                      <Badge variant="outline">
                        {getStatusLabel(photo.status)}
                      </Badge>
                      <Badge variant="secondary">{photo.year}</Badge>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 shrink-0 px-2 text-xs"
                      onClick={() => props.onSelectPhoto(photo)}
                      aria-label={`${photo.originalName} 정보 수정`}
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      수정
                    </Button>
                  </div>
                </div>
                <label
                  htmlFor={`photo-archive-select-${photo.id}`}
                  className="absolute right-2 top-2 inline-flex size-11 cursor-pointer items-center justify-center rounded-lg bg-background/25 shadow-sm transition-colors hover:bg-background/45"
                >
                  <Checkbox
                    id={`photo-archive-select-${photo.id}`}
                    checked={props.selectedPhotoIds.has(photo.id)}
                    onCheckedChange={() => props.onTogglePhoto(photo.id)}
                    aria-label={`${photo.originalName} 선택`}
                  />
                </label>
              </li>
            ))}
          </ul>
        )}

        <InfiniteSentinel
          hasMore={props.hasNextPage}
          onLoadMore={props.onLoadMore}
          disabled={props.isFetchingNextPage}
        />
      </section>

      <Dialog
        open={props.selectedPhoto !== null}
        onOpenChange={(open) => {
          if (!open) props.onSelectPhoto(null)
        }}
      >
        {props.selectedPhoto ? (
          <DialogContent className="max-h-[calc(100vh-2rem)] max-w-4xl overflow-y-auto p-0">
            <DialogHeader className="px-5 pt-5 pr-12">
              <DialogTitle>사진 정보 수정</DialogTitle>
              <DialogDescription className="truncate">
                {props.selectedPhoto.originalName}
              </DialogDescription>
            </DialogHeader>
            <PhotoArchiveDetailFormContainer
              key={props.selectedPhoto.id}
              photo={props.selectedPhoto}
              onUpdated={props.onSelectPhoto}
              onClose={() => props.onSelectPhoto(null)}
            />
          </DialogContent>
        ) : null}
      </Dialog>
    </main>
  )
}
