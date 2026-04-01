"use client"

import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
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
  initialIsPublished?: boolean
  submitLabel?: string
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
      isPublished: initialIsPublished ?? false,
    },
    mode: "onSubmit",
  })

  const content = watch("content")
  const imageUrl = watch("imageUrl")
  const mountRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<ToastEditorLike | null>(null)
  const isUploadingImageRef = useRef(false)
  const [isUploadingContentImage, setIsUploadingContentImage] = useState(false)
  const [contentImageUploadProgress, setContentImageUploadProgress] =
    useState(0)

  useEffect(() => {
    if (!isUploadingContentImage) {
      setContentImageUploadProgress(0)
      return
    }

    setContentImageUploadProgress(8)
    const timer = window.setInterval(() => {
      setContentImageUploadProgress((prev) =>
        prev >= 90 ? prev : prev + Math.max(2, Math.round((90 - prev) * 0.14)),
      )
    }, 140)

    return () => window.clearInterval(timer)
  }, [isUploadingContentImage])

  useEffect(() => {
    let disposed = false

    void import("@toast-ui/editor").then((module) => {
      if (disposed || !mountRef.current || editorRef.current) return

      const Editor = module.default as ToastEditorConstructor
      const editorViewportHeight = window.innerWidth < 640 ? "320px" : "520px"
      const editor = new Editor({
        el: mountRef.current,
        height: editorViewportHeight,
        minHeight: editorViewportHeight,
        initialValue: initialContent ?? "",
        initialEditType: "wysiwyg",
        previewStyle: "vertical",
        hideModeSwitch: false,
        usageStatistics: false,
        hooks: {
          addImageBlobHook: async (blob, callback) => {
            if (isUploadingImageRef.current) return

            isUploadingImageRef.current = true
            setIsUploadingContentImage(true)
            setContentImageUploadProgress(10)

            try {
              const file =
                blob instanceof File
                  ? blob
                  : new File([blob], "intro-content-image.png", {
                      type: blob.type || "image/png",
                    })

              const nextUrl = await onUploadImageAction(file)
              setContentImageUploadProgress(100)
              callback(nextUrl, file.name)

              setValue("content", editor.getMarkdown(), {
                shouldDirty: true,
                shouldValidate: true,
              })
            } catch (error) {
              window.alert(
                error instanceof Error
                  ? error.message
                  : "본문 이미지 업로드에 실패했습니다.",
              )
            } finally {
              isUploadingImageRef.current = false
              window.setTimeout(() => {
                setIsUploadingContentImage(false)
                setContentImageUploadProgress(0)
              }, 150)
            }
          },
        },
      }) as ToastEditorLike

      editor.on("change", () => {
        setValue("content", editor.getMarkdown(), {
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
        <div
          ref={mountRef}
          className={
            errors.content
              ? "min-w-0 w-full overflow-hidden rounded-md border border-red-500 ring-1 ring-red-500"
              : "min-w-0 w-full overflow-hidden rounded-md border"
          }
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
        {isUploadingContentImage ? (
          <div className="mt-2 space-y-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-150"
                style={{ width: `${contentImageUploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-neutral-500">
              본문 이미지 업로드 중... {contentImageUploadProgress}%
            </p>
          </div>
        ) : null}
        <p className="text-xs text-neutral-500">
          에디터에서 서식과 이미지를 함께 작성할 수 있습니다.
        </p>
      </div>

      <label htmlFor="is-published" className="flex items-center gap-2 text-sm">
        <Checkbox
          id="is-published"
          checked={Boolean(watch("isPublished"))}
          onCheckedChange={(checked: boolean | "indeterminate") =>
            setValue("isPublished", Boolean(checked), { shouldDirty: true })
          }
        />
        저장 후 바로 공개
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
