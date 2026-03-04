"use client"

import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
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

type ToastEditorLike = {
  getMarkdown: () => string
  on: (event: "change", handler: () => void) => void
}

type ToastEditorConstructor = new (options: {
  el: HTMLElement
  height: string
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
        height: window.innerWidth < 640 ? "260px" : "360px",
        initialValue: initialContent ?? "",
        initialEditType: "wysiwyg",
        previewStyle: "vertical",
        hideModeSwitch: false,
        usageStatistics: false,
        hooks: {
          addImageBlobHook: async (blob, callback) => {
            if (isUploadingImageRef.current) return

            isUploadingImageRef.current = true
            setIsUploadingImage(true)
            setImageUploadProgress(10)

            try {
              const file =
                blob instanceof File
                  ? blob
                  : new File([blob], "gallery-content-image.png", {
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
      })

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
          cropAspectRatio={16 / 9}
          outputWidth={1600}
          outputHeight={900}
          previewClassName="h-28 w-48 rounded-md border object-cover"
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
          썸네일은 랜드스케이프 비율(16:9)로 크롭 후 업로드됩니다.
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor="content" className="text-sm">
          내용 <span className="text-red-500">*</span>
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
            validate: (v) => v.trim().length > 0 || "내용은 필수 입력입니다.",
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
              본문 이미지 업로드 중... {imageUploadProgress}%
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
