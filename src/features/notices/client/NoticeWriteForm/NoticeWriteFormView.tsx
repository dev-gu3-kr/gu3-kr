"use client"

import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
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
  submitLabel?: string
}

type ToastEditorLike = {
  getMarkdown: () => string
  setMarkdown: (markdown: string, cursorToEnd?: boolean) => void
  on: (event: "change", handler: () => void) => void
}

export function NoticeWriteFormView({
  onSubmitAction,
  isLoading,
  message,
  isError,
  initialTitle,
  initialSummary,
  initialContent,
  initialIsPublished,
  submitLabel = "공지 저장",
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
    },
    mode: "onSubmit",
  })

  const content = watch("content")
  const mountRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<ToastEditorLike | null>(null)

  useEffect(() => {
    let disposed = false

    void import("@toast-ui/editor").then((module) => {
      if (disposed || !mountRef.current || editorRef.current) {
        return
      }

      const Editor = module.default
      const editor = new Editor({
        el: mountRef.current,
        height: window.innerWidth < 640 ? "240px" : "360px",
        initialValue: initialContent ?? "",
        initialEditType: "wysiwyg",
        previewStyle: "vertical",
        hideModeSwitch: false,
        usageStatistics: false,
      }) as ToastEditorLike

      editor.on("change", () => {
        const markdown = editor.getMarkdown()
        setValue("content", markdown, {
          shouldDirty: true,
          shouldValidate: true,
        })
      })

      editorRef.current = editor
    })

    return () => {
      disposed = true
      editorRef.current = null
      if (mountRef.current) {
        mountRef.current.innerHTML = ""
      }
    }
  }, [initialContent, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmitAction)} className="min-w-0 space-y-4">
      <div className="space-y-1">
        <label htmlFor="title" className="text-sm">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
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
        <input
          id="summary"
          {...register("summary")}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="content" className="text-sm">
          본문 <span className="text-red-500">*</span>
        </label>
        <div
          ref={mountRef}
          className={
            errors.content
              ? "min-w-0 w-full overflow-hidden rounded-md border border-red-500 ring-1 ring-red-500"
              : "min-w-0 w-full overflow-hidden"
          }
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

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isPublished")} />
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

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-60 sm:w-auto"
      >
        {isLoading ? "저장 중..." : submitLabel}
      </button>
    </form>
  )
}
