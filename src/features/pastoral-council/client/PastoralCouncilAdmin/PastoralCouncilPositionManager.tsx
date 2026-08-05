"use client"

import { useQueryClient } from "@tanstack/react-query"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  buildPastoralCouncilPositionTree,
  type PastoralCouncilPlaceholderImageTypeDto,
  type PastoralCouncilPositionDto,
  type PastoralCouncilPositionTreeNodeDto,
  pastoralCouncilDefaultPlaceholderImageType,
  pastoralCouncilPlaceholderImageTypeLabels,
  pastoralCouncilPlaceholderImageTypeValues,
  pastoralCouncilQueryKeys,
  publicPastoralCouncilQueryKeys,
  type UpsertPastoralCouncilPositionInputDto,
  usePastoralCouncilPositionsQuery,
} from "@/features/pastoral-council/isomorphic"
import { apiFetch } from "@/lib/api"

const ROOT_POSITION_VALUE = "__root__"

function PositionTreeRows({
  nodes,
  depth = 0,
  onEditAction,
}: {
  nodes: readonly PastoralCouncilPositionTreeNodeDto[]
  depth?: number
  onEditAction: (position: PastoralCouncilPositionDto) => void
}) {
  return nodes.map((node) => (
    <div key={node.id}>
      <button
        type="button"
        onClick={() => onEditAction(node)}
        className="flex min-h-14 w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ paddingLeft: `${12 + depth * 24}px` }}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{node.title}</span>
          <span className="block text-xs text-muted-foreground">
            구성원 {node.memberCount}명 · 순서 {node.sortOrder}
          </span>
        </span>
        {!node.isActive ? <Badge variant="outline">비공개</Badge> : null}
        <Pencil aria-hidden="true" />
      </button>
      {node.children.length > 0 ? (
        <PositionTreeRows
          nodes={node.children}
          depth={depth + 1}
          onEditAction={onEditAction}
        />
      ) : null}
    </div>
  ))
}

function getUnavailableParentIds(
  positions: readonly PastoralCouncilPositionDto[],
  editingId?: string,
) {
  if (!editingId) return new Set<string>()

  const unavailable = new Set<string>([editingId])
  let changed = true
  while (changed) {
    changed = false
    for (const position of positions) {
      if (
        position.parentId &&
        unavailable.has(position.parentId) &&
        !unavailable.has(position.id)
      ) {
        unavailable.add(position.id)
        changed = true
      }
    }
  }
  return unavailable
}

