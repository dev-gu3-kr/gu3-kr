// 공지 작성/수정 폼 UI: RHF + Toast UI Editor 동기화/이미지 업로드 훅
"use client"

import { useForm } from "react-hook-form"
import { ContentEditor } from "@/components/ContentEditor"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import type { CreateNoticeInputDto } from "@/features/notices/isomorphic"

type NoticeWriteFormViewProps = {
  onSubmitAction: (values: CreateNoticeInputDto) => void
  isLoading: boolean
  message: string | null
  isError: boolean
  initialTitle?: string
  initialSummary?: string
  initialContent?: string
  initialIsPublished?: boolean
  initialIsPinned?: boolean
  submitLabel?: string
  onUploadImageAction: (file: File) => Promise<string>
}

// 공지 폼 렌더러: RHF 상태와 Toast UI 에디터 상태를 동기화한다.
export function NoticeWriteFormView({
  onSubmitAction,
  isLoading,
  message,
  isError,
  initialTitle,
  initialSummary,
  initialContent,
  initialIsPublished,
  initialIsPinned,
  submitLabel = "공지 저장",
  onUploadImageAction,
}: NoticeWriteFormViewProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateNoticeInputDto>({
    defaultValues: {
      title: initialTitle ?? "",
      summary: initialSummary ?? "",
      content: initialContent ?? "",
      isPublished: initialIsPublished ?? false,
      isPinned: initialIsPinned ?? false,
    },
    mode: "onSubmit",
  })

  const content = watch("content")

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
        <label htmlFor="summary" className="text-sm">
          요약
        </label>
        <Input
          id="summary"
          {...register("summary")}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="content" className="text-sm">
          본문 <span className="text-red-500">*</span>
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
              value.trim().length > 0 || "본문은 필수 입력입니다.",
          })}
          value={content}
        />
      </div>

      <label htmlFor="is-pinned" className="flex items-center gap-2 text-sm">
        <Checkbox
          id="is-pinned"
          checked={Boolean(watch("isPinned"))}
          onCheckedChange={(checked: boolean | "indeterminate") =>
            setValue("isPinned", Boolean(checked), { shouldDirty: true })
          }
        />
        목록 상단 고정
      </label>
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
