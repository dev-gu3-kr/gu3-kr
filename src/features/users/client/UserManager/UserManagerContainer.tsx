"use client"

import type { UserRole } from "@prisma/client"
import { useCallback, useEffect, useState } from "react"
import type { AdminUserListItemDto } from "@/features/users/isomorphic"
import { apiFetch } from "@/lib/api"
import { UserManagerView } from "./UserManagerView"

type UserListResponse = {
  ok?: boolean
  items?: AdminUserListItemDto[]
  message?: string
}

const roleOptions: UserRole[] = ["ADMIN", "EDITOR", "VIEWER"]

export function UserManagerContainer() {
  const [items, setItems] = useState<AdminUserListItemDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("ADMIN")
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [resettingUserId, setResettingUserId] = useState<string | null>(null)

  const resetCreateForm = () => {
    setDisplayName("")
    setEmail("")
    setPassword("")
    setRole("ADMIN")
  }

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    setMessage(null)
    try {
      const response = await apiFetch.get("/api/admin/users").send()
      const json = (await response
        .json()
        .catch(() => null)) as UserListResponse | null
      if (!response.ok || !json?.ok || !Array.isArray(json.items)) {
        throw new Error(json?.message ?? "사용자 목록을 불러오지 못했습니다.")
      }
      setItems(json.items)
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "오류가 발생했습니다.",
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  async function handleCreate() {
    setMessage(null)

    if (!email.trim()) {
      setMessage("로그인 이메일은 필수입니다.")
      return
    }

    const response = await apiFetch
      .post("/api/admin/users")
      .json({
        displayName,
        email: email.trim(),
        password,
        role,
        isActive: true,
      })
      .send()

    const json = (await response.json().catch(() => null)) as {
      ok?: boolean
      message?: string
    } | null

    if (!response.ok || !json?.ok) {
      setMessage(json?.message ?? "사용자 등록에 실패했습니다.")
      return
    }

    resetCreateForm()
    setIsCreateModalOpen(false)
    setMessage("사용자를 등록했습니다.")
    await loadUsers()
  }

  async function handleDelete(id: string) {
    if (!window.confirm("정말 삭제하시겠습니까?")) return

    setDeletingUserId(id)
    try {
      const response = await apiFetch.del(`/api/admin/users/${id}`).send()
      const json = (await response.json().catch(() => null)) as {
        ok?: boolean
        message?: string
      } | null

      if (!response.ok || !json?.ok) {
        setMessage(json?.message ?? "삭제에 실패했습니다.")
        return
      }

      await loadUsers()
    } finally {
      setDeletingUserId(null)
    }
  }

  async function handleResetPassword(id: string) {
    const next = window.prompt("새 비밀번호를 입력하세요(8자 이상).")
    if (!next) return

    setResettingUserId(id)
    try {
      const response = await apiFetch
        .patch(`/api/admin/users/${id}`)
        .json({ resetPassword: next })
        .send()
      const json = (await response.json().catch(() => null)) as {
        ok?: boolean
        message?: string
      } | null

      if (!response.ok || !json?.ok) {
        setMessage(json?.message ?? "비밀번호 초기화에 실패했습니다.")
        return
      }

      setMessage("비밀번호를 초기화했습니다.")
    } finally {
      setResettingUserId(null)
    }
  }

  return (
    <UserManagerView
      items={items}
      isLoading={isLoading}
      message={message}
      isCreateModalOpen={isCreateModalOpen}
      displayName={displayName}
      email={email}
      password={password}
      role={role}
      roleOptions={roleOptions}
      deletingUserId={deletingUserId}
      resettingUserId={resettingUserId}
      onCreateModalOpenChange={(open) => {
        setIsCreateModalOpen(open)
        if (!open) resetCreateForm()
      }}
      onDisplayNameChange={setDisplayName}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onRoleChange={setRole}
      onCreate={handleCreate}
      onDelete={handleDelete}
      onResetPassword={handleResetPassword}
    />
  )
}
