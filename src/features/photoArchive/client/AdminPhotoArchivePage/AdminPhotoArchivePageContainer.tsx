"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  type AdminArchivePhotoDto,
  type ArchivePhotoAdminFilterDto,
  type ArchivePhotoStatusDto,
  archivePhotoYearSchema,
  invalidatePhotoArchiveQueries,
  PHOTO_ARCHIVE_UPLOAD_CONCURRENCY,
  useAdminPhotoArchiveInfinite,
  useBulkArchivePhotoMutation,
  useUploadArchivePhotoMutation,
  validateArchiveUploadSelection,
} from "@/features/photoArchive/isomorphic"
import { AdminPhotoArchivePageView } from "./AdminPhotoArchivePageView"

type UploadFormValues = { year: number }
type FilterFormValues = {
  year: number | null
  status: ArchivePhotoAdminFilterDto
}
type BulkYearFormValues = { year: number }
type BulkStatusFormValues = { status: ArchivePhotoStatusDto }

export type ArchiveUploadJob = {
  id: string
  file: File
  status: "WAITING" | "UPLOADING" | "SUCCESS" | "FAILED"
  message?: string
}

async function runWithConcurrency<T>(
  values: readonly T[],
  concurrency: number,
  worker: (value: T) => Promise<void>,
) {
  let nextIndex = 0
  async function runWorker() {
    while (nextIndex < values.length) {
      const index = nextIndex
      nextIndex += 1
      const value = values[index]
      if (value !== undefined) await worker(value)
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, runWorker),
  )
}

