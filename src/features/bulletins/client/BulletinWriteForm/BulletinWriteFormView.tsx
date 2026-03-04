"use client"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

type BulletinWriteFormValues = {
  title: string
  content: string
  isPublished: boolean
  file: FileList
}

type BulletinWriteFormViewProps = {
  onSubmitAction: (values: BulletinWriteFormValues) => Promise<void>
  isLoading: boolean
  message: string | null
  isError: boolean
  initialTitle?: string
  initialContent?: string
  initialIsPublished?: boolean
  submitLabel?: string
  requireFile?: boolean
  currentFileName?: string
  currentFileUrl?: string
}

// 본당주보 작성/수정 폼 UI: 제목/파일/내용 필드를 검증해 제출한다.
export function BulletinWriteFormView({
  onSubmitAction,
  isLoading,
  message,
  isError,
  initialTitle = "",
  initialContent = "",
  initialIsPublished = true,
  submitLabel = "주보 저장",
  requireFile = true,
  currentFileName,
  currentFileUrl,
}: BulletinWriteFormViewProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BulletinWriteFormValues>({
    defaultValues: {
      title: initialTitle,
      content: initialContent,
      isPublished: initialIsPublished,
    },
    mode: "onSubmit",
  })

  return (
    <form onSubmit={handleSubmit(onSubmitAction)} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="title" className="text-sm">
          제목 <span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          {...register("title", {
            validate: (value) =>
              value.trim().length > 0 || "제목은 필수입니다.",
          })}
          className={errors.title ? "border-red-500 ring-1 ring-red-500" : ""}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="file" className="text-sm">
          주보파일
          {requireFile ? <span className="text-red-500"> *</span> : null}
        </label>
        <Input
          id="file"
          type="file"
          accept=".pdf,.doc,.docx,.hwp,.hwpx"
          {...register("file", {
            validate: (value) =>
              !requireFile || value?.length > 0 || "주보파일은 필수입니다.",
          })}
          className={errors.file ? "border-red-500 ring-1 ring-red-500" : ""}
        />

        {!requireFile && currentFileName && currentFileUrl ? (
          <p className="text-xs text-neutral-600">
            현재 파일:{" "}
            <a href={currentFileUrl} className="text-blue-600 hover:underline">
              {currentFileName}
            </a>
          </p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="content" className="text-sm">
          내용 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          rows={8}
          {...register("content", {
            validate: (value) =>
              value.trim().length > 0 || "내용은 필수입니다.",
          })}
          className={
            errors.content
              ? "w-full rounded-md border border-red-500 px-3 py-2 ring-1 ring-red-500"
              : "w-full rounded-md border px-3 py-2"
          }
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
