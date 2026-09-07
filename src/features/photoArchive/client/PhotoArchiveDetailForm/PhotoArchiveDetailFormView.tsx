import { Loader2 } from "lucide-react"
import Image from "next/image"
import type { FieldErrors, UseFormRegister } from "react-hook-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
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
import { Textarea } from "@/components/ui/textarea"
import type {
  AdminArchivePhotoDto,
  ArchivePhotoStatusDto,
} from "@/features/photoArchive/isomorphic"

type Values = {
  year: number
  caption: string
  altText: string
  status: ArchivePhotoStatusDto
}

export function PhotoArchiveDetailFormView({
  photo,
  registration,
  errors,
  isPending,
  status,
  onStatusChange,
  onSubmit,
  onClose,
}: {
  photo: AdminArchivePhotoDto
  registration: UseFormRegister<Values>
  errors: FieldErrors<Values>
  isPending: boolean
  status: ArchivePhotoStatusDto
  onStatusChange: (status: ArchivePhotoStatusDto) => void
  onSubmit: () => void
  onClose: () => void
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
      className="grid min-w-0 gap-5 px-5 pb-5 md:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]"
      noValidate
    >
      <div className="flex min-w-0 flex-col gap-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
          <Image
            src={photo.displayUrl}
            alt={photo.altText || `${photo.year}년 기록 사진`}
            fill
            sizes="(max-width: 768px) calc(100vw - 3rem), 480px"
            className="object-contain"
          />
        </div>
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{photo.originalName}</p>
            <p className="text-xs text-muted-foreground">
              원본 {(photo.originalSizeBytes / 1024 / 1024).toFixed(1)}MB ·
              표시본 {photo.width}×{photo.height}px
            </p>
          </div>
          <Badge variant="outline">
            {status === "PUBLISHED" ? "공개" : "숨김"}
          </Badge>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        <FieldGroup className="gap-5">
          <Field data-invalid={Boolean(errors.year)}>
            <FieldLabel htmlFor="photo-archive-detail-year">
              촬영 연도 <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              type="number"
              min={1800}
              max={new Date().getFullYear()}
              aria-invalid={Boolean(errors.year)}
              {...registration("year", {
                valueAsNumber: true,
                required: "연도를 입력해 주세요.",
              })}
              id="photo-archive-detail-year"
            />
            <FieldError errors={[errors.year]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="photo-archive-detail-status">
              공개 상태
            </FieldLabel>
            <Select
              value={status}
              onValueChange={(value) =>
                onStatusChange(value as ArchivePhotoStatusDto)
              }
              disabled={isPending}
            >
              <SelectTrigger id="photo-archive-detail-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="PUBLISHED">공개</SelectItem>
                  <SelectItem value="HIDDEN">숨김</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldDescription>
              공개 상태의 사진만 일반 사진 아카이브에 표시됩니다.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="photo-archive-detail-caption">
              설명 <span className="text-muted-foreground">(선택)</span>
            </FieldLabel>
            <Textarea
              rows={4}
              maxLength={2000}
              {...registration("caption")}
              id="photo-archive-detail-caption"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="photo-archive-detail-alt-text">
              대체 텍스트 <span className="text-muted-foreground">(선택)</span>
            </FieldLabel>
            <Input
              maxLength={300}
              {...registration("altText")}
              id="photo-archive-detail-alt-text"
            />
            <FieldDescription>
              화면을 보지 못하는 사용자에게 사진 내용을 설명합니다.
            </FieldDescription>
          </Field>
        </FieldGroup>

        <DialogFooter className="mt-auto flex-col-reverse sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            취소
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : null}
            변경사항 저장
          </Button>
        </DialogFooter>
      </div>
    </form>
  )
}
