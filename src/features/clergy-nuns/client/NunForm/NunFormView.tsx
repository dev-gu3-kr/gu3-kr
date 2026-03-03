"use client"

import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { UpsertNunInputDto } from "@/features/clergy-nuns/isomorphic"

type Props = {
  initialValues?: UpsertNunInputDto
  onSubmitAction: (v: UpsertNunInputDto) => void
  submitLabel: string
  isLoading: boolean
  message: string | null
  isError: boolean
}

export function NunFormView({
  initialValues,
  onSubmitAction,
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
    control,
    formState: { errors },
  } = useForm<UpsertNunInputDto>({
    defaultValues: initialValues ?? {
      name: "",
      baptismalName: "",
      duty: "",
      phone: "",
      imageUrl: "",
      isCurrent: true,
      sortOrder: 0,
    },
    mode: "onSubmit",
  })
  const [isNoTermEnd, setIsNoTermEnd] = useState(!initialValues?.termEnd)
  const termEnd = watch("termEnd")
  useEffect(() => {
    if (isNoTermEnd && termEnd)
      setValue("termEnd", undefined, { shouldDirty: true })
  }, [isNoTermEnd, setValue, termEnd])

  return (
    <form onSubmit={handleSubmit(onSubmitAction)} className="space-y-4">
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
            className={
              errors.name
                ? "w-full rounded-md border border-red-500 px-3 py-2 outline-none ring-1 ring-red-500"
                : "w-full rounded-md border px-3 py-2"
            }
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="baptismalName" className="text-sm">
            세례명 <span className="text-red-500">*</span>
          </label>
          <Input
            id="baptismalName"
            {...register("baptismalName", {
              validate: (v) =>
                (v ?? "").trim().length > 0 || "세례명은 필수 입력입니다.",
            })}
            className={
              errors.baptismalName
                ? "w-full rounded-md border border-red-500 px-3 py-2 outline-none ring-1 ring-red-500"
                : "w-full rounded-md border px-3 py-2"
            }
          />
        </div>
      </div>
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
          className={
            errors.duty
              ? "w-full rounded-md border border-red-500 px-3 py-2 outline-none ring-1 ring-red-500"
              : "w-full rounded-md border px-3 py-2"
          }
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-sm">
            축일(월) <span className="text-red-500">*</span>
          </p>
          <Controller
            name="feastMonth"
            control={control}
            rules={{
              validate: (v) =>
                (typeof v === "number" && !Number.isNaN(v)) ||
                "축일(월)은 필수 입력입니다.",
            }}
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
              >
                <SelectTrigger
                  className={
                    errors.feastMonth
                      ? "w-full border-red-500 ring-1 ring-red-500"
                      : "w-full"
                  }
                >
                  <SelectValue placeholder="월 선택" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {m}월
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1">
          <p className="text-sm">
            축일(일) <span className="text-red-500">*</span>
          </p>
          <Controller
            name="feastDay"
            control={control}
            rules={{
              validate: (v) =>
                (typeof v === "number" && !Number.isNaN(v)) ||
                "축일(일)은 필수 입력입니다.",
            }}
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
              >
                <SelectTrigger
                  className={
                    errors.feastDay
                      ? "w-full border-red-500 ring-1 ring-red-500"
                      : "w-full"
                  }
                >
                  <SelectValue placeholder="일 선택" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d}일
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="termStart" className="text-sm">
            재임기간 시작 <span className="text-red-500">*</span>
          </label>
          <Input
            id="termStart"
            type="datetime-local"
            {...register("termStart", {
              validate: (v) =>
                Boolean(v?.trim()) || "재임기간 시작은 필수 입력입니다.",
            })}
            className={
              errors.termStart
                ? "w-full rounded-md border border-red-500 px-3 py-2 outline-none ring-1 ring-red-500"
                : "w-full rounded-md border px-3 py-2"
            }
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="termEnd" className="text-sm">
              재임기간 종료
            </label>
            <label
              htmlFor="no-term-end"
              className="flex items-center gap-1 text-xs text-neutral-600"
            >
              <Checkbox
                id="no-term-end"
                checked={isNoTermEnd}
                onCheckedChange={(checked: boolean | "indeterminate") => {
                  const next = Boolean(checked)
                  setIsNoTermEnd(next)
                  if (next)
                    setValue("termEnd", undefined, { shouldDirty: true })
                }}
              />
              종료일 없음
            </label>
          </div>
          <Input
            id="termEnd"
            type="datetime-local"
            disabled={isNoTermEnd}
            {...register("termEnd")}
            className={
              isNoTermEnd
                ? "w-full rounded-md border bg-neutral-100 px-3 py-2 text-neutral-500"
                : "w-full rounded-md border px-3 py-2"
            }
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="phone" className="text-sm">
            연락처
          </label>
          <Input
            id="phone"
            {...register("phone")}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="imageUrl" className="text-sm">
            이미지 URL
          </label>
          <Input
            id="imageUrl"
            {...register("imageUrl")}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-2 text-sm">
          <Switch
            id="is-current"
            checked={Boolean(watch("isCurrent"))}
            onCheckedChange={(checked: boolean) =>
              setValue("isCurrent", checked, { shouldDirty: true })
            }
          />
          <label htmlFor="is-current" className="cursor-pointer">
            현직 여부
          </label>
        </div>
        <div className="space-y-1">
          <label htmlFor="sortOrder" className="text-sm">
            정렬순서
          </label>
          <Input
            id="sortOrder"
            type="number"
            {...register("sortOrder", { valueAsNumber: true })}
            className="w-full rounded-md border px-3 py-2"
          />
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
