"use client"

import { Controller, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { DateTimePicker } from "./DateTimePicker"

type EventWriteFormValues = {
  title: string
  description: string
  startsAt: string
  endsAt: string
  isPublished: boolean
}

type EventWriteFormViewProps = {
  onSubmitAction: (values: EventWriteFormValues) => Promise<void>
  isLoading: boolean
  message: string | null
  isError: boolean
  initialValues?: Partial<EventWriteFormValues>
  submitLabel?: string
}

// 일정 작성/수정 폼 UI: 제목/내용/일시 필드를 검증하고 종료일 유효성을 보장한다.
export function EventWriteFormView({
  onSubmitAction,
  isLoading,
  message,
  isError,
  initialValues,
  submitLabel = "일정 저장",
}: EventWriteFormViewProps) {
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventWriteFormValues>({
    defaultValues: {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      startsAt: initialValues?.startsAt ?? "",
      endsAt: initialValues?.endsAt ?? "",
      isPublished: initialValues?.isPublished ?? true,
    },
    mode: "onSubmit",
  })

  const startsAt = watch("startsAt")

  return (
    <form onSubmit={handleSubmit(onSubmitAction)} className="space-y-4">
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
          className={errors.title ? "border-red-500 ring-1 ring-red-500" : ""}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="text-sm">
          내용 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          rows={5}
          {...register("description", {
            validate: (value) =>
              value.trim().length > 0 || "내용은 필수 입력입니다.",
          })}
          className={
            errors.description
              ? "w-full rounded-md border border-red-500 px-3 py-2 ring-1 ring-red-500"
              : "w-full rounded-md border px-3 py-2"
          }
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Controller
          name="startsAt"
          control={control}
          rules={{
            validate: (value) =>
              value.trim().length > 0 || "시작일시는 필수 입력입니다.",
          }}
          render={({ field }) => (
            <DateTimePicker
              id="startsAt"
              label="시작일시"
              value={field.value}
              onChange={(next) => {
                field.onChange(next)
                const currentEnd = watch("endsAt")
                if (!currentEnd || currentEnd < next) {
                  setValue("endsAt", next, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              }}
              errorMessage={errors.startsAt?.message}
            />
          )}
        />

        <Controller
          name="endsAt"
          control={control}
          rules={{
            validate: (value) => {
              if (!value.trim()) return "종료일시는 필수 입력입니다."
              if (startsAt && value < startsAt)
                return "종료일시는 시작일시보다 빠를 수 없습니다."
              return true
            },
          }}
          render={({ field }) => (
            <DateTimePicker
              id="endsAt"
              label="종료일시"
              value={field.value}
              onChange={field.onChange}
              min={startsAt || undefined}
              errorMessage={errors.endsAt?.message}
            />
          )}
        />
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
