"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  type AdminGalleryPhotoDto,
  GALLERY_PHOTO_UPLOAD_CONCURRENCY,
  type GalleryUploadItemDto,
  invalidateGalleryPhotos,
  useBulkGalleryPhotoStatus,
  useCreateGalleryUploadBatch,
  useDeleteGalleryPhoto,
  useGalleryPhotos,
  useGalleryUploads,
  useRetryGalleryPhoto,
  useUpdateGalleryPhoto,
  useUploadGalleryPhoto,
  validateGalleryPhotoSelection,
} from "@/features/galleryPhotos/isomorphic"
import { AdminGalleryPhotosView } from "./AdminGalleryPhotosView"

export type GalleryUploadJob = {
  id: string
  file: File
  registered: boolean
  status: GalleryUploadItemDto["status"]
  message?: string
}

export function AdminGalleryPhotosContainer({ postId }: { postId: string }) {
  const client = useQueryClient()
  const filter = useForm({ defaultValues: { status: "ALL" } })
  const bulkForm = useForm<{ status: "PUBLISHED" | "HIDDEN" }>({
    defaultValues: { status: "PUBLISHED" },
    mode: "onSubmit",
  })
  const status = filter.watch("status")
  const photos = useGalleryPhotos(postId, true, status)
  const uploads = useGalleryUploads(postId)
  const createBatch = useCreateGalleryUploadBatch(postId)
  const upload = useUploadGalleryPhoto(postId)
  const retry = useRetryGalleryPhoto(postId)
  const bulk = useBulkGalleryPhotoStatus(postId)
  const update = useUpdateGalleryPhoto(postId)
  const remove = useDeleteGalleryPhoto(postId)
  const [jobs, setJobs] = useState<GalleryUploadJob[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const uploadLock = useRef(false)
  const batchId = useRef<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedPhoto, setSelectedPhoto] =
    useState<AdminGalleryPhotoDto | null>(null)
  const editForm = useForm({
    defaultValues: {
      caption: "",
      altText: "",
      status: "HIDDEN" as "HIDDEN" | "PUBLISHED",
    },
    mode: "onSubmit",
  })
  const items = useMemo(
    () =>
      (photos.data?.pages.flatMap((page) => page.items) ??
        []) as AdminGalleryPhotoDto[],
    [photos.data],
  )
  const completedSignature =
    uploads.data?.items
      .filter((item) => item.status === "COMPLETED")
      .map((item) => item.id)
      .sort()
      .join(",") ?? ""

  useEffect(() => {
    if (completedSignature) void invalidateGalleryPhotos(client, postId)
  }, [client, postId, completedSignature])

  const displayedJobs = jobs.map((job) => {
    const server = uploads.data?.items.find((item) => item.id === job.id)
    // 원본을 다시 전송 중일 때 오래된 서버 상태로 진행 표시를 덮어쓰지 않는다.
    return server &&
      job.status !== "UPLOADING" &&
      !(job.status === "FAILED" && server.status === "WAITING")
      ? { ...job, status: server.status, message: server.error ?? undefined }
      : job
  })

  function selectFiles(files: File[]) {
    if (uploadLock.current) return
    const signatures = new Set(
      jobs.map(
        (job) => `${job.file.name}:${job.file.size}:${job.file.lastModified}`,
      ),
    )
    const unique = files.filter((file) => {
      const key = `${file.name}:${file.size}:${file.lastModified}`
      if (signatures.has(key)) return false
      signatures.add(key)
      return true
    })
    if (!unique.length) {
      toast.error("이미 선택한 사진입니다.")
      return
    }
    const error = validateGalleryPhotoSelection([
      ...jobs.map((job) => job.file),
      ...unique,
    ])
    if (error) {
      toast.error(error)
      return
    }
    setJobs((previous) => [
      ...previous,
      ...unique.map((file) => {
        const resumable = uploads.data?.items.find(
          (item) =>
            item.needsFile &&
            ["WAITING", "FAILED"].includes(item.status) &&
            item.originalName === file.name &&
            item.sizeBytes === file.size,
        )
        return {
          id: resumable?.id ?? crypto.randomUUID(),
          file,
          registered: Boolean(resumable),
          status: resumable?.status ?? ("WAITING" as const),
        }
      }),
    ])
  }

  async function startUpload() {
    if (uploadLock.current) return
    const pending = displayedJobs.filter((job) =>
      ["WAITING", "FAILED"].includes(job.status),
    )
    if (!pending.length) {
      toast.error("업로드할 사진을 선택해 주세요.")
      return
    }
    uploadLock.current = true
    setIsUploading(true)
    let failed = 0
    try {
      const unregistered = pending.filter((job) => !job.registered)
      if (unregistered.length) {
        batchId.current ??= crypto.randomUUID()
        await createBatch.mutateAsync({
          id: batchId.current,
          files: unregistered.map((job) => ({
            id: job.id,
            name: job.file.name,
            size: job.file.size,
          })),
        })
        setJobs((previous) =>
          previous.map((job) =>
            unregistered.some((item) => item.id === job.id)
              ? { ...job, registered: true }
              : job,
          ),
        )
        batchId.current = null
      }
      let next = 0
      async function worker() {
        while (next < pending.length) {
          const job = pending[next++]
          setJobs((previous) =>
            previous.map((item) =>
              item.id === job.id
                ? { ...item, status: "UPLOADING", message: undefined }
                : item,
            ),
          )
          try {
            if (
              job.registered &&
              uploads.data?.items.find((item) => item.id === job.id)?.status ===
                "FAILED"
            )
              await retry.mutateAsync(job.id)
            const result = await upload.mutateAsync({
              id: job.id,
              file: job.file,
            })
            setJobs((previous) =>
              previous.map((item) =>
                item.id === job.id ? { ...item, status: result.status } : item,
              ),
            )
          } catch (error) {
            failed += 1
            setJobs((previous) =>
              previous.map((item) =>
                item.id === job.id
                  ? {
                      ...item,
                      status: "FAILED",
                      message:
                        error instanceof Error
                          ? error.message
                          : "전송에 실패했습니다.",
                    }
                  : item,
              ),
            )
          }
        }
      }
      await Promise.all(
        Array.from(
          {
            length: Math.min(GALLERY_PHOTO_UPLOAD_CONCURRENCY, pending.length),
          },
          worker,
        ),
      )
      await invalidateGalleryPhotos(client, postId)
      if (failed)
        toast.error(
          `${failed}장 전송에 실패했습니다. 실패한 사진만 다시 시도할 수 있습니다.`,
        )
      else
        toast.success(
          "사진 전송이 끝났습니다. 처리 완료 후 숨김 상태로 등록됩니다.",
        )
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "업로드를 시작하지 못했습니다.",
      )
    } finally {
      uploadLock.current = false
      setIsUploading(false)
    }
  }

  async function retryJob(id: string) {
    try {
      await retry.mutateAsync(id)
      toast.success("사진 처리를 다시 시작했습니다.")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "재시도하지 못했습니다.",
      )
    }
  }

  const changeStatus = bulkForm.handleSubmit(async ({ status: nextStatus }) => {
    if (!selectedIds.size) return
    try {
      // 계속 불러온 사진도 선택할 수 있도록 API 제한에 맞춰 묶음으로 처리한다.
      const ids = [...selectedIds]
      let count = 0
      for (let index = 0; index < ids.length; index += 100)
        count += (
          await bulk.mutateAsync({
            photoIds: ids.slice(index, index + 100),
            status: nextStatus,
          })
        ).count
      setSelectedIds(new Set())
      toast.success(
        `${count}장을 ${nextStatus === "PUBLISHED" ? "공개" : "숨김"}로 변경했습니다.`,
      )
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "상태를 변경하지 못했습니다.",
      )
    }
  })

  function selectPhoto(photo: AdminGalleryPhotoDto | null) {
    setSelectedPhoto(photo)
    if (photo)
      editForm.reset({
        caption: photo.caption ?? "",
        altText: photo.altText,
        status: photo.status,
      })
  }

  const savePhoto = editForm.handleSubmit(async (values) => {
    if (!selectedPhoto) return
    try {
      await update.mutateAsync({ id: selectedPhoto.id, ...values })
      selectPhoto(null)
      toast.success("사진 정보를 저장했습니다.")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "사진 정보를 저장하지 못했습니다.",
      )
    }
  })

  async function deletePhoto() {
    if (
      !selectedPhoto ||
      !window.confirm(
        "이 사진의 원본과 표시본을 삭제할까요? 삭제한 사진은 복구할 수 없습니다.",
      )
    )
      return
    try {
      const result = await remove.mutateAsync(selectedPhoto.id)
      setSelectedIds(
        (previous) =>
          new Set([...previous].filter((id) => id !== selectedPhoto.id)),
      )
      selectPhoto(null)
      toast.success(
        result.cleanupPending
          ? "사진을 삭제했습니다. 파일 정리는 자동 재시도됩니다."
          : "사진을 삭제했습니다.",
      )
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "사진을 삭제하지 못했습니다.",
      )
    }
  }

  return (
    <AdminGalleryPhotosView
      postId={postId}
      items={items}
      totalCount={photos.data?.pages[0]?.totalCount ?? 0}
      jobs={displayedJobs}
      serverJobs={uploads.data?.items ?? []}
      status={status}
      onStatusChange={(value) => {
        filter.setValue("status", value)
        setSelectedIds(new Set())
      }}
      bulkStatus={bulkForm.watch("status")}
      onBulkStatusChange={(value) => bulkForm.setValue("status", value)}
      onBulkSubmit={changeStatus}
      selectedIds={selectedIds}
      onToggle={(id) =>
        setSelectedIds((previous) => {
          const next = new Set(previous)
          if (next.has(id)) next.delete(id)
          else next.add(id)
          return next
        })
      }
      onToggleVisible={() =>
        setSelectedIds((previous) =>
          items.every((item) => previous.has(item.id))
            ? new Set()
            : new Set(items.map((item) => item.id)),
        )
      }
      onSelectPhoto={selectPhoto}
      selectedPhoto={selectedPhoto}
      editRegistration={editForm.register}
      editErrors={editForm.formState.errors}
      editStatus={editForm.watch("status")}
      onEditStatusChange={(value) => editForm.setValue("status", value)}
      onSavePhoto={savePhoto}
      onDeletePhoto={deletePhoto}
      isUploading={isUploading}
      isMutating={bulk.isPending || update.isPending || remove.isPending}
      onFilesSelected={selectFiles}
      onUpload={startUpload}
      onClearJobs={() => {
        setJobs([])
        batchId.current = null
      }}
      onRetryJob={retryJob}
      isRetrying={retry.isPending}
      isLoading={photos.isLoading}
      isError={photos.isError}
      onRetryList={() => {
        void photos.refetch()
      }}
      hasMore={Boolean(photos.hasNextPage)}
      isLoadingMore={photos.isFetchingNextPage}
      onLoadMore={() => photos.fetchNextPage().then(() => undefined)}
    />
  )
}
