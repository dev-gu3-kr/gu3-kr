"use client"

import { useForm } from "react-hook-form"
import { ContentEditor } from "@/components/ContentEditor"
import { ImageCropUploadField } from "@/components/ImageCropUploadField"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import type { CreateIntroPostInputDto } from "@/features/intro-posts/isomorphic"

type IntroPostFormViewProps = {
  onSubmitAction: (values: CreateIntroPostInputDto) => void
  onUploadImageAction: (file: File, previousUrl?: string) => Promise<string>
  onRemoveImageAction: (url: string) => Promise<void>
  isLoading: boolean
  message: string | null
  isError: boolean
  initialTitle?: string
  initialImageUrl?: string
  initialContent?: string
  initialSortOrder?: number
  initialIsPublished?: boolean
  submitLabel?: string
}

export function IntroPostFormView({
  onSubmitAction,
  onUploadImageAction,
  onRemoveImageAction,
  isLoading,
  message,
  isError,
  initialTitle,
  initialImageUrl,
  initialContent,
  initialSortOrder,
  initialIsPublished,
  submitLabel = "저장",
}: IntroPostFormViewProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateIntroPostInputDto>({
    defaultValues: {
      title: initialTitle ?? "",
      imageUrl: initialImageUrl ?? "",
      content: initialContent ?? "",
      sortOrder: initialSortOrder ?? 0,
      isPublished: initialIsPublished ?? false,
    },
    mode: "onSubmit",
  })

  const content = watch("content")
  const imageUrl = watch("imageUrl")

  return (
    <form onSubmit={handleSubmit(onSubmitAction)} className="space-y-5">
      <div className="space-y-1">
        <label htmlFor="title" className="text-sm">
          제목 <span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          {...register("title", {
            validate: (value) =>
              value.trim().length > 0 || "제목은 필수 입력입니다.",
          })}
          className={
            errors.title ? "border-red-500 ring-1 ring-red-500" : undefined
          }
        />
      </div>

      <div className="space-y-1">
        <ImageCropUploadField
          label="대표 이미지 *"
          value={imageUrl || undefined}
          onUploadAction={onUploadImageAction}
          onRemoveImageAction={onRemoveImageAction}
          onChangeAction={(nextUrl) =>
            setValue("imageUrl", nextUrl, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          cropAspectRatio={16 / 9}
          outputWidth={1600}
          outputHeight={900}
          previewClassName="h-auto w-full max-w-xl rounded-md border object-cover"
          allowRemove
          disabled={isLoading}
        />
        <input
          type="hidden"
          {...register("imageUrl", {
            validate: (value) =>
              value.trim().length > 0 || "대표 이미지는 필수 입력입니다.",
          })}
          value={imageUrl}
        />
        <p className="text-xs text-neutral-500">
          목록과 소개 페이지 상단 카드에 같은 대표 이미지가 노출됩니다.
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
        <p className="text-xs text-neutral-500">
          에디터에서 서식과 이미지를 함께 작성할 수 있습니다.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
        <div className="space-y-1">
          <label htmlFor="sortOrder" className="text-sm">
            정렬순서
          </label>
          <Input
            id="sortOrder"
            type="number"
            min={0}
            {...register("sortOrder", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
              validate: (value) =>
                value === undefined ||
                (Number.isInteger(value) && value >= 0) ||
                "정렬순서는 0 이상의 정수여야 합니다.",
            })}
            className={
              errors.sortOrder
                ? "border-red-500 ring-1 ring-red-500"
                : undefined
            }
          />
          <p className="text-xs text-neutral-500">
            숫자가 낮을수록 먼저 노출됩니다. 같은 값이면 최신 글이 먼저
            보입니다.
          </p>
        </div>

        <label
          htmlFor="is-published"
          className="flex items-center gap-2 text-sm sm:pb-7"
        >
          <Checkbox
            id="is-published"
            checked={Boolean(watch("isPublished"))}
            onCheckedChange={(checked: boolean | "indeterminate") =>
              setValue("isPublished", Boolean(checked), { shouldDirty: true })
            }
          />
          저장 후 바로 공개
        </label>
      </div>

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
