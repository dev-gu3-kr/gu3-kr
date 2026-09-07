"use client"

import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  type AdminArchivePhotoDto,
  type ArchivePhotoStatusDto,
  archivePhotoYearSchema,
  useDeleteArchivePhotoMutation,
  useUpdateArchivePhotoMutation,
} from "@/features/photoArchive/isomorphic"
import { PhotoArchiveDetailFormView } from "./PhotoArchiveDetailFormView"

type Values = {
  year: number
  caption: string
  altText: string
  status: ArchivePhotoStatusDto
}

export function PhotoArchiveDetailFormContainer({
  photo,
  onUpdated,
  onDeleted,
  onClose,
}: {
  photo: AdminArchivePhotoDto
  onUpdated: (photo: AdminArchivePhotoDto) => void
  onDeleted: (id: string) => void
  onClose: () => void
}) {
  const updateMutation = useUpdateArchivePhotoMutation()
  const deleteMutation = useDeleteArchivePhotoMutation()
  const form = useForm<Values>({
    mode: "onSubmit",
    defaultValues: {
      year: photo.year,
      caption: photo.caption ?? "",
      altText: photo.altText ?? "",
      status: photo.status,
    },
  })
  const onSubmit = form.handleSubmit(async (values) => {
    const yearResult = archivePhotoYearSchema.safeParse(Number(values.year))
    if (!yearResult.success) {
      form.setError("year", { message: yearResult.error.issues[0]?.message })
      return
    }
    try {
      const updated = await updateMutation.mutateAsync({
        id: photo.id,
        year: yearResult.data,
        caption: values.caption.trim() || null,
        altText: values.altText.trim() || null,
        status: values.status,
      })
      onUpdated(updated)
      toast.success("사진 정보를 저장했습니다.")
      onClose()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "저장하지 못했습니다.",
      )
    }
  })

  async function handleDelete() {
    const confirmed = window.confirm(
      `‘${photo.originalName}’ 사진을 삭제할까요?\n원본과 화면용 이미지도 함께 삭제되며 복구할 수 없습니다.`,
    )
    if (!confirmed) return

    try {
      const result = await deleteMutation.mutateAsync(photo.id)
      onDeleted(result.id)
      if (result.cleanupPending) {
        toast.warning(
          "사진은 삭제했지만 저장소 파일 일부는 후속 정리가 필요합니다.",
        )
      } else {
        toast.success("사진을 삭제했습니다.")
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "사진을 삭제하지 못했습니다.",
      )
    }
  }

  return (
    <PhotoArchiveDetailFormView
      photo={photo}
      registration={form.register}
      errors={form.formState.errors}
      isSaving={updateMutation.isPending}
      isDeleting={deleteMutation.isPending}
      status={form.watch("status")}
      onStatusChange={(status) =>
        form.setValue("status", status, { shouldValidate: true })
      }
      onSubmit={onSubmit}
      onDelete={handleDelete}
      onClose={onClose}
    />
  )
}
