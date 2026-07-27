import type { FormEventHandler } from "react"
import type { FieldErrors, UseFormRegister } from "react-hook-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import type {
  AdminMenuItem,
  AdminMenuPermission,
} from "@/features/admin/isomorphic"
import type {
  AdminUserListItemDto,
  CreateAdminUserInputDto,
  UpdateAdminUserMenuPermissionsInputDto,
} from "@/features/users/isomorphic"

type PermissionOption = AdminMenuItem & {
  permission: AdminMenuPermission
}

type UserManagerViewProps = {
  items: AdminUserListItemDto[]
  permissionOptions: PermissionOption[]
  isLoading: boolean
  message: string | null
  isCreateModalOpen: boolean
  editingUser: AdminUserListItemDto | null
  createRegister: UseFormRegister<CreateAdminUserInputDto>
  createErrors: FieldErrors<CreateAdminUserInputDto>
  createPermissions: AdminMenuPermission[]
  editingPermissions: AdminMenuPermission[]
  permissionErrors: FieldErrors<UpdateAdminUserMenuPermissionsInputDto>
  isCreating: boolean
  isSavingPermissions: boolean
  deletingUserId: string | null
  resettingUserId: string | null
  onCreateModalOpenChange: (open: boolean) => void
  onPermissionModalOpenChange: (open: boolean) => void
  onOpenPermissionModal: (id: string) => void
  onCreateSubmit: FormEventHandler<HTMLFormElement>
  onPermissionSubmit: FormEventHandler<HTMLFormElement>
  onCreatePermissionChange: (
    permission: AdminMenuPermission,
    checked: boolean,
  ) => void
  onCreateAllPermissionsChange: (checked: boolean) => void
  onEditingPermissionChange: (
    permission: AdminMenuPermission,
    checked: boolean,
  ) => void
  onEditingAllPermissionsChange: (checked: boolean) => void
  onDelete: (id: string) => Promise<void>
  onResetPassword: (id: string) => Promise<void>
}

function getAllCheckedState(
  selectedCount: number,
  optionCount: number,
): boolean | "indeterminate" {
  if (selectedCount === 0) return false
  if (selectedCount === optionCount) return true
  return "indeterminate"
}

type PermissionFieldsProps = {
  idPrefix: string
  permissionOptions: PermissionOption[]
  selectedPermissions: AdminMenuPermission[]
  errorMessage?: string
  disabled: boolean
  onPermissionChange: (
    permission: AdminMenuPermission,
    checked: boolean,
  ) => void
  onAllPermissionsChange: (checked: boolean) => void
}

function PermissionFields({
  idPrefix,
  permissionOptions,
  selectedPermissions,
  errorMessage,
  disabled,
  onPermissionChange,
  onAllPermissionsChange,
}: PermissionFieldsProps) {
  const allCheckedState = getAllCheckedState(
    selectedPermissions.length,
    permissionOptions.length,
  )

  return (
    <FieldSet data-invalid={Boolean(errorMessage)}>
      <FieldLegend>
        메뉴 권한 <span className="text-destructive">*</span>
      </FieldLegend>
      <FieldDescription>
        선택한 메뉴의 조회·등록·수정·삭제 권한이 함께 부여됩니다.
      </FieldDescription>
      <Field orientation="horizontal" className="justify-end">
        <FieldLabel htmlFor={`${idPrefix}-all`} className="flex-none">
          전체 선택
        </FieldLabel>
        <Checkbox
          id={`${idPrefix}-all`}
          checked={allCheckedState}
          disabled={disabled}
          onCheckedChange={(checked) =>
            onAllPermissionsChange(checked === true)
          }
        />
      </Field>
      <FieldGroup
        data-slot="checkbox-group"
        className="grid gap-3 sm:grid-cols-2"
      >
        {permissionOptions.map((option) => {
          const checkboxId = `${idPrefix}-${option.permission.toLowerCase()}`
          return (
            <Field
              key={option.permission}
              orientation="horizontal"
              className="items-start rounded-md border p-3"
            >
              <Checkbox
                id={checkboxId}
                checked={selectedPermissions.includes(option.permission)}
                disabled={disabled}
                onCheckedChange={(checked) =>
                  onPermissionChange(option.permission, checked === true)
                }
              />
              <FieldContent>
                <FieldLabel htmlFor={checkboxId}>{option.label}</FieldLabel>
                <FieldDescription>{option.description}</FieldDescription>
              </FieldContent>
            </Field>
          )
        })}
      </FieldGroup>
      <FieldError>{errorMessage}</FieldError>
    </FieldSet>
  )
}

