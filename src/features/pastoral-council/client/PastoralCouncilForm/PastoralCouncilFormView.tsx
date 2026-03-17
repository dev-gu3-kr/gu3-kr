"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { ImageCropUploadField } from "@/components/ImageCropUploadField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  type PastoralCouncilPlaceholderImageTypeDto,
  type PastoralCouncilRoleDto,
  pastoralCouncilDefaultPlaceholderImageType,
  pastoralCouncilPlaceholderImageTypeLabels,
  pastoralCouncilPlaceholderImageTypeValues,
  pastoralCouncilRoleLabels,
  pastoralCouncilRoleValues,
  type UpsertPastoralCouncilInputDto,
} from "@/features/pastoral-council/isomorphic"

type Props = {
  initialValues?: UpsertPastoralCouncilInputDto
  roleOptions: PastoralCouncilRoleDto[]
  roleHelperMessage: string | null
  isRoleSelectionDisabled: boolean
  onSubmitAction: (v: UpsertPastoralCouncilInputDto) => void
  onUploadImageAction: (file: File, previousUrl?: string) => Promise<string>
  onRemoveImageAction: (url: string) => Promise<void>
  submitLabel: string
  isLoading: boolean
  isSubmitDisabled: boolean
  message: string | null
  isError: boolean
}

export function PastoralCouncilFormView({
  initialValues,
  roleOptions,
  roleHelperMessage,
  isRoleSelectionDisabled,
  onSubmitAction,
  onUploadImageAction,
  onRemoveImageAction,
  submitLabel,
  isLoading,
  isSubmitDisabled,
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
    defaultValues: {
      role: pastoralCouncilRoleValues[0],
      name: "",
      baptismalName: "",
      phone: "",
      imageUrl: "",
      placeholderImageType: pastoralCouncilDefaultPlaceholderImageType,
      isActive: true,
      ...initialValues,
    },
    mode: "onSubmit",
  })

  const imageUrl = watch("imageUrl")
  const placeholderImageType =
    watch("placeholderImageType") ?? pastoralCouncilDefaultPlaceholderImageType
  const selectedRole = watch("role")
  const resolvedSelectedRole =
    selectedRole && roleOptions.includes(selectedRole)
      ? selectedRole
      : undefined

  useEffect(() => {
    if (roleOptions.length === 0) return
    if (resolvedSelectedRole) return

    setValue("role", roleOptions[0], {
      shouldDirty: false,
      shouldValidate: true,
    })
  }, [resolvedSelectedRole, roleOptions, setValue])

  return (
    <form
      onSubmit={handleSubmit((values) => {
        if (isSubmitDisabled) return
        onSubmitAction(values)
      })}
      className="space-y-4"
    >
      <input type="hidden" {...register("imageUrl")} />

      <div className="space-y-1">
        <label htmlFor="role" className="text-sm">
          직책 <span className="text-red-500">*</span>
        </label>
        <Select
          value={resolvedSelectedRole}
          disabled={isRoleSelectionDisabled}
          onValueChange={(value) =>
            setValue("role", value as UpsertPastoralCouncilInputDto["role"], {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="직책을 선택해 주세요." />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.length > 0 ? (
              roleOptions.map((role) => (
                <SelectItem key={role} value={role}>
                  {pastoralCouncilRoleLabels[role]}
                </SelectItem>
              ))
            ) : (
              <p className="px-2 py-1.5 text-sm text-neutral-500">
                선택 가능한 직책이 없습니다.
              </p>
            )}
          </SelectContent>
        </Select>
        {roleHelperMessage ? (
          <p className="text-sm text-neutral-500">{roleHelperMessage}</p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm">
            이름 <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            {...register("name", {
              validate: (value) =>
                value.trim().length > 0 || "이름은 필수 입력입니다.",
            })}
            className={errors.name ? "border-red-500 ring-1 ring-red-500" : ""}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="baptismalName" className="text-sm">
            세례명
          </label>
          <Input id="baptismalName" {...register("baptismalName")} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="phone" className="text-sm">
            연락처
          </label>
          <Input id="phone" {...register("phone")} />
        </div>
        <div className="space-y-1">
          <label htmlFor="placeholderImageType" className="text-sm">
            대체 이미지 <span className="text-red-500">*</span>
          </label>
          <Select
            value={placeholderImageType}
            disabled={isLoading}
            onValueChange={(value) =>
              setValue(
                "placeholderImageType",
                value as PastoralCouncilPlaceholderImageTypeDto,
                {
                  shouldDirty: true,
                  shouldValidate: true,
                },
              )
            }
          >
            <SelectTrigger id="placeholderImageType">
              <SelectValue placeholder="대체 이미지를 선택해 주세요." />
            </SelectTrigger>
            <SelectContent>
              {pastoralCouncilPlaceholderImageTypeValues.map((type) => (
                <SelectItem key={type} value={type}>
                  {pastoralCouncilPlaceholderImageTypeLabels[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-neutral-500">
            프로필 이미지가 없을 때 사용자 화면에 표시됩니다.
          </p>
        </div>
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
          활성 상태
        </label>
      </div>

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
        disabled={isLoading || isSubmitDisabled}
        className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-60 sm:w-auto"
      >
        {isLoading ? "저장 중..." : submitLabel}
      </Button>
    </form>
  )
}
