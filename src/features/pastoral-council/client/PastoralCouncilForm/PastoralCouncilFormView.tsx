"use client"

import { useForm } from "react-hook-form"
import { ImageCropUploadField } from "@/components/ImageCropUploadField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { UpsertPastoralCouncilInputDto } from "@/features/pastoral-council/isomorphic"

type Props = {
  initialValues?: UpsertPastoralCouncilInputDto
  onSubmitAction: (v: UpsertPastoralCouncilInputDto) => void
  onUploadImageAction: (file: File, previousUrl?: string) => Promise<string>
  onRemoveImageAction: (url: string) => Promise<void>
  submitLabel: string
  isLoading: boolean
  message: string | null
  isError: boolean
}

export function PastoralCouncilFormView({
  initialValues,
  onSubmitAction,
  onUploadImageAction,
  onRemoveImageAction,
  submitLabel,
  isLoading,
  message,
  isError,
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpsertPastoralCouncilInputDto>({
    defaultValues: initialValues ?? {
      name: "",
      baptismalName: "",
      duty: "",
      phone: "",
      imageUrl: "",
      isActive: true,
      sortOrder: 0,
    },
    mode: "onSubmit",
  })

  const imageUrl = watch("imageUrl")

  return (
    <form onSubmit={handleSubmit(onSubmitAction)} className="space-y-4">
      <input type="hidden" {...register("imageUrl")} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm">
            이름 <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            {...register("name", {
              validate: (v) => v.trim().length > 0 || "이름은 필수 입력입니다.",
            })}
            className={errors.name ? "border-red-500 ring-1 ring-red-500" : ""}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="baptismalName" className="text-sm">
            세례명
          </label>
          <Input id="baptismalName" {...register("baptismalName")} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="duty" className="text-sm">
            담당영역 <span className="text-red-500">*</span>
          </label>
          <Input
            id="duty"
            {...register("duty", {
              validate: (v) =>
                v.trim().length > 0 || "담당영역은 필수 입력입니다.",
            })}
            className={errors.duty ? "border-red-500 ring-1 ring-red-500" : ""}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="phone" className="text-sm">
            연락처 <span className="text-red-500">*</span>
          </label>
          <Input
            id="phone"
            {...register("phone", {
              validate: (v) =>
                v.trim().length > 0 || "연락처는 필수 입력입니다.",
            })}
            className={errors.phone ? "border-red-500 ring-1 ring-red-500" : ""}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ImageCropUploadField
          value={imageUrl}
          onUploadAction={onUploadImageAction}
          onRemoveImageAction={onRemoveImageAction}
          onChangeAction={(nextUrl) =>
            setValue("imageUrl", nextUrl, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          disabled={isLoading}
        />

        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="sortOrder" className="text-sm">
              정렬 순서
            </label>
            <Input
              id="sortOrder"
              type="number"
              min={0}
              {...register("sortOrder", { valueAsNumber: true })}
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Switch
              id="is-active"
              checked={Boolean(watch("isActive"))}
              onCheckedChange={(checked: boolean) =>
                setValue("isActive", checked, { shouldDirty: true })
              }
            />
            <label htmlFor="is-active" className="cursor-pointer">
              활성 상태
            </label>
          </div>
        </div>
      </div>

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