export function UserManagerView({
  items,
  permissionOptions,
  isLoading,
  message,
  isCreateModalOpen,
  editingUser,
  createRegister,
  createErrors,
  createPermissions,
  editingPermissions,
  permissionErrors,
  isCreating,
  isSavingPermissions,
  deletingUserId,
  resettingUserId,
  onCreateModalOpenChange,
  onPermissionModalOpenChange,
  onOpenPermissionModal,
  onCreateSubmit,
  onPermissionSubmit,
  onCreatePermissionChange,
  onCreateAllPermissionsChange,
  onEditingPermissionChange,
  onEditingAllPermissionsChange,
  onDelete,
  onResetPassword,
}: UserManagerViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex items-center justify-between gap-3">
        <h2 className="font-medium">사용자 목록</h2>
        <Button type="button" onClick={() => onCreateModalOpenChange(true)}>
          + 사용자 등록
        </Button>
      </section>

      {message ? (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      ) : null}

      {isLoading ? (
        <output
          className="flex flex-col gap-2"
          aria-label="사용자 목록 불러오는 중"
        >
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </output>
      ) : null}

      {!isLoading && items.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>등록된 사용자가 없습니다.</EmptyTitle>
            <EmptyDescription>
              사용자 등록 버튼을 눌러 첫 관리자를 추가해 주세요.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const isSuperAdmin = item.role === "SUPER_ADMIN"
          const itemPermissionOptions = isSuperAdmin
            ? permissionOptions
            : permissionOptions.filter((option) =>
                item.menuPermissions.includes(option.permission),
              )

          return (
            <article
              key={item.id}
              className="flex flex-col gap-3 rounded-md border p-4 text-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{item.displayName}</p>
                  <p className="text-muted-foreground">{item.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={isSuperAdmin ? "default" : "secondary"}>
                    {isSuperAdmin ? "최고 관리자" : "일반 관리자"}
                  </Badge>
                  <Badge variant="outline">
                    {item.isActive ? "활성" : "비활성"}
                  </Badge>
                </div>
              </div>

              <fieldset className="flex flex-wrap gap-1.5">
                <legend className="sr-only">허용된 메뉴</legend>
                {itemPermissionOptions.map((option) => (
                  <Badge key={option.permission} variant="outline">
                    {option.label}
                  </Badge>
                ))}
              </fieldset>

              <div className="flex flex-wrap gap-2">
                {!isSuperAdmin ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenPermissionModal(item.id)}
                    disabled={
                      deletingUserId === item.id || resettingUserId === item.id
                    }
                  >
                    메뉴 권한 설정
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void onResetPassword(item.id)}
                  disabled={
                    resettingUserId === item.id || deletingUserId === item.id
                  }
                >
                  {resettingUserId === item.id
                    ? "처리 중..."
                    : "비밀번호 초기화"}
                </Button>
                {!isSuperAdmin ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void onDelete(item.id)}
                    disabled={
                      deletingUserId === item.id || resettingUserId === item.id
                    }
                    className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    {deletingUserId === item.id ? "삭제 중..." : "삭제"}
                  </Button>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={onCreateModalOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>사용자 등록</DialogTitle>
            <DialogDescription>
              계정 정보와 접근할 관리 메뉴를 함께 설정합니다.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={onCreateSubmit}
            noValidate
            className="flex flex-col gap-6"
          >
            <FieldGroup className="gap-4">
              <Field data-invalid={Boolean(createErrors.displayName)}>
                <FieldLabel htmlFor="user-display-name">
                  표시 이름 <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="user-display-name"
                  autoComplete="name"
                  aria-invalid={Boolean(createErrors.displayName)}
                  {...createRegister("displayName")}
                />
                <FieldError>{createErrors.displayName?.message}</FieldError>
              </Field>
              <Field data-invalid={Boolean(createErrors.email)}>
                <FieldLabel htmlFor="user-email">
                  로그인 이메일 <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="user-email"
                  type="email"
                  autoComplete="username"
                  aria-invalid={Boolean(createErrors.email)}
                  {...createRegister("email")}
                />
                <FieldError>{createErrors.email?.message}</FieldError>
              </Field>
              <Field data-invalid={Boolean(createErrors.password)}>
                <FieldLabel htmlFor="user-password">
                  초기 비밀번호 <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="user-password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(createErrors.password)}
                  {...createRegister("password")}
                />
                <FieldError>{createErrors.password?.message}</FieldError>
              </Field>
            </FieldGroup>

            <PermissionFields
              idPrefix="create-permission"
              permissionOptions={permissionOptions}
              selectedPermissions={createPermissions}
              errorMessage={createErrors.menuPermissions?.message}
              disabled={isCreating}
              onPermissionChange={onCreatePermissionChange}
              onAllPermissionsChange={onCreateAllPermissionsChange}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isCreating}>
                  취소
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "등록 중..." : "등록"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingUser)}
        onOpenChange={onPermissionModalOpenChange}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>메뉴 권한 설정</DialogTitle>
            <DialogDescription>
              {editingUser?.displayName ?? "사용자"}님이 접근할 관리 메뉴를
              선택합니다.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={onPermissionSubmit}
            noValidate
            className="flex flex-col gap-6"
          >
            <PermissionFields
              idPrefix="edit-permission"
              permissionOptions={permissionOptions}
              selectedPermissions={editingPermissions}
              errorMessage={permissionErrors.menuPermissions?.message}
              disabled={isSavingPermissions}
              onPermissionChange={onEditingPermissionChange}
              onAllPermissionsChange={onEditingAllPermissionsChange}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSavingPermissions}
                >
                  취소
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSavingPermissions}>
                {isSavingPermissions ? "저장 중..." : "저장"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
