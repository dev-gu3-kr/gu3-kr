"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { ImageCropUploadField } from "@/components/ImageCropUploadField"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  type PastoralCouncilPlaceholderImageTypeDto,
  type PastoralCouncilPositionDto,
  pastoralCouncilDefaultPlaceholderImageType,
  pastoralCouncilPlaceholderImageTypeLabels,
  pastoralCouncilPlaceholderImageTypeValues,
  type UpsertPastoralCouncilInputDto,
} from "@/features/pastoral-council/isomorphic"

type Props = {
  initialValues?: UpsertPastoralCouncilInputDto
  positions: PastoralCouncilPositionDto[]
  isPositionLoading: boolean
  onSubmitAction: (value: UpsertPastoralCouncilInputDto) => void
  onUploadImageAction: (file: File, previousUrl?: string) => Promise<string>
  onRemoveImageAction: (url: string) => Promise<void>
  submitLabel: string
  isLoading: boolean
  message: string | null
}

export function PastoralCouncilFormView({
  initialValues,
  positions,
  isPositionLoading,
  onSubmitAction,
  onUploadImageAction,
  onRemoveImageAction,
  submitLabel,
  isLoading,
  message,
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpsertPastoralCouncilInputDto>({
    defaultValues: {
      positionId: initialValues?.positionId ?? "",
      name: "",
      baptismalName: "",
      phone: "",
      imageUrl: "",
      placeholderImageType: pastoralCouncilDefaultPlaceholderImageType,
      isActive: true,
      sortOrder: 0,
      ...initialValues,
    },
    mode: "onSubmit",
  })

  const imageUrl = watch("imageUrl")
  const positionId = watch("positionId")
  const placeholderImageType =
    watch("placeholderImageType") ?? pastoralCouncilDefaultPlaceholderImageType

  useEffect(() => {
    if (positionId || positions.length === 0) return
    setValue("positionId", positions[0]?.id ?? "", {
      shouldDirty: false,
      shouldValidate: true,
    })
  }, [positionId, positions, setValue])

  const positionUnavailable = isPositionLoading || positions.length === 0

  return (
    <form onSubmit={handleSubmit(onSubmitAction)}>
      <input type="hidden" {...register("imageUrl")} />

      <FieldGroup>
        <Field data-invalid={Boolean(errors.positionId)}>
          <FieldLabel htmlFor="positionId">
            직책 <span className="text-destructive">*</span>
          </FieldLabel>
          <Select
            value={positionId}
            disabled={isLoading || positionUnavailable}
            onValueChange={(value) =>
              setValue("positionId", value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger
              id="positionId"
              aria-invalid={Boolean(errors.positionId)}
            >
              <SelectValue placeholder="직책을 선택해 주세요." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {positions.map((position) => (
                  <SelectItem key={position.id} value={position.id}>
                    {position.title}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {positionUnavailable ? (
            <p className="text-sm text-muted-foreground">
              {isPositionLoading
                ? "직책 목록을 불러오는 중입니다."
                : "먼저 직책 관리 탭에서 직책을 등록해 주세요."}
            </p>
          ) : null}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="name">
              이름 <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="name"
              aria-invalid={Boolean(errors.name)}
              {...register("name", {
                validate: (value) =>
                  value.trim().length > 0 || "이름은 필수 입력입니다.",
              })}
            />
            <FieldError errors={errors.name ? [errors.name] : undefined} />
          </Field>
          <Field>
            <FieldLabel htmlFor="baptismalName">세례명</FieldLabel>
            <Input id="baptismalName" {...register("baptismalName")} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="phone">연락처</FieldLabel>
            <Input id="phone" {...register("phone")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="placeholderImageType">
              대체 이미지 <span className="text-destructive">*</span>
            </FieldLabel>
            <Select
              value={placeholderImageType}
              disabled={isLoading}
              onValueChange={(value) =>
                setValue(
                  "placeholderImageType",
                  value as PastoralCouncilPlaceholderImageTypeDto,
                  { shouldDirty: true, shouldValidate: true },
                )
              }
            >
              <SelectTrigger id="placeholderImageType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {pastoralCouncilPlaceholderImageTypeValues.map((type) => (
                    <SelectItem key={type} value={type}>
                      {pastoralCouncilPlaceholderImageTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field orientation="horizontal">
          <Switch
            id="is-active"
            checked={Boolean(watch("isActive"))}
            onCheckedChange={(checked) =>
              setValue("isActive", checked, { shouldDirty: true })
            }
          />
          <FieldLabel htmlFor="is-active">공개 활성 상태</FieldLabel>
        </Field>

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

        {message ? <p className="text-sm text-destructive">{message}</p> : null}

        <Button type="submit" disabled={isLoading || positionUnavailable}>
          {isLoading ? "저장 중..." : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  )
}