export function AdminPhotoArchivePageContainer() {
  const queryClient = useQueryClient()
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [selectedPhoto, setSelectedPhoto] =
    useState<AdminArchivePhotoDto | null>(null)
  const [jobs, setJobs] = useState<ArchiveUploadJob[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDraggingFiles, setIsDraggingFiles] = useState(false)
  const dragDepthRef = useRef(0)
  const uploadMutation = useUploadArchivePhotoMutation()
  const bulkMutation = useBulkArchivePhotoMutation()
  const uploadForm = useForm<UploadFormValues>({
    mode: "onSubmit",
    defaultValues: { year: new Date().getFullYear() },
  })
  const filterForm = useForm<FilterFormValues>({
    defaultValues: { year: null, status: "ALL" },
  })
  const bulkYearForm = useForm<BulkYearFormValues>({
    mode: "onSubmit",
    defaultValues: { year: new Date().getFullYear() },
  })
  const bulkStatusForm = useForm<BulkStatusFormValues>({
    mode: "onSubmit",
    defaultValues: { status: "PUBLISHED" },
  })
  const year = filterForm.watch("year")
  const status = filterForm.watch("status")
  const listQuery = useAdminPhotoArchiveInfinite({ year, status })
  const items = useMemo(
    () => listQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [listQuery.data?.pages],
  )
  const years = listQuery.data?.pages[0]?.years ?? []

  function handleFilesSelected(files: File[]) {
    if (isUploading) return
    const existingSignatures = new Set(
      jobs.map(
        (job) => `${job.file.name}:${job.file.size}:${job.file.lastModified}`,
      ),
    )
    const uniqueFiles = files.filter(
      (file) =>
        !existingSignatures.has(
          `${file.name}:${file.size}:${file.lastModified}`,
        ),
    )
    if (uniqueFiles.length === 0) {
      toast.error("이미 대기열에 있는 사진입니다.")
      return
    }
    const nextFiles = [...jobs.map((job) => job.file), ...uniqueFiles]
    const error = validateArchiveUploadSelection(nextFiles)
    if (error) {
      toast.error(error)
      return
    }
    setJobs((current) => [
      ...current,
      ...uniqueFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        status: "WAITING" as const,
      })),
    ])
    if (uniqueFiles.length < files.length) {
      toast.info("중복 선택한 사진은 대기열에서 제외했습니다.")
    }
  }

  function handleDragEnter() {
    if (isUploading) return
    dragDepthRef.current += 1
    setIsDraggingFiles(true)
  }

  function handleDragLeave() {
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (dragDepthRef.current === 0) setIsDraggingFiles(false)
  }

  function handleFilesDropped(files: File[]) {
    dragDepthRef.current = 0
    setIsDraggingFiles(false)
    handleFilesSelected(files)
  }

  const handleUpload = uploadForm.handleSubmit(async ({ year: uploadYear }) => {
    const yearResult = archivePhotoYearSchema.safeParse(Number(uploadYear))
    if (!yearResult.success) {
      uploadForm.setError("year", {
        message: yearResult.error.issues[0]?.message,
      })
      return
    }
    const pendingJobs = jobs.filter((job) => job.status !== "SUCCESS")
    if (pendingJobs.length === 0) {
      toast.error("업로드할 사진을 선택해 주세요.")
      return
    }

    setIsUploading(true)
    try {
      await runWithConcurrency(
        pendingJobs,
        PHOTO_ARCHIVE_UPLOAD_CONCURRENCY,
        async (job) => {
          setJobs((current) =>
            current.map((item) =>
              item.id === job.id
                ? { ...item, status: "UPLOADING", message: undefined }
                : item,
            ),
          )
          try {
            await uploadMutation.mutateAsync({
              file: job.file,
              year: yearResult.data,
            })
            setJobs((current) =>
              current.map((item) =>
                item.id === job.id ? { ...item, status: "SUCCESS" } : item,
              ),
            )
          } catch (error) {
            setJobs((current) =>
              current.map((item) =>
                item.id === job.id
                  ? {
                      ...item,
                      status: "FAILED",
                      message:
                        error instanceof Error
                          ? error.message
                          : "업로드에 실패했습니다.",
                    }
                  : item,
              ),
            )
          }
        },
      )
      await invalidatePhotoArchiveQueries(queryClient)
      toast.success("사진 업로드 처리가 끝났습니다.")
    } finally {
      setIsUploading(false)
    }
  })

  function togglePhoto(id: string) {
    setSelectedPhotoIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleVisiblePhotos(checked: boolean) {
    setSelectedPhotoIds((current) => {
      const next = new Set(current)
      for (const photo of items) {
        if (checked) next.add(photo.id)
        else next.delete(photo.id)
      }
      return next
    })
  }

  function handlePhotoDeleted(id: string) {
    setSelectedPhotoIds((current) => {
      const next = new Set(current)
      next.delete(id)
      return next
    })
    setSelectedPhoto((current) => (current?.id === id ? null : current))
  }

  async function runBulkAction(
    action: "CHANGE_STATUS" | "CHANGE_YEAR",
    options: { year?: number; status?: ArchivePhotoStatusDto },
  ) {
    const photoIds = [...selectedPhotoIds]
    if (photoIds.length === 0) {
      toast.error("작업할 사진을 선택해 주세요.")
      return
    }
    const label =
      action === "CHANGE_STATUS"
        ? options.status === "PUBLISHED"
          ? "공개 상태로 변경"
          : "숨김 상태로 변경"
        : `${options.year}년으로 변경`
    if (!window.confirm(`선택한 ${photoIds.length}장을 ${label}할까요?`)) return

    try {
      const count = await bulkMutation.mutateAsync({
        action,
        photoIds,
        year: options.year,
        status: options.status,
      })
      setSelectedPhotoIds(new Set())
      setSelectedPhoto(null)
      toast.success(`${count}장의 사진을 처리했습니다.`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "일괄 작업에 실패했습니다.",
      )
    }
  }

  const handleBulkYearChange = bulkYearForm.handleSubmit(async (values) => {
    const yearResult = archivePhotoYearSchema.safeParse(Number(values.year))
    if (!yearResult.success) {
      bulkYearForm.setError("year", {
        message: yearResult.error.issues[0]?.message,
      })
      return
    }
    await runBulkAction("CHANGE_YEAR", { year: yearResult.data })
  })

  const handleBulkStatusChange = bulkStatusForm.handleSubmit(
    async ({ status: bulkStatus }) => {
      await runBulkAction("CHANGE_STATUS", { status: bulkStatus })
    },
  )

  return (
    <AdminPhotoArchivePageView
      items={items}
      years={years}
      year={year}
      status={status}
      jobs={jobs}
      isUploading={isUploading}
      isDraggingFiles={isDraggingFiles}
      isBulkUpdating={bulkMutation.isPending}
      isLoading={listQuery.isLoading}
      isError={listQuery.isError}
      isFetchingNextPage={listQuery.isFetchingNextPage}
      hasNextPage={Boolean(listQuery.hasNextPage)}
      selectedPhotoIds={selectedPhotoIds}
      selectedPhoto={selectedPhoto}
      bulkStatus={bulkStatusForm.watch("status")}
      uploadYearRegistration={uploadForm.register("year", {
        valueAsNumber: true,
        required: "연도를 입력해 주세요.",
      })}
      uploadYearError={uploadForm.formState.errors.year?.message}
      bulkYearRegistration={bulkYearForm.register("year", {
        valueAsNumber: true,
        required: "변경할 연도를 입력해 주세요.",
      })}
      bulkYearError={bulkYearForm.formState.errors.year?.message}
      onYearFilterChange={(nextYear) => {
        filterForm.setValue("year", nextYear)
        setSelectedPhotoIds(new Set())
      }}
      onStatusFilterChange={(nextStatus) => {
        filterForm.setValue("status", nextStatus)
        setSelectedPhotoIds(new Set())
      }}
      onFilesSelected={handleFilesSelected}
      onFilesDropped={handleFilesDropped}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onUploadDialogOpenChange={(open) => {
        if (open) return
        dragDepthRef.current = 0
        setIsDraggingFiles(false)
      }}
      onUpload={handleUpload}
      onClearJobs={() => setJobs([])}
      onTogglePhoto={togglePhoto}
      onToggleVisiblePhotos={toggleVisiblePhotos}
      onSelectPhoto={setSelectedPhoto}
      onDeletePhoto={handlePhotoDeleted}
      onClearSelection={() => setSelectedPhotoIds(new Set())}
      onBulkStatusChange={(nextStatus) =>
        bulkStatusForm.setValue("status", nextStatus, {
          shouldValidate: true,
        })
      }
      onBulkStatusSubmit={handleBulkStatusChange}
      onBulkYearChange={handleBulkYearChange}
      onLoadMore={async () => {
        await listQuery.fetchNextPage()
      }}
    />
  )
}
