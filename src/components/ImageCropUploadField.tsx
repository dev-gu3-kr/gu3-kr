"use client"

import Image from "next/image"
import type { ChangeEvent } from "react"
import { useEffect, useRef, useState } from "react"
import { Cropper, type ReactCropperElement } from "react-cropper"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

type Props = {
  label?: string
  value?: string
  onChangeAction: (nextUrl: string) => void
  onUploadAction: (file: File, previousUrl?: string) => Promise<string>
  onRemoveImageAction?: (currentUrl: string) => Promise<void>
  disabled?: boolean
  cropAspectRatio?: number
  outputWidth?: number
  outputHeight?: number
  previewClassName?: string
  allowRemove?: boolean
}

function UploadProgressBar({
  progress,
  text,
}: {
  progress: number
  text: string
}) {
  return (
    <div className="space-y-1">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-neutral-500">
        {text} {progress}%
      </p>
    </div>
  )
}

export function ImageCropUploadField({
  label = "프로필 이미지",
  value,
  onChangeAction,
  onUploadAction,
  onRemoveImageAction,
  disabled = false,
  cropAspectRatio = 13 / 16,
  outputWidth = 1040,
  outputHeight = 1280,
  previewClassName = "h-32 w-26 rounded-md border object-cover",
  allowRemove = true,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const cropperRef = useRef<ReactCropperElement | null>(null)

  const [sourceImage, setSourceImage] = useState<string | null>(null)
  const [filename, setFilename] = useState("image.webp")
  const [isPreparing, setIsPreparing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    if (!isUploading && !isRemoving) return

    const timer = window.setInterval(() => {
      setUploadProgress((prev) =>
        prev >= 90 ? prev : prev + Math.max(2, Math.round((90 - prev) * 0.12)),
      )
    }, 120)

    return () => window.clearInterval(timer)
  }, [isUploading, isRemoving])

  function handleSelectClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setIsPreparing(true)
    setUploadProgress(12)
    setFilename(`${(file.name || "image").split(".")[0]}.webp`)

    const reader = new FileReader()
    reader.onload = () => {
      setUploadProgress(100)
      setSourceImage(String(reader.result || ""))
      window.setTimeout(() => {
        setIsPreparing(false)
        setUploadProgress(0)
      }, 120)
    }
    reader.onerror = () => {
      setIsPreparing(false)
      setUploadProgress(0)
      toast.error("이미지 파일을 읽는 중 오류가 발생했습니다.")
    }
    reader.readAsDataURL(file)

    event.target.value = ""
  }

  function handleCancelCrop() {
    if (isUploading || isPreparing || isRemoving) return
    setSourceImage(null)
  }

  async function handleRemoveImage() {
    if (!allowRemove) {
      toast.info("썸네일은 삭제할 수 없습니다. 다른 이미지로 교체해 주세요.")
      return
    }

    if (isUploading || isPreparing || isRemoving) return

    try {
      setIsRemoving(true)
      setUploadProgress(8)
      if (value && onRemoveImageAction) await onRemoveImageAction(value)
      setUploadProgress(100)
      onChangeAction("")
      toast.success("이미지가 제거되었습니다.")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "이미지 제거에 실패했습니다.",
      )
    } finally {
      window.setTimeout(() => {
        setIsRemoving(false)
        setUploadProgress(0)
      }, 120)
    }
  }

  function handleUploadCropped() {
    if (!cropperRef.current?.cropper) return

    setIsUploading(true)
    setUploadProgress(8)

    cropperRef.current.cropper
      .getCroppedCanvas({
        width: outputWidth,
        height: outputHeight,
        imageSmoothingQuality: "high",
      })
      .toBlob(
        async (blob) => {
          try {
            if (!blob) throw new Error("크롭 이미지를 생성하지 못했습니다.")

            const file = new File([blob], filename, { type: "image/webp" })
            const nextUrl = await onUploadAction(file, value)
            setUploadProgress(100)
            onChangeAction(nextUrl)
            setSourceImage(null)
            toast.success("이미지가 업로드되었습니다.")
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "이미지 업로드에 실패했습니다.",
            )
          } finally {
            window.setTimeout(() => {
              setIsUploading(false)
              setUploadProgress(0)
            }, 150)
          }
        },
        "image/webp",
        0.9,
      )
  }

  return (
    <div className="space-y-2">
      <label htmlFor="imageUploadInput" className="text-sm">
        {label}
      </label>

      <input
        id="imageUploadInput"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isUploading || isPreparing || isRemoving}
      />

      {isPreparing ? (
        <UploadProgressBar progress={uploadProgress} text="파일 준비 중..." />
      ) : null}

      {!sourceImage ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSelectClick}
              disabled={disabled || isUploading || isPreparing || isRemoving}
            >
              이미지 선택
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleRemoveImage}
              disabled={
                disabled ||
                isUploading ||
                isPreparing ||
                isRemoving ||
                !value ||
                !allowRemove
              }
            >
              이미지 제거
            </Button>
            <span className="text-xs text-neutral-500">
              {isRemoving
                ? "제거 중..."
                : isUploading
                  ? "업로드 중..."
                  : value
                    ? "업로드 완료"
                    : "선택된 이미지 없음"}
            </span>
          </div>

          {isRemoving ? (
            <UploadProgressBar
              progress={uploadProgress}
              text="이미지 제거 중..."
            />
          ) : isUploading ? (
            <UploadProgressBar progress={uploadProgress} text="업로드 중..." />
          ) : null}

          {value ? (
            <Image
              src={value}
              alt="preview"
              width={320}
              height={192}
              unoptimized
              className={previewClassName}
            />
          ) : null}
        </div>
      ) : (
        <div className="space-y-2 rounded-md border p-3">
          <div className="overflow-hidden rounded-md">
            <Cropper
              ref={cropperRef}
              src={sourceImage}
              style={{ height: 360, width: "100%" }}
              aspectRatio={cropAspectRatio}
              viewMode={1}
              background={false}
              responsive
              autoCropArea={1}
              checkOrientation={false}
              guides
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelCrop}
              disabled={isUploading || isPreparing || isRemoving}
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={handleUploadCropped}
              disabled={isUploading || isPreparing || isRemoving}
            >
              {isUploading ? "업로드 중..." : "크롭 후 업로드"}
            </Button>
          </div>

          {isRemoving ? (
            <UploadProgressBar
              progress={uploadProgress}
              text="이미지 제거 중..."
            />
          ) : isUploading ? (
            <UploadProgressBar progress={uploadProgress} text="업로드 중..." />
          ) : null}
        </div>
      )}
    </div>
  )
}
