"use client"

import type { UserRole } from "@prisma/client"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AdminUserListItemDto } from "@/features/users/isomorphic"
import { apiFetch } from "@/lib/api"

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
        throw new Error(json?.message ?? "사용자 목록을 불러오지 못했습니다.")
      }
      setItems(json.items)
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "오류가 발생했습니다.",
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
      setMessage("로그인 이메일은 필수입니다.")
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
      setMessage(json?.message ?? "사용자 등록에 실패했습니다.")
      return
    }

    resetCreateForm()
    setIsCreateModalOpen(false)
    setMessage("사용자를 등록했습니다.")
    await loadUsers()
  }

  async function handleDelete(id: string) {
    if (!window.confirm("정말 삭제하시겠습니까?")) return

    setDeletingUserId(id)
    try {
      const response = await apiFetch.del(`/api/admin/users/${id}`).send()
      const json = (await response.json().catch(() => null)) as {
        ok?: boolean
        message?: string
      } | null

      if (!response.ok || !json?.ok) {
        setMessage(json?.message ?? "삭제에 실패했습니다.")
        return
      }

      await loadUsers()
    } finally {
      setDeletingUserId(null)
    }
  }

  async function handleResetPassword(id: string) {
    const next = window.prompt("새 비밀번호를 입력하세요(8자 이상).")
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
        setMessage(json?.message ?? "비밀번호 초기화에 실패했습니다.")
        return
      }

      setMessage("비밀번호를 초기화했습니다.")
    } finally {
      setResettingUserId(null)
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between">
        <h2 className="font-medium">사용자 목록</h2>
        <Button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-black text-white hover:bg-black/90"
        >
          + 사용자 등록
        </Button>
      </section>

      {isLoading ? (
        <p className="text-sm text-neutral-500">불러오는 중...</p>
      ) : null}
      {message ? <p className="text-sm text-neutral-600">{message}</p> : null}

      {!isLoading && items.length === 0 ? (
        <p className="rounded-md border p-4 text-sm text-neutral-500">
          등록된 사용자가 없습니다.
        </p>
      ) : null}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-md border p-3 text-sm">
            <p className="font-medium">{item.displayName}</p>
            <p className="text-neutral-600">
              {item.email} · {item.role} · {item.isActive ? "활성" : "비활성"}
            </p>
            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleResetPassword(item.id)}
                disabled={
                  resettingUserId === item.id || deletingUserId === item.id
                }
              >
                {resettingUserId === item.id ? "처리 중..." : "비밀번호 초기화"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleDelete(item.id)}
                disabled={
                  deletingUserId === item.id || resettingUserId === item.id
                }
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                {deletingUserId === item.id ? "삭제 중..." : "삭제"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open)
          if (!open) resetCreateForm()
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>사용자 등록</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-2">
            <div className="space-y-1">
              <label
                htmlFor="user-display-name"
                className="text-sm font-medium"
              >
                표시 이름
              </label>
              <Input
                id="user-display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="표시 이름"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="user-email" className="text-sm font-medium">
                로그인 이메일
              </label>
              <Input
                id="user-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="로그인 이메일"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="user-password" className="text-sm font-medium">
                초기 비밀번호
              </label>
              <Input
                id="user-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="초기 비밀번호"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="user-role" className="text-sm font-medium">
                권한
              </label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
              >
                <SelectTrigger id="user-role">
                  <SelectValue placeholder="권한 선택" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="min-w-[96px]">
                취소
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={() => void handleCreate()}
              className="min-w-[96px] bg-black text-white hover:bg-black/90"
            >
              등록
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
