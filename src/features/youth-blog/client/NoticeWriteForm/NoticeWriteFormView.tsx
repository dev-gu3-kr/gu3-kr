// 공지 작성/수정 폼 UI: RHF + Toast UI Editor 동기화/이미지 업로드 훅
"use client"

import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import type { CreateYouthBlogInputDto } from "@/features/youth-blog/isomorphic"

type NoticeWriteFormViewProps = {
  onSubmitAction: (values: CreateYouthBlogInputDto) => void
  isLoading: boolean
  message: string | null
  isError: boolean
  initialTitle?: string
  initialSummary?: string
  initialContent?: string
  initialIsPublished?: boolean
  submitLabel?: string
  onUploadImageAction: (file: File) => Promise<string>
}

type ToastEditorLike = {
  getMarkdown: () => string
  on: (event: "change", handler: () => void) => void
}

type ToastEditorConstructor = new (options: {
  el: HTMLElement
  height: string
  minHeight?: string
  initialValue: string
  initialEditType: "wysiwyg" | "markdown"
  previewStyle: "vertical" | "tab"
  hideModeSwitch: boolean
  usageStatistics: boolean
  hooks?: {
    addImageBlobHook?: (
      blob: Blob | File,
      callback: (url: string, altText?: string) => void,
    ) => Promise<void>
  }
}) => ToastEditorLike

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
  submitLabel = "공지 저장",
  onUploadImageAction,
}: NoticeWriteFormViewProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateYouthBlogInputDto>({
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
  const isUploadingImageRef = useRef(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imageUploadProgress, setImageUploadProgress] = useState(0)

  useEffect(() => {
    if (!isUploadingImage) {
      setImageUploadProgress(0)
      return
    }

    setImageUploadProgress(8)
    const timer = window.setInterval(() => {
      setImageUploadProgress((prev) =>
        prev >= 90 ? prev : prev + Math.max(2, Math.round((90 - prev) * 0.14)),
      )
    }, 140)

    return () => window.clearInterval(timer)
  }, [isUploadingImage])

  useEffect(() => {
    let disposed = false

    void import("@toast-ui/editor").then((module) => {
      if (disposed || !mountRef.current || editorRef.current) return

      const Editor = module.default as ToastEditorConstructor
      const editor = new Editor({
        el: mountRef.current,
        height: "auto",
        minHeight: window.innerWidth < 640 ? "320px" : "520px",
        initialValue: initialContent ?? "",
        initialEditType: "wysiwyg",
        previewStyle: "vertical",
        hideModeSwitch: false,
        usageStatistics: false,
        hooks: {
          // 에디터 이미지 삽입 시 업로드 API를 호출하고 반환 URL을 본문에 삽입한다.
          addImageBlobHook: async (blob, callback) => {
            if (isUploadingImageRef.current) return

            isUploadingImageRef.current = true
            setIsUploadingImage(true)
            setImageUploadProgress(10)

            try {
              const file =
                blob instanceof File
                  ? blob
                  : new File([blob], "notice-image.png", {
                      type: blob.type || "image/png",
                    })

              const imageUrl = await onUploadImageAction(file)
              setImageUploadProgress(100)
              callback(imageUrl, file.name)

              setValue("content", editor.getMarkdown(), {
                shouldDirty: true,
                shouldValidate: true,
              })
            } catch (error) {
              window.alert(
                error instanceof Error
                  ? error.message
                  : "이미지 업로드에 실패했습니다.",
              )
            } finally {
              isUploadingImageRef.current = false
              window.setTimeout(() => {
                setIsUploadingImage(false)
                setImageUploadProgress(0)
              }, 150)
            }
          },
        },
      }) as ToastEditorLike

      // 에디터 변경을 hidden content 필드에 반영해 RHF 검증/제출과 연결한다.
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
      if (mountRef.current) mountRef.current.innerHTML = ""
    }
  }, [initialContent, onUploadImageAction, setValue])

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

        {isUploadingImage ? (
          <div className="mt-2 space-y-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-150"
                style={{ width: `${imageUploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-neutral-500">
              이미지 업로드 중... {imageUploadProgress}%
            </p>
          </div>
        ) : null}
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