function PositionFormDialog({
  open,
  positions,
  editingPosition,
  isSaving,
  onOpenChangeAction,
  onSubmitAction,
  onDeleteAction,
}: {
  open: boolean
  positions: readonly PastoralCouncilPositionDto[]
  editingPosition: PastoralCouncilPositionDto | null
  isSaving: boolean
  onOpenChangeAction: (open: boolean) => void
  onSubmitAction: (value: UpsertPastoralCouncilPositionInputDto) => void
  onDeleteAction: (position: PastoralCouncilPositionDto) => void
}) {
  const {
    register,
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpsertPastoralCouncilPositionInputDto>({ mode: "onSubmit" })

  useEffect(() => {
    if (!open) return

    reset({
      title: editingPosition?.title ?? "",
      parentId: editingPosition?.parentId ?? null,
      sortOrder: editingPosition?.sortOrder ?? 0,
      isActive: editingPosition?.isActive ?? true,
      defaultPlaceholderImageType:
        editingPosition?.defaultPlaceholderImageType ??
        pastoralCouncilDefaultPlaceholderImageType,
    })
  }, [editingPosition, open, reset])

  const unavailableParentIds = getUnavailableParentIds(
    positions,
    editingPosition?.id,
  )
  const parentId = watch("parentId") ?? null
  const placeholderImageType =
    watch("defaultPlaceholderImageType") ??
    pastoralCouncilDefaultPlaceholderImageType

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingPosition ? "직책 수정" : "새 직책 추가"}
          </DialogTitle>
          <DialogDescription>
            상위 직책과 순서가 공개 조직도의 단계와 배치를 결정합니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitAction)}>
          <FieldGroup className="mt-6">
            <Field data-invalid={Boolean(errors.title)}>
              <FieldLabel htmlFor="position-title">
                직책명 <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="position-title"
                aria-invalid={Boolean(errors.title)}
                {...register("title", {
                  validate: (value) =>
                    value.trim().length > 0 || "직책명은 필수 입력입니다.",
                })}
              />
              <FieldError errors={errors.title ? [errors.title] : undefined} />
            </Field>

            <Field>
              <FieldLabel htmlFor="parent-position">상위 직책</FieldLabel>
              <Select
                value={parentId ?? ROOT_POSITION_VALUE}
                onValueChange={(value) =>
                  setValue(
                    "parentId",
                    value === ROOT_POSITION_VALUE ? null : value,
                    { shouldDirty: true, shouldValidate: true },
                  )
                }
              >
                <SelectTrigger id="parent-position">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={ROOT_POSITION_VALUE}>
                      최상위 직책
                    </SelectItem>
                    {positions
                      .filter(
                        (position) => !unavailableParentIds.has(position.id),
                      )
                      .map((position) => (
                        <SelectItem key={position.id} value={position.id}>
                          {position.title}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="position-order">노출 순서</FieldLabel>
                <Input
                  id="position-order"
                  type="number"
                  min={0}
                  max={9999}
                  {...register("sortOrder", { valueAsNumber: true })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="position-placeholder">
                  공석 대체 이미지
                </FieldLabel>
                <Select
                  value={placeholderImageType}
                  onValueChange={(value) =>
                    setValue(
                      "defaultPlaceholderImageType",
                      value as PastoralCouncilPlaceholderImageTypeDto,
                      { shouldDirty: true },
                    )
                  }
                >
                  <SelectTrigger id="position-placeholder">
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
                id="position-active"
                checked={Boolean(watch("isActive"))}
                onCheckedChange={(checked) =>
                  setValue("isActive", checked, { shouldDirty: true })
                }
              />
              <FieldLabel htmlFor="position-active">
                공개 조직도에 표시
              </FieldLabel>
            </Field>

            <DialogFooter>
              {editingPosition ? (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isSaving}
                  onClick={() => onDeleteAction(editingPosition)}
                >
                  <Trash2 data-icon="inline-start" />
                  삭제
                </Button>
              ) : null}
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "저장 중..." : "저장"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function PastoralCouncilPositionManager() {
  const { data, isLoading, isError } = usePastoralCouncilPositionsQuery()
  const positions = data ?? []
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPosition, setEditingPosition] =
    useState<PastoralCouncilPositionDto | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const roots = buildPastoralCouncilPositionTree({ positions, members: [] })

  async function refreshPositionData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: pastoralCouncilQueryKeys.positions(),
      }),
      queryClient.invalidateQueries({
        queryKey: pastoralCouncilQueryKeys.lists(),
      }),
      queryClient.invalidateQueries({
        queryKey: publicPastoralCouncilQueryKeys.detail(),
      }),
    ])
  }

  async function handleSubmit(value: UpsertPastoralCouncilPositionInputDto) {
    setIsSaving(true)
    try {
      const response = editingPosition
        ? await apiFetch
            .patch(
              `/api/admin/pastoral-council/positions/${editingPosition.id}`,
            )
            .json(value)
            .send()
        : await apiFetch
            .post("/api/admin/pastoral-council/positions")
            .json(value)
            .send()
      const json = (await response.json().catch(() => null)) as {
        ok?: boolean
        message?: string
      } | null
      if (!response.ok || !json?.ok) {
        throw new Error(json?.message ?? "직책 저장에 실패했습니다.")
      }

      await refreshPositionData()
      toast.success(
        editingPosition ? "직책이 수정되었습니다." : "직책이 추가되었습니다.",
      )
      setDialogOpen(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "직책 저장에 실패했습니다.",
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(position: PastoralCouncilPositionDto) {
    if (!window.confirm(`‘${position.title}’ 직책을 삭제할까요?`)) return

    setIsSaving(true)
    try {
      const response = await apiFetch
        .del(`/api/admin/pastoral-council/positions/${position.id}`)
        .send()
      const json = (await response.json().catch(() => null)) as {
        ok?: boolean
        message?: string
      } | null
      if (!response.ok || !json?.ok) {
        throw new Error(json?.message ?? "직책 삭제에 실패했습니다.")
      }

      await refreshPositionData()
      toast.success("직책이 삭제되었습니다.")
      setDialogOpen(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "직책 삭제에 실패했습니다.",
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>직책 구조</CardTitle>
          <CardDescription>
            항목을 선택해 이름·상위 직책·순서를 수정할 수 있습니다.
          </CardDescription>
          <CardAction>
            <Button
              type="button"
              onClick={() => {
                setEditingPosition(null)
                setDialogOpen(true)
              }}
            >
              <Plus data-icon="inline-start" />
              직책 추가
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80 rounded-xl bg-muted" />
          ) : isError ? (
            <p className="text-sm text-destructive">
              직책 목록을 불러오지 못했습니다.
            </p>
          ) : roots.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              등록된 직책이 없습니다. 첫 직책을 추가해 주세요.
            </div>
          ) : (
            <div className="divide-y rounded-xl border p-1">
              <PositionTreeRows
                nodes={roots}
                onEditAction={(position) => {
                  setEditingPosition(position)
                  setDialogOpen(true)
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <PositionFormDialog
        open={dialogOpen}
        positions={positions}
        editingPosition={editingPosition}
        isSaving={isSaving}
        onOpenChangeAction={setDialogOpen}
        onSubmitAction={handleSubmit}
        onDeleteAction={handleDelete}
      />
    </>
  )
}
