// 청소년 블로그 작성/수정 폼 UI: RHF, 썸네일 업로드, Toast UI 에디터를 연결한다.
"use client"

import { useForm } from "react-hook-form"
import { ContentEditor } from "@/components/ContentEditor"
import { ImageCropUploadField } from "@/components/ImageCropUploadField"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import type { CreateYouthBlogInputDto } from "@/features/youth-blog/isomorphic"

type YouthBlogWriteFormViewProps = {
  onSubmitAction: (values: CreateYouthBlogInputDto) => void
  isLoading: boolean
  message: string | null
  isError: boolean
  initialTitle?: string
  currentThumbnailUrl?: string
  initialContent?: string
  initialIsPublished?: boolean
  submitLabel?: string
  onUploadImageAction: (file: File) => Promise<string>
  onUploadThumbnailAction: (file: File, previousUrl?: string) => Promise<string>
}

// 청소년 블로그 폼 렌더러: RHF 상태와 썸네일/에디터 상태를 동기화한다.
export function YouthBlogWriteFormView({
  onSubmitAction,
  isLoading,
  message,
  isError,
  initialTitle,
  currentThumbnailUrl,
  initialContent,
  initialIsPublished,
  submitLabel = "청소년 블로그 저장",
  onUploadImageAction,
  onUploadThumbnailAction,
}: YouthBlogWriteFormViewProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateYouthBlogInputDto>({
    defaultValues: {
      title: initialTitle ?? "",
      thumbnailUrl: currentThumbnailUrl ?? "",
      content: initialContent ?? "",
      isPublished: initialIsPublished ?? false,
    },
    mode: "onSubmit",
  })

  const content = watch("content")
  const thumbnailUrl = watch("thumbnailUrl")

  return (
    <form onSubmit={handleSubmit(onSubmitAction)} className="min-w-0 space-y-4">
      <div className="space-y-1">
        <label htmlFor="title" className="text-sm">
          제목 <span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          {...register("title", {
            validate: (value) =>
              value.trim().length > 0 || "제목은 필수 입력입니다.",
          })}
          className={
            errors.title
              ? "w-full rounded-md border border-red-500 px-3 py-2 outline-none ring-1 ring-red-500"
              : "w-full rounded-md border px-3 py-2"
          }
        />
      </div>

      <div className="space-y-1">
        <ImageCropUploadField
          label="썸네일 이미지 *"
          value={thumbnailUrl || undefined}
          onUploadAction={onUploadThumbnailAction}
          onChangeAction={(nextUrl) =>
            setValue("thumbnailUrl", nextUrl, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          cropAspectRatio={16 / 9}
          outputWidth={1600}
          outputHeight={900}
          previewClassName="h-36 w-64 rounded-md border object-cover"
          allowRemove={false}
          disabled={isLoading}
        />
        <input
          type="hidden"
          {...register("thumbnailUrl", {
            validate: (value) =>
              value.trim().length > 0 || "썸네일 이미지는 필수 입력입니다.",
          })}
          value={thumbnailUrl}
        />
        <p className="text-xs text-neutral-500">
          썸네일은 가로형 비율(16:9)로 크롭 후 업로드됩니다.
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor="content" className="text-sm">
          내용 <span className="text-red-500">*</span>
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
            validate: (value) =>
              value.trim().length > 0 || "내용은 필수 입력입니다.",
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
        작성 후 바로 공개
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
        {isLoading ? "저장 중..." : submitLabel}
      </Button>
    </form>
  )
}
