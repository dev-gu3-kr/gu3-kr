"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  ADMIN_MENU_PERMISSION_VALUES,
  type AdminMenuPermission,
  ASSIGNABLE_ADMIN_MENU_ITEMS,
} from "@/features/admin/isomorphic"
import {
  type CreateAdminUserInputDto,
  createAdminUserSchema,
  type UpdateAdminUserMenuPermissionsInputDto,
  updateAdminUserMenuPermissionsSchema,
  useAdminUsers,
  useCreateAdminUser,
  useDeleteAdminUser,
  useUpdateAdminUser,
} from "@/features/users/isomorphic"
import { UserManagerView } from "./UserManagerView"

const createFormDefaults: CreateAdminUserInputDto = {
  displayName: "",
  email: "",
  password: "",
  menuPermissions: [],
  isActive: true,
}

function updatePermissionSelection(
  current: readonly AdminMenuPermission[],
  permission: AdminMenuPermission,
  checked: boolean,
) {
  const next = new Set(current)
  if (checked) next.add(permission)
  else next.delete(permission)

  return ADMIN_MENU_PERMISSION_VALUES.filter((value) => next.has(value))
}

export function UserManagerContainer() {
  const usersQuery = useAdminUsers()
  const createMutation = useCreateAdminUser()
  const permissionMutation = useUpdateAdminUser()
  const passwordMutation = useUpdateAdminUser()
  const deleteMutation = useDeleteAdminUser()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [operationError, setOperationError] = useState<string | null>(null)

  const createForm = useForm<CreateAdminUserInputDto>({
    resolver: standardSchemaResolver(createAdminUserSchema),
    mode: "onSubmit",
    defaultValues: createFormDefaults,
  })
  const permissionForm = useForm<UpdateAdminUserMenuPermissionsInputDto>({
    resolver: standardSchemaResolver(updateAdminUserMenuPermissionsSchema),
    mode: "onSubmit",
    defaultValues: { menuPermissions: [] },
  })

  const createPermissions = createForm.watch("menuPermissions")
  const editingPermissions = permissionForm.watch("menuPermissions")
  const editingUser =
    usersQuery.data?.find((item) => item.id === editingUserId) ?? null
  const queryError =
    usersQuery.error instanceof Error ? usersQuery.error.message : null

  const handleCreateSubmit = createForm.handleSubmit(async (input) => {
    setOperationError(null)
    try {
      await createMutation.mutateAsync(input)
      toast.success("사용자를 등록했습니다.")
      createForm.reset(createFormDefaults)
      setIsCreateModalOpen(false)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "사용자 등록에 실패했습니다."
      setOperationError(message)
      toast.error(message)
    }
  })

  const handlePermissionSubmit = permissionForm.handleSubmit(async (input) => {
    if (!editingUserId) return

    setOperationError(null)
    try {
      await permissionMutation.mutateAsync({ id: editingUserId, input })
      toast.success("메뉴 권한을 저장했습니다.")
      setEditingUserId(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "권한 저장에 실패했습니다."
      setOperationError(message)
      toast.error(message)
    }
  })

  async function handleDelete(id: string) {
    if (!window.confirm("정말 삭제하시겠습니까?")) return

    setOperationError(null)
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("사용자를 삭제했습니다.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "사용자 삭제에 실패했습니다."
      setOperationError(message)
      toast.error(message)
    }
  }

  async function handleResetPassword(id: string) {
    const nextPassword = window.prompt("새 비밀번호를 입력하세요(8자 이상).")
    if (!nextPassword) return

    setOperationError(null)
    try {
      await passwordMutation.mutateAsync({
        id,
        input: { resetPassword: nextPassword },
      })
      toast.success("비밀번호를 초기화했습니다.")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "비밀번호 초기화에 실패했습니다."
      setOperationError(message)
      toast.error(message)
    }
  }

  function openPermissionModal(id: string) {
    const target = usersQuery.data?.find((item) => item.id === id)
    if (!target || target.role === "SUPER_ADMIN") return

    setOperationError(null)
    permissionForm.reset({ menuPermissions: target.menuPermissions })
    setEditingUserId(id)
  }

  return (
    <UserManagerView
      items={usersQuery.data ?? []}
      permissionOptions={ASSIGNABLE_ADMIN_MENU_ITEMS}
      isLoading={usersQuery.isLoading}
      message={operationError ?? queryError}
      isCreateModalOpen={isCreateModalOpen}
      editingUser={editingUser}
      createRegister={createForm.register}
      createErrors={createForm.formState.errors}
      createPermissions={createPermissions}
      editingPermissions={editingPermissions}
      permissionErrors={permissionForm.formState.errors}
      isCreating={createMutation.isPending}
      isSavingPermissions={permissionMutation.isPending}
      deletingUserId={
        deleteMutation.isPending ? deleteMutation.variables : null
      }
      resettingUserId={
        passwordMutation.isPending
          ? (passwordMutation.variables?.id ?? null)
          : null
      }
      onCreateModalOpenChange={(open) => {
        setIsCreateModalOpen(open)
        setOperationError(null)
        if (!open) createForm.reset(createFormDefaults)
      }}
      onPermissionModalOpenChange={(open) => {
        if (!open) setEditingUserId(null)
      }}
      onOpenPermissionModal={openPermissionModal}
      onCreateSubmit={handleCreateSubmit}
      onPermissionSubmit={handlePermissionSubmit}
      onCreatePermissionChange={(permission, checked) => {
        createForm.setValue(
          "menuPermissions",
          updatePermissionSelection(createPermissions, permission, checked),
          { shouldValidate: true },
        )
      }}
      onCreateAllPermissionsChange={(checked) => {
        createForm.setValue(
          "menuPermissions",
          checked ? [...ADMIN_MENU_PERMISSION_VALUES] : [],
          { shouldValidate: true },
        )
      }}
      onEditingPermissionChange={(permission, checked) => {
        permissionForm.setValue(
          "menuPermissions",
          updatePermissionSelection(editingPermissions, permission, checked),
          { shouldValidate: true },
        )
      }}
      onEditingAllPermissionsChange={(checked) => {
        permissionForm.setValue(
          "menuPermissions",
          checked ? [...ADMIN_MENU_PERMISSION_VALUES] : [],
          { shouldValidate: true },
        )
      }}
      onDelete={handleDelete}
      onResetPassword={handleResetPassword}
    />
  )
}
