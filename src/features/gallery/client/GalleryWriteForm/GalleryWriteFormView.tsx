"use client"

import { useForm } from "react-hook-form"
import { ContentEditor } from "@/components/ContentEditor"
import { ImageCropUploadField } from "@/components/ImageCropUploadField"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

type GalleryWriteFormValues = {
  title: string
  content: string
  isPublished: boolean
  thumbnailUrl: string
}

type GalleryWriteFormViewProps = {
  onSubmitAction: (values: GalleryWriteFormValues) => Promise<void>
  onUploadImageAction: (file: File) => Promise<string>
  onUploadThumbnailAction: (file: File, previousUrl?: string) => Promise<string>
  onRemoveThumbnailAction?: (currentUrl: string) => Promise<void>
  isLoading: boolean
  message: string | null
  isError: boolean
  initialTitle?: string
  initialContent?: string
  initialIsPublished?: boolean
  currentThumbnailUrl?: string
  submitLabel?: string
  requireThumbnail?: boolean
}

export function GalleryWriteFormView({
  onSubmitAction,
  onUploadImageAction,
  onUploadThumbnailAction,
  onRemoveThumbnailAction,
  isLoading,
  message,
  isError,
  initialTitle = "",
  initialContent = "",
  initialIsPublished = true,
  currentThumbnailUrl,
  submitLabel = "저장",
  requireThumbnail = true,
}: GalleryWriteFormViewProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GalleryWriteFormValues>({
    defaultValues: {
      title: initialTitle,
      content: initialContent,
      isPublished: initialIsPublished,
      thumbnailUrl: currentThumbnailUrl ?? "",
    },
    mode: "onSubmit",
  })

  const content = watch("content")
  const thumbnailUrl = watch("thumbnailUrl")

  return (
    <form onSubmit={handleSubmit(onSubmitAction)} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="title" className="text-sm">
          제목 <span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          {...register("title", {
            validate: (v) => v.trim().length > 0 || "제목은 필수 입력입니다.",
          })}
          className={errors.title ? "border-red-500 ring-1 ring-red-500" : ""}
        />
      </div>

      <div className="space-y-1">
        <ImageCropUploadField
          label={`썸네일 이미지${requireThumbnail ? " *" : ""}`}
          value={thumbnailUrl || undefined}
          onUploadAction={onUploadThumbnailAction}
          onRemoveImageAction={onRemoveThumbnailAction}
          onChangeAction={(nextUrl) =>
            setValue("thumbnailUrl", nextUrl, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          cropAspectRatio={4 / 3}
          outputWidth={1600}
          outputHeight={1200}
          previewClassName="h-36 w-48 rounded-md border object-cover"
          allowRemove={requireThumbnail}
          disabled={isLoading}
        />
        <input
          type="hidden"
          {...register("thumbnailUrl", {
            validate: (value) =>
              !requireThumbnail ||
              value.trim().length > 0 ||
              "썸네일은 필수 입력입니다.",
          })}
          value={thumbnailUrl}
        />
        <p className="text-xs text-neutral-500">
          썸네일은 랜드스케이프 비율(4:3)로 크롭 후 업로드됩니다.
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor="content" className="text-sm">
          내용 <span className="text-red-500">*</span>
        </label>
        <ContentEditor
          initialValue={initialContent}
          onUploadImageAction={onUploadImageAction}
          onChangeAction={(markdown) =>
            setValue("content", markdown, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          hasError={Boolean(errors.content)}
        />
        <input
          id="content"
          type="hidden"
          {...register("content", {
            validate: (v) => v.trim().length > 0 || "내용은 필수 입력입니다.",
          })}
          value={content}
        />
      </div>

      <label htmlFor="is-published" className="flex items-center gap-2 text-sm">
        <Checkbox
          id="is-published"
          checked={Boolean(watch("isPublished"))}
          onCheckedChange={(checked: boolean | "indeterminate") =>
            setValue("isPublished", Boolean(checked), { shouldDirty: true })
          }
        />
        작성 후 바로 공개
      </label>

      {message ? (
        <p
          className={
            isError ? "text-sm text-red-600" : "text-sm text-emerald-600"
          }
        >
          {message}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-60 sm:w-auto"
      >
        {isLoading ? "저장 중..." : submitLabel}
      </Button>
    </form>
  )
}
