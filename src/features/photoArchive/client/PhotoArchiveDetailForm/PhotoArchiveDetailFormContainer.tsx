"use client"

import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  type AdminArchivePhotoDto,
  type ArchivePhotoStatusDto,
  archivePhotoYearSchema,
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
  onClose,
}: {
  photo: AdminArchivePhotoDto
  onUpdated: (photo: AdminArchivePhotoDto) => void
  onClose: () => void
}) {
  const mutation = useUpdateArchivePhotoMutation()
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
      const updated = await mutation.mutateAsync({
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

  return (
    <PhotoArchiveDetailFormView
      photo={photo}
      registration={form.register}
      errors={form.formState.errors}
      isPending={mutation.isPending}
      status={form.watch("status")}
      onStatusChange={(status) =>
        form.setValue("status", status, { shouldValidate: true })
      }
      onSubmit={onSubmit}
      onClose={onClose}
    />
  )
}
