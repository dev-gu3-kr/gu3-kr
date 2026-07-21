"use client"

import {
  type ChangeEvent,
  type DragEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type ContentEditorProps = {
  initialValue?: string
  onChangeAction: (markdown: string) => void
  onUploadImageAction: (file: File) => Promise<string>
  hasError?: boolean
  className?: string
  disabled?: boolean
}

type UploadBatch = {
  completed: number
  total: number
}

type ToastEditorLike = {
  destroy: () => void
  exec: (name: string, payload?: Record<string, unknown>) => void
  focus: () => void
  getMarkdown: () => string
  on: (event: "change", handler: () => void) => void
}

type ToastToolbarItem =
  | string
  | {
      name: string
      tooltip: string
      el: HTMLElement
    }

type ToastEditorConstructor = new (options: {
  el: HTMLElement
  height: string
  minHeight: string
  initialValue: string
  initialEditType: "wysiwyg" | "markdown"
  previewStyle: "vertical" | "tab"
  hideModeSwitch: boolean
  usageStatistics: boolean
  toolbarItems: ToastToolbarItem[][]
  hooks: {
    addImageBlobHook: (
      blob: Blob | File,
      callback: (url: string, altText?: string) => void,
    ) => void
  }
}) => ToastEditorLike

const EMPTY_UPLOAD_BATCH: UploadBatch = { completed: 0, total: 0 }

// 본문 에디터의 다중 선택과 드롭 업로드를 순차 처리해 이미지 삽입 순서를 보존한다.
export function ContentEditor({
  initialValue = "",
  onChangeAction,
  onUploadImageAction,
  hasError = false,
  className,
  disabled = false,
}: ContentEditorProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const editorRef = useRef<ToastEditorLike | null>(null)
  const uploadQueueRef = useRef<Promise<void>>(Promise.resolve())
  const pendingUploadCountRef = useRef(0)
  const resetTimerRef = useRef<number | null>(null)
  const onChangeActionRef = useRef(onChangeAction)
  const onUploadImageActionRef = useRef(onUploadImageAction)
  const isMountedRef = useRef(true)
  const [uploadBatch, setUploadBatch] =
    useState<UploadBatch>(EMPTY_UPLOAD_BATCH)
  const [isDraggingImages, setIsDraggingImages] = useState(false)

  useEffect(() => {
    onChangeActionRef.current = onChangeAction
  }, [onChangeAction])

  useEffect(() => {
    onUploadImageActionRef.current = onUploadImageAction
  }, [onUploadImageAction])

  useEffect(() => {
    // React Strict Mode가 effect를 재실행해도 비동기 업로드 결과를 현재 마운트에 반영한다.
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  const enqueueImageUpload = useCallback(
    (file: File, insertImage: (url: string, altText: string) => void) => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current)
        resetTimerRef.current = null
      }

      pendingUploadCountRef.current += 1
      setUploadBatch((current) => ({
        completed: current.completed === current.total ? 0 : current.completed,
        total: current.completed === current.total ? 1 : current.total + 1,
      }))

      uploadQueueRef.current = uploadQueueRef.current.then(async () => {
        try {
          const url = await onUploadImageActionRef.current(file)
          if (!isMountedRef.current) return

          insertImage(url, file.name || "image")

          const editor = editorRef.current
          if (editor) onChangeActionRef.current(editor.getMarkdown())
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "이미지 업로드에 실패했습니다.",
          )
        } finally {
          pendingUploadCountRef.current -= 1

          if (isMountedRef.current) {
            setUploadBatch((current) => ({
              ...current,
              completed: current.completed + 1,
            }))

            if (pendingUploadCountRef.current === 0) {
              resetTimerRef.current = window.setTimeout(() => {
                setUploadBatch(EMPTY_UPLOAD_BATCH)
                resetTimerRef.current = null
              }, 300)
            }
          }
        }
      })
    },
    [],
  )

  const enqueueSelectedFiles = useCallback(
    (files: File[]) => {
      const imageFiles = files.filter((file) => file.type.startsWith("image/"))

      if (imageFiles.length !== files.length) {
        toast.error("이미지 파일만 본문에 추가할 수 있습니다.")
      }

      for (const file of imageFiles) {
        enqueueImageUpload(file, (url, altText) => {
          const editor = editorRef.current
          if (!editor) return

          editor.focus()
          editor.exec("addImage", { imageUrl: url, altText })
        })
      }
    },
    [enqueueImageUpload],
  )

  useEffect(() => {
    let disposed = false
    const imageButton = document.createElement("button")
    imageButton.type = "button"
    imageButton.className = "toastui-editor-toolbar-icons image"
    imageButton.style.margin = "0"
    imageButton.title = "이미지 여러 장 추가"
    imageButton.setAttribute("aria-label", "이미지 여러 장 추가")
    imageButton.disabled = disabled
    imageButton.addEventListener("click", () => fileInputRef.current?.click())

    void import("@toast-ui/editor").then((module) => {
      if (disposed || !mountRef.current || editorRef.current) return

      const editorViewportHeight = window.innerWidth < 640 ? "320px" : "520px"
      const toolbarItems: ToastToolbarItem[][] = [
        ["heading", "bold", "italic", "strike"],
        ["hr", "quote"],
        ["ul", "ol", "task", "indent", "outdent"],
        [
          "table",
          {
            name: "multiImage",
            tooltip: "이미지 여러 장 추가",
            el: imageButton,
          },
          "link",
        ],
        ["code", "codeblock"],
        ["scrollSync"],
      ]

      const Editor = module.default as unknown as ToastEditorConstructor
      const editor = new Editor({
        el: mountRef.current,
        height: editorViewportHeight,
        minHeight: editorViewportHeight,
        initialValue,
        initialEditType: "wysiwyg",
        previewStyle: "vertical",
        hideModeSwitch: false,
        usageStatistics: false,
        toolbarItems,
        hooks: {
          addImageBlobHook: (blob, callback) => {
            if (disabled) return

            const file =
              blob instanceof File
                ? blob
                : new File([blob], "content-image.png", {
                    type: blob.type || "image/png",
                  })

            enqueueImageUpload(file, callback)
          },
        },
      })

      editor.on("change", () => {
        onChangeActionRef.current(editor.getMarkdown())
      })

      editorRef.current = editor
    })

    return () => {
      disposed = true
      imageButton.remove()
      editorRef.current?.destroy()
      editorRef.current = null
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current)
      }
    }
  }, [disabled, enqueueImageUpload, initialValue])

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    enqueueSelectedFiles(Array.from(event.target.files ?? []))
    event.target.value = ""
  }

  function handleDragOver(event: DragEvent<HTMLFieldSetElement>) {
    const hasFiles =
      Array.from(event.dataTransfer.types).includes("Files") ||
      Array.from(event.dataTransfer.items).some((item) => item.kind === "file")

    if (!hasFiles) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer.dropEffect = "copy"

    if (!disabled) setIsDraggingImages(true)
  }

  function handleDragLeave(event: DragEvent<HTMLFieldSetElement>) {
    if (
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return
    }
    setIsDraggingImages(false)
  }

  function handleDrop(event: DragEvent<HTMLFieldSetElement>) {
    const files = Array.from(event.dataTransfer.files)

    if (files.length === 0) {
      setIsDraggingImages(false)
      return
    }

    // Toast UI보다 먼저 처리해 기존 이미지 위에서도 전체 FileList를 한 번만 업로드한다.
    event.preventDefault()
    event.stopPropagation()
    setIsDraggingImages(false)

    if (!disabled) enqueueSelectedFiles(files)
  }

  const progress =
    uploadBatch.total > 0
      ? Math.max(
          8,
          Math.round((uploadBatch.completed / uploadBatch.total) * 100),
        )
      : 0
  const isUploading = uploadBatch.total > 0

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={disabled}
        onChange={handleFileChange}
      />
      <fieldset
        aria-label="본문 편집기 이미지 드롭 영역"
        onDragOverCapture={handleDragOver}
        onDragLeaveCapture={handleDragLeave}
        onDropCapture={handleDrop}
        className={cn(
          "min-w-0 w-full overflow-hidden rounded-md transition-shadow",
          hasError && "border border-red-500 ring-1 ring-red-500",
          isDraggingImages && "ring-2 ring-primary ring-offset-2",
          className,
        )}
      >
        <div ref={mountRef} />
      </fieldset>

      <p className="text-xs text-neutral-500">
        이미지 아이콘에서 여러 장을 선택하거나 에디터로 드래그앤드롭할 수
        있습니다.
      </p>

      {isUploading ? (
        <div className="space-y-1" aria-live="polite">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-neutral-500">
            본문 이미지 업로드 중... {uploadBatch.completed}/{uploadBatch.total}
          </p>
        </div>
      ) : null}
    </div>
  )
}
